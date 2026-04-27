"""
=============================================================================
Recommendation Engine for BizConnect
=============================================================================
Reads real order/product data from MongoDB and provides:
- Content-based recommendations (category affinity)
- Collaborative filtering (similar users)
=============================================================================
"""

import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from bson import ObjectId


class RecommendationEngine:
    """Product recommendation engine using MongoDB order data."""

    def __init__(self, db):
        self.db = db
        self._load_data()

    @staticmethod
    def _native(val):
        """Convert numpy types to native Python for JSON serialization."""
        if isinstance(val, (np.integer,)):
            return int(val)
        if isinstance(val, (np.floating,)):
            return float(val)
        return val

    def _load_data(self):
        """Load orders, products, users from MongoDB into DataFrames."""
        # Load orders
        orders = list(self.db.orders.find({}))
        if not orders:
            self.orders_df = pd.DataFrame()
            self.products_df = pd.DataFrame()
            self.user_item_matrix = None
            return

        # Flatten order items
        rows = []
        for order in orders:
            for item in order.get('items', []):
                rows.append({
                    'order_id': str(order['_id']),
                    'buyer_id': str(order['buyerId']),
                    'seller_id': str(order['sellerId']),
                    'product_id': str(item.get('productId', '')),
                    'product_name': item.get('name', ''),
                    'quantity': item.get('quantity', 1),
                    'price': item.get('price', 0),
                    'total': item.get('price', 0) * item.get('quantity', 1),
                    'order_date': order.get('createdAt', None),
                    'order_status': order.get('orderStatus', ''),
                })
        self.orders_df = pd.DataFrame(rows)

        # Load products
        products = list(self.db.products.find({'isApproved': True}))
        self.products_df = pd.DataFrame([{
            'product_id': str(p['_id']),
            'name': p['name'],
            'category': p['category'],
            'price': p['price'],
            'description': p.get('description', ''),
            'stock': p.get('stock', 0),
            'seller_id': str(p['sellerId']),
        } for p in products])

        # Build user-item matrix for collaborative filtering
        if len(self.orders_df) > 0:
            purchase_counts = (self.orders_df.groupby(['buyer_id', 'product_name'])
                               .size().reset_index(name='count'))
            self.user_item_matrix = purchase_counts.pivot_table(
                index='buyer_id', columns='product_name',
                values='count', fill_value=0
            )
        else:
            self.user_item_matrix = None

    def get_content_based_recommendations(self, user_id, n=6):
        """Recommend products based on user's category preferences."""
        if self.orders_df.empty or self.products_df.empty:
            return []

        user_id_str = str(user_id)
        user_orders = self.orders_df[self.orders_df['buyer_id'] == user_id_str]

        if user_orders.empty:
            # New user — return popular products
            return self._get_popular_products(n)

        # Find user's favorite categories
        purchased_products = user_orders['product_name'].unique().tolist()
        purchased_with_cats = user_orders.merge(
            self.products_df[['name', 'category']].rename(columns={'name': 'product_name'}),
            on='product_name', how='left'
        )
        cat_counts = purchased_with_cats['category'].value_counts()
        total = cat_counts.sum()

        # Score all products user hasn't bought
        candidates = self.products_df[~self.products_df['name'].isin(purchased_products)].copy()
        if candidates.empty:
            return self._get_popular_products(n)

        scores = []
        fav_cat = cat_counts.index[0] if len(cat_counts) > 0 else None

        for _, prod in candidates.iterrows():
            score = 0
            if prod['category'] == fav_cat:
                score += 50
            elif prod['category'] in cat_counts.index:
                score += 30 * (cat_counts[prod['category']] / total)

            # Popularity bonus
            prod_orders = len(self.orders_df[self.orders_df['product_name'] == prod['name']])
            score += 5 * np.log1p(prod_orders)
            scores.append(score)

        candidates = candidates.copy()
        candidates['score'] = scores
        top = candidates.sort_values('score', ascending=False).head(n)

        return [{
            'productId': row['product_id'],
            'name': row['name'],
            'category': row['category'],
            'price': self._native(row['price']),
            'score': round(float(row['score']), 2),
            'reason': f"Based on your interest in {fav_cat}" if row['category'] == fav_cat
                      else "Popular in your categories"
        } for _, row in top.iterrows()]

    def get_collaborative_recommendations(self, user_id, n=6):
        """Recommend based on similar users' purchases."""
        if self.user_item_matrix is None or self.orders_df.empty:
            return []

        user_id_str = str(user_id)
        if user_id_str not in self.user_item_matrix.index:
            return self._get_popular_products(n)

        # Compute similarity
        sim_matrix = cosine_similarity(self.user_item_matrix)
        sim_df = pd.DataFrame(sim_matrix,
                              index=self.user_item_matrix.index,
                              columns=self.user_item_matrix.index)

        # Get top 10 similar users
        user_sims = sim_df[user_id_str].drop(user_id_str).sort_values(ascending=False).head(10)

        # Get products user hasn't bought
        user_products = set(self.user_item_matrix.loc[user_id_str][
            self.user_item_matrix.loc[user_id_str] > 0
        ].index)

        product_scores = {}
        for sim_user, sim_score in user_sims.items():
            sim_user_prods = self.user_item_matrix.loc[sim_user]
            for product, count in sim_user_prods[sim_user_prods > 0].items():
                if product not in user_products:
                    product_scores[product] = product_scores.get(product, 0) + sim_score * count

        if not product_scores:
            return self._get_popular_products(n)

        sorted_prods = sorted(product_scores.items(), key=lambda x: x[1], reverse=True)[:n]

        results = []
        for prod_name, score in sorted_prods:
            prod_info = self.products_df[self.products_df['name'] == prod_name]
            if not prod_info.empty:
                p = prod_info.iloc[0]
                results.append({
                    'productId': p['product_id'],
                    'name': p['name'],
                    'category': p['category'],
                    'price': self._native(p['price']),
                    'score': round(float(score), 4),
                    'reason': 'Customers like you also bought this'
                })

        return results

    def get_hybrid_recommendations(self, user_id, n=6):
        """Combine content-based and collaborative recommendations."""
        content = self.get_content_based_recommendations(user_id, n=n)
        collab = self.get_collaborative_recommendations(user_id, n=n)

        # Merge and deduplicate
        seen = set()
        hybrid = []
        for rec in collab + content:
            if rec['name'] not in seen:
                seen.add(rec['name'])
                hybrid.append(rec)

        return hybrid[:n]

    def _get_popular_products(self, n=6):
        """Fallback: return most popular products."""
        if self.orders_df.empty or self.products_df.empty:
            return []

        popular = (self.orders_df.groupby('product_name')
                   .agg(order_count=('order_id', 'nunique'),
                        total_qty=('quantity', 'sum'))
                   .sort_values('order_count', ascending=False)
                   .head(n))

        results = []
        for prod_name, row in popular.iterrows():
            prod_info = self.products_df[self.products_df['name'] == prod_name]
            if not prod_info.empty:
                p = prod_info.iloc[0]
                results.append({
                    'productId': p['product_id'],
                    'name': p['name'],
                    'category': p['category'],
                    'price': self._native(p['price']),
                    'score': self._native(row['order_count']),
                    'reason': 'Trending product'
                })

        return results
