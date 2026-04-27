"""
=============================================================================
Analysis Module
=============================================================================
Functions to analyze various aspects of the e-commerce dataset:
- Top-selling products
- Most profitable categories
- Sales trends over time
- Region-wise performance
- Customer purchasing behavior
=============================================================================
"""

import pandas as pd
import numpy as np


def top_selling_products(df, n=10, by='quantity'):
    """
    Get the top N selling products by quantity or revenue.

    Parameters:
        df (pd.DataFrame): Processed dataframe
        n (int): Number of top products to return
        by (str): 'quantity' or 'revenue'

    Returns:
        pd.DataFrame: Top N products
    """
    if by == 'quantity':
        result = (df.groupby('Product_Name')
                  .agg(Total_Quantity=('Quantity', 'sum'),
                       Total_Revenue=('Sales', 'sum'),
                       Total_Orders=('Order_ID', 'nunique'))
                  .sort_values('Total_Quantity', ascending=False)
                  .head(n)
                  .reset_index())
    else:
        result = (df.groupby('Product_Name')
                  .agg(Total_Revenue=('Sales', 'sum'),
                       Total_Quantity=('Quantity', 'sum'),
                       Total_Orders=('Order_ID', 'nunique'))
                  .sort_values('Total_Revenue', ascending=False)
                  .head(n)
                  .reset_index())

    result['Total_Revenue'] = result['Total_Revenue'].round(2)
    return result


def most_profitable_categories(df):
    """
    Analyze profitability by Category and Sub-Category.

    Returns:
        tuple: (category_df, subcategory_df)
    """
    # By Category
    cat_profit = (df.groupby('Category')
                  .agg(Total_Sales=('Sales', 'sum'),
                       Total_Profit=('Profit', 'sum'),
                       Total_Orders=('Order_ID', 'nunique'),
                       Avg_Discount=('Discount', 'mean'),
                       Avg_Profit_Margin=('Profit_Margin', 'mean'))
                  .sort_values('Total_Profit', ascending=False)
                  .reset_index())

    cat_profit['Total_Sales'] = cat_profit['Total_Sales'].round(2)
    cat_profit['Total_Profit'] = cat_profit['Total_Profit'].round(2)
    cat_profit['Avg_Discount'] = (cat_profit['Avg_Discount'] * 100).round(2)
    cat_profit['Avg_Profit_Margin'] = cat_profit['Avg_Profit_Margin'].round(2)

    # By Sub-Category
    subcat_profit = (df.groupby(['Category', 'Sub_Category'])
                     .agg(Total_Sales=('Sales', 'sum'),
                          Total_Profit=('Profit', 'sum'),
                          Total_Orders=('Order_ID', 'nunique'),
                          Avg_Profit_Margin=('Profit_Margin', 'mean'))
                     .sort_values('Total_Profit', ascending=False)
                     .reset_index())

    subcat_profit['Total_Sales'] = subcat_profit['Total_Sales'].round(2)
    subcat_profit['Total_Profit'] = subcat_profit['Total_Profit'].round(2)
    subcat_profit['Avg_Profit_Margin'] = subcat_profit['Avg_Profit_Margin'].round(2)

    return cat_profit, subcat_profit


def sales_trends(df, period='monthly'):
    """
    Analyze sales trends over time.

    Parameters:
        df (pd.DataFrame): Processed dataframe
        period (str): 'monthly', 'quarterly', or 'yearly'

    Returns:
        pd.DataFrame: Sales trends
    """
    df = df.copy()
    df['Order_Date'] = pd.to_datetime(df['Order_Date'])

    if period == 'monthly':
        trend = (df.groupby('Year_Month')
                 .agg(Total_Sales=('Sales', 'sum'),
                      Total_Profit=('Profit', 'sum'),
                      Total_Orders=('Order_ID', 'nunique'),
                      Avg_Order_Value=('Sales', 'mean'))
                 .reset_index()
                 .sort_values('Year_Month'))

    elif period == 'quarterly':
        df['Year_Quarter'] = df['Order_Date'].dt.to_period('Q').astype(str)
        trend = (df.groupby('Year_Quarter')
                 .agg(Total_Sales=('Sales', 'sum'),
                      Total_Profit=('Profit', 'sum'),
                      Total_Orders=('Order_ID', 'nunique'),
                      Avg_Order_Value=('Sales', 'mean'))
                 .reset_index()
                 .sort_values('Year_Quarter'))

    elif period == 'yearly':
        trend = (df.groupby('Order_Year')
                 .agg(Total_Sales=('Sales', 'sum'),
                      Total_Profit=('Profit', 'sum'),
                      Total_Orders=('Order_ID', 'nunique'),
                      Avg_Order_Value=('Sales', 'mean'))
                 .reset_index()
                 .sort_values('Order_Year'))

    for col in ['Total_Sales', 'Total_Profit', 'Avg_Order_Value']:
        trend[col] = trend[col].round(2)

    return trend


def region_performance(df):
    """
    Analyze performance by Region and State.

    Returns:
        tuple: (region_df, state_df)
    """
    # By Region
    region_df = (df.groupby('Region')
                 .agg(Total_Sales=('Sales', 'sum'),
                      Total_Profit=('Profit', 'sum'),
                      Total_Orders=('Order_ID', 'nunique'),
                      Unique_Customers=('Customer_ID', 'nunique'),
                      Avg_Order_Value=('Sales', 'mean'))
                 .sort_values('Total_Sales', ascending=False)
                 .reset_index())

    for col in ['Total_Sales', 'Total_Profit', 'Avg_Order_Value']:
        region_df[col] = region_df[col].round(2)

    # By State
    state_df = (df.groupby(['Region', 'State'])
                .agg(Total_Sales=('Sales', 'sum'),
                     Total_Profit=('Profit', 'sum'),
                     Total_Orders=('Order_ID', 'nunique'))
                .sort_values('Total_Sales', ascending=False)
                .reset_index())

    state_df['Total_Sales'] = state_df['Total_Sales'].round(2)
    state_df['Total_Profit'] = state_df['Total_Profit'].round(2)

    return region_df, state_df


def customer_behavior(df):
    """
    Analyze customer purchasing behavior and segmentation.

    Returns:
        dict with:
         - segment_analysis: sales by customer segment
         - customer_rfm: RFM-style metrics per customer
         - purchase_frequency: distribution of purchase counts
    """
    # ---- Segment Analysis ----
    segment_df = (df.groupby('Segment')
                  .agg(Total_Sales=('Sales', 'sum'),
                       Total_Profit=('Profit', 'sum'),
                       Total_Orders=('Order_ID', 'nunique'),
                       Unique_Customers=('Customer_ID', 'nunique'),
                       Avg_Order_Value=('Sales', 'mean'))
                  .sort_values('Total_Sales', ascending=False)
                  .reset_index())

    for col in ['Total_Sales', 'Total_Profit', 'Avg_Order_Value']:
        segment_df[col] = segment_df[col].round(2)

    # ---- Customer-level RFM-style Analysis ----
    max_date = df['Order_Date'].max()

    rfm = (df.groupby('Customer_ID')
           .agg(
               Customer_Name=('Customer_Name', 'first'),
               Segment=('Segment', 'first'),
               Region=('Region', 'first'),
               Recency=('Order_Date', lambda x: (max_date - x.max()).days),
               Frequency=('Order_ID', 'nunique'),
               Monetary=('Sales', 'sum'),
               Total_Profit=('Profit', 'sum'),
               Avg_Order_Value=('Sales', 'mean'),
               Total_Products=('Product_ID', 'nunique'),
               Favorite_Category=('Category', lambda x: x.mode()[0] if len(x.mode()) > 0 else 'Unknown')
           )
           .sort_values('Monetary', ascending=False)
           .reset_index())

    rfm['Monetary'] = rfm['Monetary'].round(2)
    rfm['Total_Profit'] = rfm['Total_Profit'].round(2)
    rfm['Avg_Order_Value'] = rfm['Avg_Order_Value'].round(2)

    # ---- Purchase Frequency Distribution ----
    freq_dist = rfm['Frequency'].describe().round(2)

    return {
        'segment_analysis': segment_df,
        'customer_rfm': rfm,
        'frequency_stats': freq_dist
    }


def discount_impact_analysis(df):
    """
    Analyze the impact of discounts on sales and profit.

    Returns:
        pd.DataFrame: Analysis by discount category
    """
    discount_df = (df.groupby('Discount_Category')
                   .agg(Total_Sales=('Sales', 'sum'),
                        Total_Profit=('Profit', 'sum'),
                        Avg_Profit_Margin=('Profit_Margin', 'mean'),
                        Total_Orders=('Order_ID', 'nunique'))
                   .reset_index())

    for col in ['Total_Sales', 'Total_Profit', 'Avg_Profit_Margin']:
        discount_df[col] = discount_df[col].round(2)

    return discount_df


def shipping_analysis(df):
    """
    Analyze shipping patterns and performance.

    Returns:
        pd.DataFrame: Analysis by ship mode
    """
    ship_df = (df.groupby('Ship_Mode')
               .agg(Total_Orders=('Order_ID', 'nunique'),
                    Avg_Shipping_Days=('Shipping_Days', 'mean'),
                    Total_Sales=('Sales', 'sum'),
                    Avg_Order_Value=('Sales', 'mean'))
               .sort_values('Total_Orders', ascending=False)
               .reset_index())

    for col in ['Avg_Shipping_Days', 'Total_Sales', 'Avg_Order_Value']:
        ship_df[col] = ship_df[col].round(2)

    return ship_df


def generate_business_insights(df):
    """
    Generate actionable business insights from the data.

    Returns:
        list of str: Business insights and recommendations
    """
    insights = []

    # 1. Top category
    cat_sales = df.groupby('Category')['Sales'].sum().sort_values(ascending=False)
    top_cat = cat_sales.index[0]
    insights.append(
        f"🏆 **Top Performing Category**: {top_cat} leads with ₹{cat_sales.iloc[0]:,.0f} in sales "
        f"({cat_sales.iloc[0]/cat_sales.sum()*100:.1f}% of total revenue)."
    )

    # 2. Most profitable sub-category
    subcat_profit = df.groupby('Sub_Category')['Profit'].sum().sort_values(ascending=False)
    top_sub = subcat_profit.index[0]
    insights.append(
        f"💰 **Most Profitable Sub-Category**: {top_sub} with ₹{subcat_profit.iloc[0]:,.0f} total profit. "
        f"Focus marketing efforts here."
    )

    # 3. Worst performing sub-category
    worst_sub = subcat_profit.index[-1]
    if subcat_profit.iloc[-1] < 0:
        insights.append(
            f"⚠️ **Loss-Making Sub-Category**: {worst_sub} is generating losses "
            f"(₹{subcat_profit.iloc[-1]:,.0f}). Review pricing and discount strategy."
        )

    # 4. Regional insight
    region_sales = df.groupby('Region')['Sales'].sum().sort_values(ascending=False)
    best_region = region_sales.index[0]
    worst_region = region_sales.index[-1]
    insights.append(
        f"🗺️ **Regional Performance**: {best_region} is the strongest region "
        f"(₹{region_sales.iloc[0]:,.0f}). {worst_region} region needs improvement "
        f"(₹{region_sales.iloc[-1]:,.0f}) — consider targeted promotions."
    )

    # 5. Discount impact
    high_discount = df[df['Discount'] >= 0.20]
    no_discount = df[df['Discount'] == 0]
    if len(high_discount) > 0 and len(no_discount) > 0:
        avg_margin_high = high_discount['Profit_Margin'].mean()
        avg_margin_no = no_discount['Profit_Margin'].mean()
        insights.append(
            f"🏷️ **Discount Impact**: High discounts (>20%) reduce average profit margin to "
            f"{avg_margin_high:.1f}% vs {avg_margin_no:.1f}% for zero-discount orders. "
            f"Limit aggressive discounting."
        )

    # 6. Seasonal pattern
    monthly_sales = df.groupby('Order_Month')['Sales'].sum()
    peak_month_num = monthly_sales.idxmax()
    import calendar
    peak_month = calendar.month_name[peak_month_num]
    insights.append(
        f"📅 **Seasonal Pattern**: Sales peak in {peak_month} (festive season). "
        f"Stock up inventory and increase ad spend during this period."
    )

    # 7. Customer segment
    seg_sales = df.groupby('Segment')['Sales'].sum().sort_values(ascending=False)
    top_seg = seg_sales.index[0]
    insights.append(
        f"👥 **Key Customer Segment**: {top_seg} segment contributes "
        f"₹{seg_sales.iloc[0]:,.0f} ({seg_sales.iloc[0]/seg_sales.sum()*100:.1f}% of sales). "
        f"Tailor loyalty programs for this group."
    )

    # 8. Year-over-year growth
    yearly = df.groupby('Order_Year')['Sales'].sum()
    if len(yearly) >= 2:
        years = sorted(yearly.index)
        latest_year = years[-1]
        prev_year = years[-2]
        growth = ((yearly[latest_year] - yearly[prev_year]) / yearly[prev_year] * 100)
        insights.append(
            f"📈 **YoY Growth**: Sales grew by {growth:.1f}% from {prev_year} to {latest_year}, "
            f"indicating {'strong' if growth > 10 else 'moderate' if growth > 0 else 'declining'} "
            f"business momentum."
        )

    return insights
