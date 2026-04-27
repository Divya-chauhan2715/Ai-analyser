"""
=============================================================================
E-commerce Analytics — Interactive Streamlit Dashboard
=============================================================================
A beautiful, interactive dashboard for exploring e-commerce data insights.
Features 6 tabs: Overview, Sales Analysis, Products, Customers,
Recommendations, and Sales Prediction.
=============================================================================
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import sys
import os

# Add parent directory to path so we can import our modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from src.data_cleaning import load_data, clean_data, add_features
from src.recommendation import ContentBasedRecommender, CollaborativeRecommender

# =============================================================================
# PAGE CONFIG
# =============================================================================
st.set_page_config(
    page_title="E-commerce Analytics Dashboard",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    .stApp { font-family: 'Inter', sans-serif; }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px; border-radius: 16px; color: white;
        text-align: center; margin: 5px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    .metric-card h3 { font-size: 14px; opacity: 0.9; margin: 0; font-weight: 400; }
    .metric-card h1 { font-size: 28px; margin: 5px 0; font-weight: 700; }
    .metric-card-green {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        box-shadow: 0 4px 15px rgba(17, 153, 142, 0.4);
    }
    .metric-card-orange {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
    }
    .metric-card-blue {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
    }
    .insight-box {
        background: #f8f9ff; border-left: 4px solid #6366f1;
        padding: 12px 16px; border-radius: 0 8px 8px 0;
        margin: 8px 0; font-size: 14px;
    }
    div[data-testid="stMetricValue"] { font-size: 24px; }
    .stTabs [data-baseweb="tab-list"] { gap: 8px; }
    .stTabs [data-baseweb="tab"] {
        padding: 10px 20px; border-radius: 8px 8px 0 0;
        font-weight: 500;
    }
</style>
""", unsafe_allow_html=True)

# =============================================================================
# DATA LOADING
# =============================================================================
@st.cache_data
def load_and_process_data():
    filepath = os.path.join(os.path.dirname(__file__), '..', 'data', 'ecommerce_data.csv')
    df = pd.read_csv(filepath)
    df = df.drop_duplicates().reset_index(drop=True)
    df['Customer_Name'] = df['Customer_Name'].fillna('Unknown')
    df['Order_Date'] = pd.to_datetime(df['Order_Date'])
    df['Ship_Date'] = pd.to_datetime(df['Ship_Date'], errors='coerce')
    missing_ship = df['Ship_Date'].isnull()
    if missing_ship.any():
        df.loc[missing_ship, 'Ship_Date'] = df.loc[missing_ship, 'Order_Date'] + pd.Timedelta(days=3)
    df['Order_Year'] = df['Order_Date'].dt.year
    df['Order_Month'] = df['Order_Date'].dt.month
    df['Order_Month_Name'] = df['Order_Date'].dt.strftime('%B')
    df['Order_Quarter'] = df['Order_Date'].dt.quarter
    df['Year_Month'] = df['Order_Date'].dt.to_period('M').astype(str)
    df['Profit_Margin'] = (df['Profit'] / df['Sales'] * 100).round(2)
    df['Shipping_Days'] = (df['Ship_Date'] - df['Order_Date']).dt.days
    for col in ['Sales', 'Quantity', 'Discount', 'Profit']:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    return df

df = load_and_process_data()

# Color scheme
COLOR_PALETTE = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#06B6D4',
                 '#8B5CF6', '#F97316', '#EF4444', '#14B8A6', '#A855F7']

CAT_COLORS = {'Technology': '#6366F1', 'Furniture': '#EC4899', 'Office Supplies': '#10B981'}
REG_COLORS = {'North': '#6366F1', 'South': '#EC4899', 'East': '#F59E0B', 'West': '#10B981'}


def fmt_currency(val):
    if val >= 10000000: return f'₹{val/10000000:.1f}Cr'
    if val >= 100000: return f'₹{val/100000:.1f}L'
    if val >= 1000: return f'₹{val/1000:.1f}K'
    return f'₹{val:.0f}'


# =============================================================================
# SIDEBAR
# =============================================================================
with st.sidebar:
    st.markdown("## 🛍️ E-commerce Analytics")
    st.markdown("---")

    # Filters
    st.markdown("### 🔍 Filters")
    years = sorted(df['Order_Year'].unique())
    sel_years = st.multiselect("Year", years, default=years)

    categories = sorted(df['Category'].unique())
    sel_categories = st.multiselect("Category", categories, default=categories)

    regions = sorted(df['Region'].unique())
    sel_regions = st.multiselect("Region", regions, default=regions)

    st.markdown("---")
    st.markdown("### 📋 Dataset Info")
    st.markdown(f"- **Records**: {len(df):,}")
    st.markdown(f"- **Date Range**: {df['Order_Date'].min().strftime('%b %Y')} — "
                f"{df['Order_Date'].max().strftime('%b %Y')}")
    st.markdown(f"- **Products**: {df['Product_Name'].nunique()}")
    st.markdown(f"- **Customers**: {df['Customer_ID'].nunique()}")

# Apply filters
mask = ((df['Order_Year'].isin(sel_years)) &
        (df['Category'].isin(sel_categories)) &
        (df['Region'].isin(sel_regions)))
fdf = df[mask]

# =============================================================================
# TABS
# =============================================================================
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "📊 Overview", "📈 Sales Analysis", "📦 Products & Categories",
    "👥 Customers", "🤖 Recommendations"
])

# ========================= TAB 1: OVERVIEW =========================
with tab1:
    st.markdown("# 📊 Dashboard Overview")
    st.markdown("---")

    # KPI Cards
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(f'''<div class="metric-card">
            <h3>Total Sales</h3><h1>{fmt_currency(fdf["Sales"].sum())}</h1>
        </div>''', unsafe_allow_html=True)
    with c2:
        st.markdown(f'''<div class="metric-card metric-card-green">
            <h3>Total Profit</h3><h1>{fmt_currency(fdf["Profit"].sum())}</h1>
        </div>''', unsafe_allow_html=True)
    with c3:
        st.markdown(f'''<div class="metric-card metric-card-orange">
            <h3>Total Orders</h3><h1>{fdf["Order_ID"].nunique():,}</h1>
        </div>''', unsafe_allow_html=True)
    with c4:
        st.markdown(f'''<div class="metric-card metric-card-blue">
            <h3>Avg Order Value</h3><h1>{fmt_currency(fdf["Sales"].mean())}</h1>
        </div>''', unsafe_allow_html=True)

    st.markdown("")

    # Sales trend + Category split
    col1, col2 = st.columns([2, 1])
    with col1:
        trend = fdf.groupby('Year_Month').agg(Sales=('Sales','sum')).reset_index().sort_values('Year_Month')
        fig = px.area(trend, x='Year_Month', y='Sales', title='Monthly Sales Trend',
                      color_discrete_sequence=[COLOR_PALETTE[0]])
        fig.update_layout(xaxis_title='', yaxis_title='Sales (₹)', height=350,
                          xaxis=dict(tickangle=45, dtick=3))
        st.plotly_chart(fig, use_container_width=True)
    with col2:
        cat_sales = fdf.groupby('Category')['Sales'].sum().reset_index()
        fig = px.pie(cat_sales, values='Sales', names='Category', title='Sales by Category',
                     color='Category', color_discrete_map=CAT_COLORS, hole=0.45)
        fig.update_layout(height=350)
        st.plotly_chart(fig, use_container_width=True)

    # Region + Segment
    col1, col2 = st.columns(2)
    with col1:
        reg = fdf.groupby('Region')['Sales'].sum().reset_index().sort_values('Sales', ascending=True)
        fig = px.bar(reg, x='Sales', y='Region', orientation='h', title='Sales by Region',
                     color='Region', color_discrete_map=REG_COLORS)
        fig.update_layout(height=300, showlegend=False)
        st.plotly_chart(fig, use_container_width=True)
    with col2:
        seg = fdf.groupby('Segment')['Sales'].sum().reset_index().sort_values('Sales', ascending=False)
        fig = px.bar(seg, x='Segment', y='Sales', title='Sales by Customer Segment',
                     color='Segment', color_discrete_sequence=COLOR_PALETTE)
        fig.update_layout(height=300, showlegend=False)
        st.plotly_chart(fig, use_container_width=True)

# ========================= TAB 2: SALES ANALYSIS =========================
with tab2:
    st.markdown("# 📈 Sales Analysis")
    st.markdown("---")

    # Yearly trend
    yearly = fdf.groupby('Order_Year').agg(Sales=('Sales','sum'), Profit=('Profit','sum')).reset_index()
    fig = make_subplots(specs=[[{"secondary_y": True}]])
    fig.add_trace(go.Bar(x=yearly['Order_Year'], y=yearly['Sales'], name='Sales',
                         marker_color=COLOR_PALETTE[0], opacity=0.8), secondary_y=False)
    fig.add_trace(go.Scatter(x=yearly['Order_Year'], y=yearly['Profit'], name='Profit',
                             line=dict(color=COLOR_PALETTE[1], width=3), mode='lines+markers'),
                  secondary_y=True)
    fig.update_layout(title='Yearly Sales & Profit', height=400, barmode='group')
    fig.update_yaxes(title_text="Sales (₹)", secondary_y=False)
    fig.update_yaxes(title_text="Profit (₹)", secondary_y=True)
    st.plotly_chart(fig, use_container_width=True)

    # Quarterly + Monthly
    col1, col2 = st.columns(2)
    with col1:
        qtr = fdf.groupby(['Order_Year','Order_Quarter']).agg(Sales=('Sales','sum')).reset_index()
        qtr['Period'] = qtr['Order_Year'].astype(str) + '-Q' + qtr['Order_Quarter'].astype(str)
        fig = px.line(qtr, x='Period', y='Sales', title='Quarterly Sales Trend',
                      markers=True, color_discrete_sequence=[COLOR_PALETTE[0]])
        fig.update_layout(height=350)
        st.plotly_chart(fig, use_container_width=True)
    with col2:
        monthly_avg = fdf.groupby('Order_Month')['Sales'].mean().reset_index()
        import calendar
        monthly_avg['Month'] = monthly_avg['Order_Month'].apply(lambda x: calendar.month_abbr[x])
        fig = px.bar(monthly_avg, x='Month', y='Sales', title='Avg Sales by Month (Seasonality)',
                     color='Sales', color_continuous_scale='Viridis')
        fig.update_layout(height=350)
        st.plotly_chart(fig, use_container_width=True)

    # Heatmap
    pivot = fdf.groupby(['Order_Year','Order_Month'])['Sales'].sum().unstack(fill_value=0)
    pivot.columns = [calendar.month_abbr[m] for m in pivot.columns]
    fig = px.imshow(pivot, title='Sales Heatmap (Year × Month)', color_continuous_scale='YlOrRd',
                    aspect='auto', labels=dict(color='Sales'))
    fig.update_layout(height=350)
    st.plotly_chart(fig, use_container_width=True)

# ========================= TAB 3: PRODUCTS =========================
with tab3:
    st.markdown("# 📦 Products & Categories")
    st.markdown("---")

    col1, col2 = st.columns(2)
    with col1:
        top_rev = fdf.groupby('Product_Name')['Sales'].sum().sort_values(ascending=False).head(10).reset_index()
        fig = px.bar(top_rev, x='Sales', y='Product_Name', orientation='h',
                     title='Top 10 Products by Revenue', color_discrete_sequence=[COLOR_PALETTE[0]])
        fig.update_layout(height=400, yaxis=dict(autorange='reversed'))
        st.plotly_chart(fig, use_container_width=True)
    with col2:
        top_qty = fdf.groupby('Product_Name')['Quantity'].sum().sort_values(ascending=False).head(10).reset_index()
        fig = px.bar(top_qty, x='Quantity', y='Product_Name', orientation='h',
                     title='Top 10 Products by Quantity', color_discrete_sequence=[COLOR_PALETTE[1]])
        fig.update_layout(height=400, yaxis=dict(autorange='reversed'))
        st.plotly_chart(fig, use_container_width=True)

    # Sub-category profit
    subcat = fdf.groupby('Sub_Category')['Profit'].sum().sort_values().reset_index()
    subcat['Color'] = subcat['Profit'].apply(lambda x: 'Profit' if x >= 0 else 'Loss')
    fig = px.bar(subcat, x='Profit', y='Sub_Category', orientation='h',
                 title='Profit by Sub-Category', color='Color',
                 color_discrete_map={'Profit': COLOR_PALETTE[0], 'Loss': COLOR_PALETTE[7]})
    fig.update_layout(height=450)
    st.plotly_chart(fig, use_container_width=True)

    # Discount vs Profit scatter
    fig = px.scatter(fdf.sample(min(2000, len(fdf)), random_state=42),
                     x='Discount', y='Profit', color='Category',
                     color_discrete_map=CAT_COLORS, opacity=0.5,
                     title='Discount vs Profit by Category')
    fig.update_layout(height=400)
    st.plotly_chart(fig, use_container_width=True)

# ========================= TAB 4: CUSTOMERS =========================
with tab4:
    st.markdown("# 👥 Customer Insights")
    st.markdown("---")

    # Top customers
    cust = (fdf.groupby(['Customer_ID','Customer_Name','Segment','Region'])
            .agg(Orders=('Order_ID','nunique'), Spend=('Sales','sum'), Profit=('Profit','sum'))
            .sort_values('Spend', ascending=False).reset_index())

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Customers", f"{fdf['Customer_ID'].nunique():,}")
    with col2:
        st.metric("Avg Spend/Customer", fmt_currency(cust['Spend'].mean()))
    with col3:
        st.metric("Avg Orders/Customer", f"{cust['Orders'].mean():.1f}")

    col1, col2 = st.columns(2)
    with col1:
        top10 = cust.head(10)
        fig = px.bar(top10, x='Customer_Name', y='Spend', title='Top 10 Customers by Spend',
                     color='Segment', color_discrete_sequence=COLOR_PALETTE)
        fig.update_layout(height=400, xaxis_tickangle=45)
        st.plotly_chart(fig, use_container_width=True)
    with col2:
        seg_cust = fdf.groupby('Segment').agg(Customers=('Customer_ID','nunique'),
                                              Sales=('Sales','sum')).reset_index()
        fig = px.sunburst(fdf.groupby(['Segment','Category']).agg(Sales=('Sales','sum')).reset_index(),
                          path=['Segment','Category'], values='Sales',
                          title='Sales: Segment → Category',
                          color_discrete_sequence=COLOR_PALETTE)
        fig.update_layout(height=400)
        st.plotly_chart(fig, use_container_width=True)

    # Customer frequency distribution
    fig = px.histogram(cust, x='Orders', nbins=30, title='Purchase Frequency Distribution',
                       color_discrete_sequence=[COLOR_PALETTE[0]], opacity=0.8)
    fig.update_layout(height=350, xaxis_title='Number of Orders', yaxis_title='Number of Customers')
    st.plotly_chart(fig, use_container_width=True)

# ========================= TAB 5: RECOMMENDATIONS =========================
with tab5:
    st.markdown("# 🤖 Product Recommendations")
    st.markdown("---")
    st.markdown("Select a customer to see personalized product recommendations.")

    # Customer selector
    cust_options = (fdf.groupby(['Customer_ID','Customer_Name'])
                    .agg(Orders=('Order_ID','nunique'))
                    .reset_index()
                    .sort_values('Orders', ascending=False))
    cust_options['display'] = cust_options['Customer_Name'] + ' (' + cust_options['Customer_ID'] + ') — ' + cust_options['Orders'].astype(str) + ' orders'

    display_list = cust_options['display'].tolist()
    if not display_list:
        st.warning("No customers found with current filters.")
        st.stop()
    selected = st.selectbox("Choose a customer:", display_list)
    if selected is None:
        st.stop()
    selected_id = selected.split('(')[1].split(')')[0]

    if st.button("🔍 Get Recommendations", type="primary"):
        with st.spinner("Computing recommendations..."):
            content_rec = ContentBasedRecommender(fdf)
            prefs = content_rec.get_customer_preferences(selected_id)

            if prefs:
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Total Orders", prefs['total_orders'])
                with col2:
                    st.metric("Total Spend", fmt_currency(prefs['total_spend']))
                with col3:
                    st.metric("Favorite Category", prefs['favorite_category'])

                st.markdown("### 📋 Content-Based Recommendations")
                recs = content_rec.recommend(selected_id, n=5)
                if not recs.empty:
                    st.dataframe(recs, use_container_width=True, hide_index=True)
                else:
                    st.info("No new recommendations available.")

                st.markdown("### 🤝 Collaborative Filtering Recommendations")
                try:
                    collab_rec = CollaborativeRecommender(fdf)
                    collab_recs = collab_rec.recommend(selected_id, n=5)
                    if not collab_recs.empty:
                        st.dataframe(collab_recs, use_container_width=True, hide_index=True)
                    else:
                        st.info("No collaborative recommendations available.")
                except Exception as e:
                    st.warning(f"Collaborative filtering unavailable: {e}")

                st.markdown("### 🛒 Purchase History")
                history = fdf[fdf['Customer_ID'] == selected_id][
                    ['Order_Date','Product_Name','Category','Sales','Quantity']
                ].sort_values('Order_Date', ascending=False)
                st.dataframe(history, use_container_width=True, hide_index=True)

# =============================================================================
# FOOTER
# =============================================================================
st.markdown("---")
st.markdown(
    "<div style='text-align: center; color: #9CA3AF; font-size: 13px;'>"
    "E-commerce Analytics Dashboard | Built with Streamlit & Plotly | "
    "Data Analysis & Recommendation System Project</div>",
    unsafe_allow_html=True
)
