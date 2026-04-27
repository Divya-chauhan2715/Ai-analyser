"""
=============================================================================
Analytics Engine for BizConnect
=============================================================================
Reads real data from MongoDB and provides:
- Sales trends & forecasts
- Category profitability
- Customer segmentation
- Auto-generated business insights
=============================================================================
"""

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
import calendar


class AnalyticsEngine:
    """Advanced analytics using MongoDB order data."""

    def __init__(self, db):
        self.db = db

    def _get_orders_df(self, seller_id=None):
        """Load orders into a DataFrame, optionally filtered by seller."""
        query = {}
        if seller_id:
            from bson import ObjectId
            query['sellerId'] = ObjectId(seller_id)

        orders = list(self.db.orders.find(query))
        if not orders:
            return pd.DataFrame()

        rows = []
        for order in orders:
            for item in order.get('items', []):
                rows.append({
                    'order_id': str(order['_id']),
                    'buyer_id': str(order['buyerId']),
                    'seller_id': str(order['sellerId']),
                    'product_name': item.get('name', ''),
                    'quantity': item.get('quantity', 1),
                    'price': item.get('price', 0),
                    'total': item.get('price', 0) * item.get('quantity', 1),
                    'order_status': order.get('orderStatus', ''),
                    'payment_status': order.get('paymentStatus', ''),
                    'order_date': order.get('createdAt', datetime.utcnow()),
                    'total_amount': order.get('totalAmount', 0),
                })

        df = pd.DataFrame(rows)
        if not df.empty:
            df['order_date'] = pd.to_datetime(df['order_date'])
            df['month'] = df['order_date'].dt.to_period('M').astype(str)
            df['year'] = df['order_date'].dt.year
            df['month_num'] = df['order_date'].dt.month

        return df

    def get_advanced_analytics(self, seller_id=None):
        """Get comprehensive analytics data."""
        df = self._get_orders_df(seller_id)
        if df.empty:
            return {'error': 'No order data available'}

        # Load products for category info
        products = list(self.db.products.find({}))
        prod_cats = {p['name']: p.get('category', 'Unknown') for p in products}
        df['category'] = df['product_name'].map(prod_cats).fillna('Unknown')

        result = {
            'overview': self._get_overview(df),
            'monthly_trends': self._get_monthly_trends(df),
            'category_performance': self._get_category_performance(df),
            'top_products': self._get_top_products(df),
            'customer_segments': self._get_customer_segments(df),
            'insights': self._generate_insights(df),
        }

        return result

    def _get_overview(self, df):
        """KPI overview."""
        return {
            'total_revenue': round(df['total'].sum(), 2),
            'total_orders': df['order_id'].nunique(),
            'total_customers': df['buyer_id'].nunique(),
            'avg_order_value': round(df.groupby('order_id')['total'].sum().mean(), 2),
            'total_products_sold': int(df['quantity'].sum()),
            'completed_orders': int((df.groupby('order_id')['order_status'].first() == 'completed').sum()),
        }

    def _get_monthly_trends(self, df):
        """Monthly revenue and order trends."""
        monthly = (df.groupby('month')
                   .agg(revenue=('total', 'sum'),
                        orders=('order_id', 'nunique'),
                        quantity=('quantity', 'sum'))
                   .reset_index()
                   .sort_values('month'))

        monthly['revenue'] = monthly['revenue'].round(2)
        return monthly.to_dict('records')

    def _get_category_performance(self, df):
        """Profitability by category."""
        cat_df = (df.groupby('category')
                  .agg(revenue=('total', 'sum'),
                       orders=('order_id', 'nunique'),
                       quantity=('quantity', 'sum'),
                       avg_price=('price', 'mean'))
                  .sort_values('revenue', ascending=False)
                  .reset_index())

        cat_df['revenue'] = cat_df['revenue'].round(2)
        cat_df['avg_price'] = cat_df['avg_price'].round(2)
        cat_df['revenue_pct'] = (cat_df['revenue'] / cat_df['revenue'].sum() * 100).round(1)

        return cat_df.to_dict('records')

    def _get_top_products(self, df, n=10):
        """Top products by revenue."""
        top = (df.groupby('product_name')
               .agg(revenue=('total', 'sum'),
                    quantity=('quantity', 'sum'),
                    orders=('order_id', 'nunique'))
               .sort_values('revenue', ascending=False)
               .head(n)
               .reset_index())

        top['revenue'] = top['revenue'].round(2)
        return top.to_dict('records')

    def _get_customer_segments(self, df):
        """RFM-style customer segmentation."""
        max_date = df['order_date'].max()

        rfm = (df.groupby('buyer_id')
               .agg(recency=('order_date', lambda x: (max_date - x.max()).days),
                    frequency=('order_id', 'nunique'),
                    monetary=('total', 'sum'))
               .reset_index())

        rfm['monetary'] = rfm['monetary'].round(2)

        # Segment customers
        def segment(row):
            if row['frequency'] >= 5 and row['monetary'] >= rfm['monetary'].quantile(0.75):
                return 'VIP'
            elif row['frequency'] >= 3:
                return 'Loyal'
            elif row['recency'] <= 30:
                return 'Recent'
            elif row['recency'] > 90:
                return 'At Risk'
            else:
                return 'Regular'

        rfm['segment'] = rfm.apply(segment, axis=1)

        segment_summary = (rfm.groupby('segment')
                           .agg(count=('buyer_id', 'count'),
                                avg_spend=('monetary', 'mean'),
                                avg_frequency=('frequency', 'mean'))
                           .reset_index())

        segment_summary['avg_spend'] = segment_summary['avg_spend'].round(2)
        segment_summary['avg_frequency'] = segment_summary['avg_frequency'].round(1)

        return segment_summary.to_dict('records')

    def _generate_insights(self, df):
        """Auto-generate business insights."""
        insights = []

        # Top category
        cat_rev = df.groupby('category')['total'].sum().sort_values(ascending=False)
        if len(cat_rev) > 0:
            top_cat = cat_rev.index[0]
            pct = cat_rev.iloc[0] / cat_rev.sum() * 100
            insights.append({
                'type': 'success',
                'title': 'Top Category',
                'text': f'{top_cat} leads with {pct:.0f}% of total revenue (₹{cat_rev.iloc[0]:,.0f})'
            })

        # Best month
        monthly_rev = df.groupby('month_num')['total'].sum()
        if len(monthly_rev) > 0:
            best_month = calendar.month_name[monthly_rev.idxmax()]
            insights.append({
                'type': 'info',
                'title': 'Peak Season',
                'text': f'Sales peak in {best_month}. Plan inventory and promotions accordingly.'
            })

        # Customer concentration
        cust_rev = df.groupby('buyer_id')['total'].sum().sort_values(ascending=False)
        if len(cust_rev) > 0:
            top_5_pct = cust_rev.head(5).sum() / cust_rev.sum() * 100
            insights.append({
                'type': 'warning' if top_5_pct > 50 else 'info',
                'title': 'Customer Concentration',
                'text': f'Top 5 customers account for {top_5_pct:.0f}% of revenue. '
                        f'{"Diversify your customer base." if top_5_pct > 50 else "Good customer distribution."}'
            })

        # Growth trend
        monthly = df.groupby('month')['total'].sum().sort_index()
        if len(monthly) >= 3:
            recent = monthly.tail(3).mean()
            earlier = monthly.head(3).mean()
            if earlier > 0:
                growth = ((recent - earlier) / earlier) * 100
                insights.append({
                    'type': 'success' if growth > 0 else 'danger',
                    'title': 'Growth Trend',
                    'text': f'Revenue {"grew" if growth > 0 else "declined"} by {abs(growth):.0f}% '
                            f'compared to earlier months.'
                })

        # Top product
        top_prod = df.groupby('product_name')['total'].sum().sort_values(ascending=False)
        if len(top_prod) > 0:
            insights.append({
                'type': 'success',
                'title': 'Best Seller',
                'text': f'"{top_prod.index[0]}" is your top product with ₹{top_prod.iloc[0]:,.0f} revenue.'
            })

        return insights

    def get_sales_prediction(self, seller_id=None, months_ahead=3):
        """Predict future sales using linear regression."""
        df = self._get_orders_df(seller_id)
        if df.empty or len(df.groupby('month')) < 3:
            return {'error': 'Not enough data for prediction'}

        monthly = (df.groupby('month')
                   .agg(revenue=('total', 'sum'))
                   .reset_index()
                   .sort_values('month'))

        monthly['month_idx'] = range(len(monthly))

        # Train linear regression
        X = monthly[['month_idx']].values
        y = monthly['revenue'].values

        model = LinearRegression()
        model.fit(X, y)

        # Predict future
        future_idx = np.arange(len(monthly), len(monthly) + months_ahead).reshape(-1, 1)
        predictions = model.predict(future_idx)

        # Generate future month labels
        last_month = pd.Period(monthly['month'].iloc[-1])
        future_months = [(last_month + i + 1).strftime('%Y-%m') for i in range(months_ahead)]

        r2 = model.score(X, y)

        return {
            'historical': [{'month': row['month'], 'revenue': round(row['revenue'], 2)}
                          for _, row in monthly.iterrows()],
            'predictions': [{'month': m, 'revenue': round(max(0, float(p)), 2)}
                           for m, p in zip(future_months, predictions)],
            'model_score': round(r2, 4),
            'trend': 'growing' if model.coef_[0] > 0 else 'declining',
            'monthly_growth': round(float(model.coef_[0]), 2),
        }
