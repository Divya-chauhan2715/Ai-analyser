"""
=============================================================================
Recommendation System Module
=============================================================================
Implements two recommendation approaches:
1. Content-Based Filtering — recommends products from similar categories
2. Collaborative Filtering — uses user-item matrix with cosine similarity

Both approaches are simple, explainable, and beginner-friendly.
=============================================================================
"""

import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from collections import Counter


class ContentBasedRecommender:
    """
    Content-Based Recommendation Engine.

    Recommends products based on the categories and sub-categories
    a customer has previously purchased from. Prioritizes products
    the customer hasn't bought yet from their preferred categories.
    """

    def __init__(self, df):
        """
        Initialize with the transaction dataframe.

        Parameters:
            df (pd.DataFrame): Cleaned e-commerce dataframe
        """
        self.df = df.copy()
        self.product_profiles = self._build_product_profiles()

    def _build_product_profiles(self):
        """Build product profiles with category information."""
        profiles = (self.df.groupby('Product_Name')
                    .agg(
                        Category=('Category', 'first'),
                        Sub_Category=('Sub_Category', 'first'),
                        Avg_Price=('Sales', 'mean'),
                        Total_Sales=('Sales', 'sum'),
                        Popularity=('Order_ID', 'nunique')
                    )
                    .reset_index())
        profiles['Avg_Price'] = profiles['Avg_Price'].round(2)
        profiles['Total_Sales'] = profiles['Total_Sales'].round(2)
        return profiles

    def get_customer_preferences(self, customer_id):
        """
        Analyze a customer's purchase history to understand preferences.

        Returns:
            dict: Customer preference profile
        """
        customer_orders = self.df[self.df['Customer_ID'] == customer_id]

        if len(customer_orders) == 0:
            return None

        preferences = {
            'customer_id': customer_id,
            'customer_name': customer_orders['Customer_Name'].iloc[0],
            'total_orders': customer_orders['Order_ID'].nunique(),
            'favorite_category': customer_orders['Category'].mode()[0],
            'favorite_subcategory': customer_orders['Sub_Category'].mode()[0],
            'purchased_products': customer_orders['Product_Name'].unique().tolist(),
            'category_distribution': customer_orders['Category'].value_counts().to_dict(),
            'avg_spend': customer_orders['Sales'].mean(),
            'total_spend': customer_orders['Sales'].sum(),
        }
        return preferences

    def recommend(self, customer_id, n=5):
        """
        Recommend products for a customer based on their purchase history.

        Parameters:
            customer_id (str): Customer ID
            n (int): Number of recommendations

        Returns:
            pd.DataFrame: Recommended products with scores
        """
        prefs = self.get_customer_preferences(customer_id)

        if prefs is None:
            print(f"❌ Customer {customer_id} not found!")
            return pd.DataFrame()

        purchased = set(prefs['purchased_products'])
        fav_cat = prefs['favorite_category']
        fav_subcat = prefs['favorite_subcategory']
        cat_dist = prefs['category_distribution']
        total_purchases = sum(cat_dist.values())

        # Score all products the customer hasn't bought
        candidates = self.product_profiles[
            ~self.product_profiles['Product_Name'].isin(purchased)
        ].copy()

        # Scoring logic:
        # - Same sub-category as favorite: +50 points
        # - Same category as favorite: +30 points
        # - Category purchased before (weighted by frequency): +10-20 points
        # - Popularity bonus: +5 * log(popularity)
        scores = []
        for _, product in candidates.iterrows():
            score = 0

            # Sub-category match
            if product['Sub_Category'] == fav_subcat:
                score += 50

            # Category match
            if product['Category'] == fav_cat:
                score += 30
            elif product['Category'] in cat_dist:
                # Weighted by how often they buy from this category
                weight = cat_dist[product['Category']] / total_purchases
                score += 20 * weight

            # Popularity bonus
            score += 5 * np.log1p(product['Popularity'])

            scores.append(score)

        candidates['Relevance_Score'] = scores
        candidates = candidates.sort_values('Relevance_Score', ascending=False).head(n)
        candidates['Relevance_Score'] = candidates['Relevance_Score'].round(2)

        return candidates[['Product_Name', 'Category', 'Sub_Category',
                          'Avg_Price', 'Popularity', 'Relevance_Score']]


class CollaborativeRecommender:
    """
    Collaborative Filtering Recommendation Engine.

    Uses a user-item interaction matrix and cosine similarity to find
    similar users, then recommends products that similar users purchased
    but the target user hasn't.

    This is a memory-based collaborative filtering approach.
    """

    def __init__(self, df):
        """
        Initialize with the transaction dataframe.

        Parameters:
            df (pd.DataFrame): Cleaned e-commerce dataframe
        """
        self.df = df.copy()
        self.user_item_matrix = None
        self.similarity_matrix = None
        self.customer_ids = None
        self._build_matrices()

    def _build_matrices(self):
        """Build user-item matrix and similarity matrix."""
        print("🔨 Building user-item matrix...")

        # Create user-item matrix (1 = purchased, 0 = not purchased)
        # Using purchase frequency as the value (how many times they bought each product)
        purchase_counts = (self.df.groupby(['Customer_ID', 'Product_Name'])
                          .size()
                          .reset_index(name='Purchase_Count'))

        self.user_item_matrix = purchase_counts.pivot_table(
            index='Customer_ID',
            columns='Product_Name',
            values='Purchase_Count',
            fill_value=0
        )

        self.customer_ids = self.user_item_matrix.index.tolist()

        # Calculate cosine similarity between users
        print("🔨 Computing user similarity (cosine similarity)...")
        self.similarity_matrix = pd.DataFrame(
            cosine_similarity(self.user_item_matrix),
            index=self.customer_ids,
            columns=self.customer_ids
        )

        print(f"   ✅ Matrix size: {self.user_item_matrix.shape[0]} users × "
              f"{self.user_item_matrix.shape[1]} products")

    def get_similar_users(self, customer_id, n=5):
        """
        Find the top N most similar users to the target customer.

        Parameters:
            customer_id (str): Target customer ID
            n (int): Number of similar users

        Returns:
            pd.DataFrame: Similar users with similarity scores
        """
        if customer_id not in self.customer_ids:
            print(f"❌ Customer {customer_id} not found!")
            return pd.DataFrame()

        similarities = self.similarity_matrix[customer_id].drop(customer_id)
        top_similar = similarities.sort_values(ascending=False).head(n)

        result = pd.DataFrame({
            'Customer_ID': top_similar.index,
            'Similarity_Score': top_similar.values.round(4)
        })

        # Add customer names
        name_map = self.df.drop_duplicates('Customer_ID').set_index('Customer_ID')['Customer_Name']
        result['Customer_Name'] = result['Customer_ID'].map(name_map)

        return result

    def recommend(self, customer_id, n=5, n_similar=10):
        """
        Recommend products for a customer based on similar users' purchases.

        Parameters:
            customer_id (str): Target customer ID
            n (int): Number of recommendations
            n_similar (int): Number of similar users to consider

        Returns:
            pd.DataFrame: Recommended products with scores
        """
        if customer_id not in self.customer_ids:
            print(f"❌ Customer {customer_id} not found!")
            return pd.DataFrame()

        # Get similar users
        similar_users = self.get_similar_users(customer_id, n=n_similar)

        # Get products the target user has already purchased
        target_purchases = set(
            self.user_item_matrix.loc[customer_id][
                self.user_item_matrix.loc[customer_id] > 0
            ].index
        )

        # Aggregate product scores from similar users
        product_scores = {}
        for _, row in similar_users.iterrows():
            sim_user_id = row['Customer_ID']
            sim_score = row['Similarity_Score']

            # Get products this similar user bought (but target hasn't)
            sim_purchases = self.user_item_matrix.loc[sim_user_id]
            for product, count in sim_purchases[sim_purchases > 0].items():
                if product not in target_purchases:
                    if product not in product_scores:
                        product_scores[product] = 0
                    # Weighted by similarity score and purchase count
                    product_scores[product] += sim_score * count

        if not product_scores:
            print(f"⚠️ No new recommendations found for {customer_id}")
            return pd.DataFrame()

        # Create recommendation dataframe
        recs = pd.DataFrame({
            'Product_Name': list(product_scores.keys()),
            'Recommendation_Score': list(product_scores.values())
        })

        recs = recs.sort_values('Recommendation_Score', ascending=False).head(n)
        recs['Recommendation_Score'] = recs['Recommendation_Score'].round(4)

        # Add product details
        product_info = (self.df.groupby('Product_Name')
                       .agg(Category=('Category', 'first'),
                            Sub_Category=('Sub_Category', 'first'),
                            Avg_Price=('Sales', 'mean'))
                       .reset_index())

        recs = recs.merge(product_info, on='Product_Name', how='left')
        recs['Avg_Price'] = recs['Avg_Price'].round(2)

        return recs[['Product_Name', 'Category', 'Sub_Category',
                     'Avg_Price', 'Recommendation_Score']]


class HybridRecommender:
    """
    Hybrid Recommendation Engine.

    Combines Content-Based and Collaborative Filtering scores
    for more robust recommendations.
    """

    def __init__(self, df, content_weight=0.4, collab_weight=0.6):
        """
        Initialize with the transaction dataframe.

        Parameters:
            df (pd.DataFrame): Cleaned e-commerce dataframe
            content_weight (float): Weight for content-based scores
            collab_weight (float): Weight for collaborative scores
        """
        self.content_rec = ContentBasedRecommender(df)
        self.collab_rec = CollaborativeRecommender(df)
        self.content_weight = content_weight
        self.collab_weight = collab_weight

    def recommend(self, customer_id, n=5):
        """
        Get hybrid recommendations combining both approaches.

        Parameters:
            customer_id (str): Target customer ID
            n (int): Number of recommendations

        Returns:
            pd.DataFrame: Recommended products with hybrid scores
        """
        # Get recommendations from both systems
        content_recs = self.content_rec.recommend(customer_id, n=n*2)
        collab_recs = self.collab_rec.recommend(customer_id, n=n*2)

        if content_recs.empty and collab_recs.empty:
            return pd.DataFrame()

        # Normalize scores
        if not content_recs.empty and content_recs['Relevance_Score'].max() > 0:
            content_recs['Norm_Score'] = (
                content_recs['Relevance_Score'] / content_recs['Relevance_Score'].max()
            )
        else:
            content_recs['Norm_Score'] = 0

        if not collab_recs.empty and collab_recs['Recommendation_Score'].max() > 0:
            collab_recs['Norm_Score'] = (
                collab_recs['Recommendation_Score'] / collab_recs['Recommendation_Score'].max()
            )
        else:
            collab_recs['Norm_Score'] = 0

        # Combine scores
        all_products = set()
        scores = {}

        for _, row in content_recs.iterrows():
            product = row['Product_Name']
            scores[product] = {
                'Content_Score': row['Norm_Score'] * self.content_weight,
                'Collab_Score': 0,
                'Category': row['Category'],
                'Sub_Category': row['Sub_Category'],
                'Avg_Price': row['Avg_Price']
            }

        for _, row in collab_recs.iterrows():
            product = row['Product_Name']
            if product in scores:
                scores[product]['Collab_Score'] = row['Norm_Score'] * self.collab_weight
            else:
                scores[product] = {
                    'Content_Score': 0,
                    'Collab_Score': row['Norm_Score'] * self.collab_weight,
                    'Category': row['Category'],
                    'Sub_Category': row['Sub_Category'],
                    'Avg_Price': row['Avg_Price']
                }

        # Build result
        results = []
        for product, data in scores.items():
            hybrid_score = data['Content_Score'] + data['Collab_Score']
            results.append({
                'Product_Name': product,
                'Category': data['Category'],
                'Sub_Category': data['Sub_Category'],
                'Avg_Price': data['Avg_Price'],
                'Content_Score': round(data['Content_Score'], 4),
                'Collab_Score': round(data['Collab_Score'], 4),
                'Hybrid_Score': round(hybrid_score, 4)
            })

        result_df = pd.DataFrame(results)
        result_df = result_df.sort_values('Hybrid_Score', ascending=False).head(n)

        return result_df


def demo_recommendations(df, n_customers=3, n_recs=5):
    """
    Demonstrate the recommendation system with sample customers.

    Parameters:
        df (pd.DataFrame): Cleaned dataframe
        n_customers (int): Number of sample customers to demo
        n_recs (int): Number of recommendations per customer
    """
    print("\n" + "=" * 70)
    print("   RECOMMENDATION SYSTEM DEMO")
    print("=" * 70)

    # Initialize recommenders
    print("\n📦 Initializing recommendation engines...")
    hybrid = HybridRecommender(df)

    # Get sample customers with decent purchase history
    customer_orders = df.groupby('Customer_ID')['Order_ID'].nunique()
    active_customers = customer_orders[customer_orders >= 5].index.tolist()
    sample_customers = np.random.choice(active_customers,
                                        size=min(n_customers, len(active_customers)),
                                        replace=False)

    for cust_id in sample_customers:
        # Customer profile
        prefs = hybrid.content_rec.get_customer_preferences(cust_id)
        if prefs is None:
            continue

        print(f"\n{'─' * 70}")
        print(f"👤 Customer: {prefs['customer_name']} ({cust_id})")
        print(f"   📊 Total Orders: {prefs['total_orders']}")
        print(f"   💰 Total Spend: ₹{prefs['total_spend']:,.2f}")
        print(f"   ❤️  Favorite Category: {prefs['favorite_category']}")
        print(f"   📱 Products Purchased: {len(prefs['purchased_products'])}")

        # Content-Based Recommendations
        print(f"\n   📋 Content-Based Recommendations:")
        content_recs = hybrid.content_rec.recommend(cust_id, n=n_recs)
        if not content_recs.empty:
            for i, (_, row) in enumerate(content_recs.iterrows(), 1):
                print(f"      {i}. {row['Product_Name']:30s} | {row['Category']:15s} | "
                      f"₹{row['Avg_Price']:>10,.2f} | Score: {row['Relevance_Score']:.2f}")

        # Collaborative Recommendations
        print(f"\n   🤝 Collaborative Filtering Recommendations:")
        collab_recs = hybrid.collab_rec.recommend(cust_id, n=n_recs)
        if not collab_recs.empty:
            for i, (_, row) in enumerate(collab_recs.iterrows(), 1):
                print(f"      {i}. {row['Product_Name']:30s} | {row['Category']:15s} | "
                      f"₹{row['Avg_Price']:>10,.2f} | Score: {row['Recommendation_Score']:.4f}")

        # Hybrid Recommendations
        print(f"\n   ⭐ Hybrid Recommendations (Final):")
        hybrid_recs = hybrid.recommend(cust_id, n=n_recs)
        if not hybrid_recs.empty:
            for i, (_, row) in enumerate(hybrid_recs.iterrows(), 1):
                print(f"      {i}. {row['Product_Name']:30s} | {row['Category']:15s} | "
                      f"₹{row['Avg_Price']:>10,.2f} | Score: {row['Hybrid_Score']:.4f}")

    return hybrid
