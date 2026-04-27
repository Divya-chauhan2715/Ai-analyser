"""
=============================================================================
Visualization Module
=============================================================================
Professional chart-generation functions for e-commerce data analysis.
Uses matplotlib and seaborn with a consistent, polished color palette.
=============================================================================
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import seaborn as sns
import os
import warnings
warnings.filterwarnings('ignore')

# =============================================================================
# STYLE CONFIGURATION
# =============================================================================

# Professional color palette
COLORS = {
    'primary': '#6366F1',       # Indigo
    'secondary': '#EC4899',     # Pink
    'success': '#10B981',       # Emerald
    'warning': '#F59E0B',       # Amber
    'danger': '#EF4444',        # Red
    'info': '#06B6D4',          # Cyan
    'purple': '#8B5CF6',        # Purple
    'orange': '#F97316',        # Orange
}

PALETTE = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#06B6D4',
           '#8B5CF6', '#F97316', '#EF4444', '#14B8A6', '#A855F7']

CATEGORY_COLORS = {
    'Technology': '#6366F1',
    'Furniture': '#EC4899',
    'Office Supplies': '#10B981'
}

REGION_COLORS = {
    'North': '#6366F1',
    'South': '#EC4899',
    'East': '#F59E0B',
    'West': '#10B981'
}


def setup_style():
    """Set up the global matplotlib style for professional charts."""
    plt.style.use('seaborn-v0_8-whitegrid')
    plt.rcParams.update({
        'figure.facecolor': '#FAFBFC',
        'axes.facecolor': '#FFFFFF',
        'axes.edgecolor': '#E5E7EB',
        'axes.labelcolor': '#374151',
        'axes.titleweight': 'bold',
        'axes.titlesize': 14,
        'axes.labelsize': 11,
        'xtick.color': '#6B7280',
        'ytick.color': '#6B7280',
        'xtick.labelsize': 9,
        'ytick.labelsize': 9,
        'legend.fontsize': 10,
        'font.family': 'sans-serif',
        'grid.alpha': 0.3,
        'grid.color': '#E5E7EB',
    })


def save_chart(fig, filename, output_dir='outputs'):
    """Save chart to output directory."""
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, filename)
    fig.savefig(filepath, dpi=150, bbox_inches='tight', facecolor=fig.get_facecolor())
    print(f"   💾 Chart saved: {filepath}")


def format_currency(x, pos=None):
    """Format numbers as Indian Rupees."""
    if x >= 10000000:
        return f'₹{x/10000000:.1f}Cr'
    elif x >= 100000:
        return f'₹{x/100000:.1f}L'
    elif x >= 1000:
        return f'₹{x/1000:.1f}K'
    return f'₹{x:.0f}'


# =============================================================================
# CHART FUNCTIONS
# =============================================================================

def plot_top_products(df, n=10, by='revenue', save=True, output_dir='outputs'):
    """
    Horizontal bar chart of top N products.
    """
    setup_style()

    if by == 'revenue':
        data = (df.groupby('Product_Name')['Sales'].sum()
                .sort_values(ascending=True).tail(n))
        title = f'Top {n} Products by Revenue'
        xlabel = 'Total Revenue (₹)'
        color = COLORS['primary']
    else:
        data = (df.groupby('Product_Name')['Quantity'].sum()
                .sort_values(ascending=True).tail(n))
        title = f'Top {n} Products by Quantity Sold'
        xlabel = 'Total Quantity'
        color = COLORS['success']

    fig, ax = plt.subplots(figsize=(12, 7))

    bars = ax.barh(range(len(data)), data.values, color=color, alpha=0.85,
                   edgecolor='white', linewidth=0.5, height=0.7)

    # Add value labels
    for bar, val in zip(bars, data.values):
        if by == 'revenue':
            label = format_currency(val)
        else:
            label = f'{int(val)}'
        ax.text(bar.get_width() + data.max() * 0.01, bar.get_y() + bar.get_height()/2,
                label, va='center', fontsize=9, color='#374151', fontweight='bold')

    ax.set_yticks(range(len(data)))
    ax.set_yticklabels(data.index, fontsize=10)
    ax.set_xlabel(xlabel)
    ax.set_title(title, fontsize=16, pad=15)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    plt.tight_layout()
    if save:
        save_chart(fig, f'top_products_{by}.png', output_dir)
    return fig


def plot_category_performance(df, save=True, output_dir='outputs'):
    """
    Grouped bar chart showing Sales and Profit by Category.
    """
    setup_style()

    cat_data = (df.groupby('Category')
                .agg(Sales=('Sales', 'sum'), Profit=('Profit', 'sum'))
                .reset_index())

    fig, ax = plt.subplots(figsize=(10, 6))

    x = np.arange(len(cat_data))
    width = 0.35

    bars1 = ax.bar(x - width/2, cat_data['Sales'], width, label='Sales',
                   color=COLORS['primary'], alpha=0.85, edgecolor='white')
    bars2 = ax.bar(x + width/2, cat_data['Profit'], width, label='Profit',
                   color=COLORS['success'], alpha=0.85, edgecolor='white')

    # Value labels
    for bar in bars1:
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height(),
                format_currency(bar.get_height()), ha='center', va='bottom',
                fontsize=9, fontweight='bold', color=COLORS['primary'])

    for bar in bars2:
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height(),
                format_currency(bar.get_height()), ha='center', va='bottom',
                fontsize=9, fontweight='bold', color=COLORS['success'])

    ax.set_xticks(x)
    ax.set_xticklabels(cat_data['Category'], fontsize=11)
    ax.set_ylabel('Amount (₹)')
    ax.set_title('Sales vs Profit by Category', fontsize=16, pad=15)
    ax.legend(frameon=True, fancybox=True, shadow=True)
    ax.yaxis.set_major_formatter(ticker.FuncFormatter(format_currency))
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    plt.tight_layout()
    if save:
        save_chart(fig, 'category_performance.png', output_dir)
    return fig


def plot_subcategory_profit(df, save=True, output_dir='outputs'):
    """
    Horizontal bar chart of profit by sub-category (shows losses in red).
    """
    setup_style()

    subcat = (df.groupby('Sub_Category')['Profit'].sum()
              .sort_values(ascending=True))

    fig, ax = plt.subplots(figsize=(12, 8))

    colors = [COLORS['danger'] if v < 0 else COLORS['primary'] for v in subcat.values]

    bars = ax.barh(range(len(subcat)), subcat.values, color=colors,
                   alpha=0.85, edgecolor='white', height=0.7)

    for bar, val in zip(bars, subcat.values):
        label = format_currency(abs(val))
        if val < 0:
            label = f'-{label}'
        offset = subcat.max() * 0.01 if val >= 0 else -subcat.max() * 0.15
        ax.text(val + offset, bar.get_y() + bar.get_height()/2,
                label, va='center', fontsize=9, fontweight='bold',
                color=COLORS['danger'] if val < 0 else '#374151')

    ax.set_yticks(range(len(subcat)))
    ax.set_yticklabels(subcat.index, fontsize=10)
    ax.axvline(x=0, color='#9CA3AF', linestyle='-', linewidth=0.8)
    ax.set_xlabel('Total Profit (₹)')
    ax.set_title('Profit by Sub-Category', fontsize=16, pad=15)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    plt.tight_layout()
    if save:
        save_chart(fig, 'subcategory_profit.png', output_dir)
    return fig


def plot_sales_trend(df, period='monthly', save=True, output_dir='outputs'):
    """
    Line chart showing sales trend over time.
    """
    setup_style()

    df = df.copy()
    df['Order_Date'] = pd.to_datetime(df['Order_Date'])

    if period == 'monthly':
        trend = (df.groupby('Year_Month')
                 .agg(Sales=('Sales', 'sum'), Profit=('Profit', 'sum'))
                 .reset_index()
                 .sort_values('Year_Month'))
        x_col = 'Year_Month'
        title = 'Monthly Sales & Profit Trend'
    else:
        trend = (df.groupby('Order_Year')
                 .agg(Sales=('Sales', 'sum'), Profit=('Profit', 'sum'))
                 .reset_index()
                 .sort_values('Order_Year'))
        x_col = 'Order_Year'
        title = 'Yearly Sales & Profit Trend'

    fig, ax1 = plt.subplots(figsize=(14, 6))

    # Sales line
    ax1.fill_between(range(len(trend)), trend['Sales'], alpha=0.15, color=COLORS['primary'])
    ax1.plot(range(len(trend)), trend['Sales'], color=COLORS['primary'],
             linewidth=2.5, marker='o', markersize=4, label='Sales', zorder=5)

    # Profit line
    ax1.fill_between(range(len(trend)), trend['Profit'], alpha=0.15, color=COLORS['success'])
    ax1.plot(range(len(trend)), trend['Profit'], color=COLORS['success'],
             linewidth=2.5, marker='s', markersize=4, label='Profit', zorder=5)

    ax1.set_xticks(range(len(trend)))
    if period == 'monthly':
        labels = trend[x_col].tolist()
        ax1.set_xticklabels(labels, rotation=45, ha='right', fontsize=7)
    else:
        ax1.set_xticklabels(trend[x_col].astype(str).tolist(), fontsize=10)

    ax1.yaxis.set_major_formatter(ticker.FuncFormatter(format_currency))
    ax1.set_ylabel('Amount (₹)')
    ax1.set_title(title, fontsize=16, pad=15)
    ax1.legend(frameon=True, fancybox=True, shadow=True, loc='upper left')
    ax1.spines['top'].set_visible(False)
    ax1.spines['right'].set_visible(False)

    plt.tight_layout()
    if save:
        save_chart(fig, f'sales_trend_{period}.png', output_dir)
    return fig


def plot_region_performance(df, save=True, output_dir='outputs'):
    """
    Bar chart of sales and profit by region with pie chart.
    """
    setup_style()

    region = (df.groupby('Region')
              .agg(Sales=('Sales', 'sum'), Profit=('Profit', 'sum'),
                   Orders=('Order_ID', 'nunique'))
              .reset_index())

    fig, axes = plt.subplots(1, 2, figsize=(14, 6))

    # Bar chart
    ax = axes[0]
    x = np.arange(len(region))
    width = 0.35
    colors_sales = [REGION_COLORS.get(r, COLORS['primary']) for r in region['Region']]

    bars = ax.bar(x, region['Sales'], width=0.6, color=colors_sales,
                  alpha=0.85, edgecolor='white')

    for bar, val in zip(bars, region['Sales']):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height(),
                format_currency(val), ha='center', va='bottom',
                fontsize=10, fontweight='bold')

    ax.set_xticks(x)
    ax.set_xticklabels(region['Region'], fontsize=11)
    ax.set_ylabel('Total Sales (₹)')
    ax.set_title('Sales by Region', fontsize=14, pad=10)
    ax.yaxis.set_major_formatter(ticker.FuncFormatter(format_currency))
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    # Pie chart
    ax2 = axes[1]
    colors_pie = [REGION_COLORS.get(r, COLORS['primary']) for r in region['Region']]
    wedges, texts, autotexts = ax2.pie(
        region['Sales'], labels=region['Region'], autopct='%1.1f%%',
        colors=colors_pie, startangle=90, pctdistance=0.85,
        wedgeprops=dict(width=0.5, edgecolor='white', linewidth=2)
    )
    for autotext in autotexts:
        autotext.set_fontsize(10)
        autotext.set_fontweight('bold')
    ax2.set_title('Sales Distribution by Region', fontsize=14, pad=10)

    plt.suptitle('Region-wise Performance Analysis', fontsize=16, fontweight='bold', y=1.02)
    plt.tight_layout()
    if save:
        save_chart(fig, 'region_performance.png', output_dir)
    return fig


def plot_customer_segments(df, save=True, output_dir='outputs'):
    """
    Visualization of customer segments.
    """
    setup_style()

    seg = (df.groupby('Segment')
           .agg(Sales=('Sales', 'sum'), Profit=('Profit', 'sum'),
                Customers=('Customer_ID', 'nunique'),
                Orders=('Order_ID', 'nunique'))
           .reset_index())

    fig, axes = plt.subplots(1, 2, figsize=(14, 6))

    # Sales by segment
    ax1 = axes[0]
    bars = ax1.bar(seg['Segment'], seg['Sales'], color=PALETTE[:len(seg)],
                   alpha=0.85, edgecolor='white', width=0.6)
    for bar, val in zip(bars, seg['Sales']):
        ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height(),
                 format_currency(val), ha='center', va='bottom',
                 fontsize=9, fontweight='bold')
    ax1.set_title('Sales by Customer Segment', fontsize=14, pad=10)
    ax1.yaxis.set_major_formatter(ticker.FuncFormatter(format_currency))
    ax1.spines['top'].set_visible(False)
    ax1.spines['right'].set_visible(False)

    # Orders by segment
    ax2 = axes[1]
    bars = ax2.bar(seg['Segment'], seg['Orders'], color=PALETTE[:len(seg)],
                   alpha=0.85, edgecolor='white', width=0.6)
    for bar, val in zip(bars, seg['Orders']):
        ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height(),
                 f'{int(val)}', ha='center', va='bottom',
                 fontsize=9, fontweight='bold')
    ax2.set_title('Orders by Customer Segment', fontsize=14, pad=10)
    ax2.spines['top'].set_visible(False)
    ax2.spines['right'].set_visible(False)

    plt.suptitle('Customer Segment Analysis', fontsize=16, fontweight='bold', y=1.02)
    plt.tight_layout()
    if save:
        save_chart(fig, 'customer_segments.png', output_dir)
    return fig


def plot_discount_vs_profit(df, save=True, output_dir='outputs'):
    """
    Scatter plot showing discount vs profit relationship.
    """
    setup_style()

    fig, axes = plt.subplots(1, 2, figsize=(14, 6))

    # Scatter plot
    ax1 = axes[0]
    cat_colors = [CATEGORY_COLORS.get(c, COLORS['primary']) for c in df['Category']]
    ax1.scatter(df['Discount'] * 100, df['Profit'], c=cat_colors,
                alpha=0.3, s=20, edgecolors='none')

    # Add trend line
    z = np.polyfit(df['Discount'] * 100, df['Profit'], 1)
    p = np.poly1d(z)
    x_trend = np.linspace(0, df['Discount'].max() * 100, 100)
    ax1.plot(x_trend, p(x_trend), color=COLORS['danger'], linewidth=2,
             linestyle='--', label=f'Trend (slope={z[0]:.0f})')

    ax1.axhline(y=0, color='#9CA3AF', linestyle='-', linewidth=0.8)
    ax1.set_xlabel('Discount (%)')
    ax1.set_ylabel('Profit (₹)')
    ax1.set_title('Discount vs Profit', fontsize=14, pad=10)
    ax1.legend()
    ax1.spines['top'].set_visible(False)
    ax1.spines['right'].set_visible(False)

    # Box plot by discount category
    ax2 = axes[1]
    discount_order = ['No Discount', 'Low (1-10%)', 'Medium (11-20%)', 'High (>20%)']
    valid_cats = [c for c in discount_order if c in df['Discount_Category'].values]
    df_filtered = df[df['Discount_Category'].isin(valid_cats)]

    sns.boxplot(data=df_filtered, x='Discount_Category', y='Profit',
                order=valid_cats, palette=PALETTE[:len(valid_cats)], ax=ax2,
                flierprops=dict(marker='o', markersize=3, alpha=0.3))
    ax2.axhline(y=0, color=COLORS['danger'], linestyle='--', linewidth=0.8)
    ax2.set_xlabel('Discount Category')
    ax2.set_ylabel('Profit (₹)')
    ax2.set_title('Profit Distribution by Discount Level', fontsize=14, pad=10)
    ax2.spines['top'].set_visible(False)
    ax2.spines['right'].set_visible(False)

    plt.suptitle('Impact of Discounts on Profitability', fontsize=16, fontweight='bold', y=1.02)
    plt.tight_layout()
    if save:
        save_chart(fig, 'discount_vs_profit.png', output_dir)
    return fig


def plot_monthly_heatmap(df, save=True, output_dir='outputs'):
    """
    Heatmap showing sales by month and year.
    """
    setup_style()

    pivot = (df.groupby(['Order_Year', 'Order_Month'])['Sales'].sum()
             .unstack(fill_value=0))

    # Rename months
    import calendar
    pivot.columns = [calendar.month_abbr[m] for m in pivot.columns]

    fig, ax = plt.subplots(figsize=(14, 5))

    sns.heatmap(pivot, annot=True, fmt=',.0f', cmap='YlOrRd',
                linewidths=1, linecolor='white', ax=ax,
                cbar_kws={'label': 'Sales (₹)', 'format': ticker.FuncFormatter(format_currency)})

    ax.set_xlabel('Month', fontsize=12)
    ax.set_ylabel('Year', fontsize=12)
    ax.set_title('Sales Heatmap — Month × Year', fontsize=16, pad=15)
    ax.set_yticklabels(ax.get_yticklabels(), rotation=0)

    plt.tight_layout()
    if save:
        save_chart(fig, 'sales_heatmap.png', output_dir)
    return fig


def plot_sales_by_day_of_week(df, save=True, output_dir='outputs'):
    """Bar chart showing average sales by day of week."""
    setup_style()

    day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    day_sales = (df.groupby('Order_DayOfWeek')['Sales'].mean()
                 .reindex(day_order))

    fig, ax = plt.subplots(figsize=(10, 5))

    colors = [COLORS['primary'] if d in ['Saturday', 'Sunday'] else COLORS['info']
              for d in day_order]

    bars = ax.bar(day_sales.index, day_sales.values, color=colors,
                  alpha=0.85, edgecolor='white', width=0.6)

    for bar, val in zip(bars, day_sales.values):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height(),
                format_currency(val), ha='center', va='bottom',
                fontsize=9, fontweight='bold')

    ax.set_ylabel('Average Sales (₹)')
    ax.set_title('Average Sales by Day of Week', fontsize=16, pad=15)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    plt.xticks(rotation=45, ha='right')

    plt.tight_layout()
    if save:
        save_chart(fig, 'sales_by_day.png', output_dir)
    return fig


def plot_correlation_heatmap(df, save=True, output_dir='outputs'):
    """Correlation heatmap for numerical features."""
    setup_style()

    numeric_cols = ['Sales', 'Quantity', 'Discount', 'Profit', 'Profit_Margin',
                    'Shipping_Days']
    available_cols = [c for c in numeric_cols if c in df.columns]
    corr = df[available_cols].corr()

    fig, ax = plt.subplots(figsize=(8, 7))

    mask = np.triu(np.ones_like(corr, dtype=bool), k=1)
    sns.heatmap(corr, mask=mask, annot=True, fmt='.2f',
                cmap='RdYlBu_r', center=0, linewidths=1, linecolor='white',
                ax=ax, square=True, vmin=-1, vmax=1,
                cbar_kws={'shrink': 0.8})

    ax.set_title('Feature Correlation Matrix', fontsize=16, pad=15)

    plt.tight_layout()
    if save:
        save_chart(fig, 'correlation_heatmap.png', output_dir)
    return fig


def plot_all(df, output_dir='outputs'):
    """Generate all charts and save to output directory."""
    print("\n" + "=" * 60)
    print("   GENERATING ALL VISUALIZATIONS")
    print("=" * 60)

    os.makedirs(output_dir, exist_ok=True)

    charts = [
        ("Top Products (Revenue)", lambda: plot_top_products(df, by='revenue', output_dir=output_dir)),
        ("Top Products (Quantity)", lambda: plot_top_products(df, by='quantity', output_dir=output_dir)),
        ("Category Performance", lambda: plot_category_performance(df, output_dir=output_dir)),
        ("Sub-Category Profit", lambda: plot_subcategory_profit(df, output_dir=output_dir)),
        ("Monthly Sales Trend", lambda: plot_sales_trend(df, period='monthly', output_dir=output_dir)),
        ("Yearly Sales Trend", lambda: plot_sales_trend(df, period='yearly', output_dir=output_dir)),
        ("Region Performance", lambda: plot_region_performance(df, output_dir=output_dir)),
        ("Customer Segments", lambda: plot_customer_segments(df, output_dir=output_dir)),
        ("Discount vs Profit", lambda: plot_discount_vs_profit(df, output_dir=output_dir)),
        ("Sales Heatmap", lambda: plot_monthly_heatmap(df, output_dir=output_dir)),
        ("Sales by Day of Week", lambda: plot_sales_by_day_of_week(df, output_dir=output_dir)),
        ("Correlation Matrix", lambda: plot_correlation_heatmap(df, output_dir=output_dir)),
    ]

    for name, chart_fn in charts:
        try:
            print(f"\n📊 {name}...")
            chart_fn()
            plt.close()
            print(f"   ✅ Done")
        except Exception as e:
            print(f"   ❌ Error: {e}")

    print(f"\n🎉 All visualizations saved to: {output_dir}/")
