"""
=============================================================================
E-commerce Dataset Generator
=============================================================================
Generates a realistic synthetic e-commerce dataset with ~10,000 orders.
Simulates patterns similar to Amazon/Flipkart including:
- Seasonal sales spikes (holidays, festivals)
- Realistic product pricing per category
- Discount-profit correlations
- Regional distribution across India/US-style regions
=============================================================================
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import random

# Set seed for reproducibility
np.random.seed(42)
random.seed(42)


# =============================================================================
# CONFIGURATION — Product Catalog, Regions, Customers
# =============================================================================

CATEGORIES = {
    'Technology': {
        'sub_categories': {
            'Phones': {'price_range': (8000, 80000), 'products': [
                'iPhone 15', 'Samsung Galaxy S24', 'OnePlus 12', 'Google Pixel 8',
                'Xiaomi 14', 'Vivo X100', 'Oppo Find X7', 'Realme GT 5'
            ]},
            'Laptops': {'price_range': (25000, 150000), 'products': [
                'MacBook Air M2', 'Dell XPS 15', 'HP Spectre x360', 'Lenovo ThinkPad X1',
                'ASUS ROG Zephyrus', 'Acer Predator Helios', 'MSI Creator Z16', 'Samsung Galaxy Book'
            ]},
            'Tablets': {'price_range': (10000, 90000), 'products': [
                'iPad Air', 'iPad Pro', 'Samsung Galaxy Tab S9', 'Lenovo Tab P12',
                'OnePlus Pad', 'Xiaomi Pad 6', 'Realme Pad 2'
            ]},
            'Accessories': {'price_range': (500, 15000), 'products': [
                'AirPods Pro', 'Sony WH-1000XM5', 'JBL Flip 6', 'Logitech MX Master',
                'Samsung T7 SSD', 'Anker PowerBank 20K', 'Apple Watch Ultra', 'Boat Airdopes 500'
            ]},
        }
    },
    'Furniture': {
        'sub_categories': {
            'Chairs': {'price_range': (3000, 35000), 'products': [
                'Ergonomic Office Chair', 'Gaming Chair Pro', 'Executive Leather Chair',
                'Mesh Back Chair', 'Folding Chair Set', 'Recliner Chair'
            ]},
            'Tables': {'price_range': (4000, 50000), 'products': [
                'Standing Desk', 'L-Shaped Computer Desk', 'Round Dining Table',
                'Coffee Table', 'Study Table', 'Conference Table'
            ]},
            'Storage': {'price_range': (2000, 25000), 'products': [
                'Bookshelf 5-Tier', 'Filing Cabinet', 'Wardrobe 3-Door',
                'TV Entertainment Unit', 'Kitchen Storage Rack', 'Shoe Rack'
            ]},
            'Furnishings': {'price_range': (500, 15000), 'products': [
                'Curtain Set Premium', 'Carpet Persian Style', 'Wall Art Set',
                'Cushion Cover Set', 'Table Lamp Designer', 'Photo Frame Set'
            ]},
        }
    },
    'Office Supplies': {
        'sub_categories': {
            'Paper': {'price_range': (100, 2000), 'products': [
                'A4 Paper 500 Sheets', 'Sticky Notes Combo', 'Spiral Notebook Set',
                'Legal Pad Pack', 'Graph Paper Pad', 'Envelope Pack 100'
            ]},
            'Writing': {'price_range': (50, 3000), 'products': [
                'Parker Pen Set', 'Highlighter Pack 10', 'Whiteboard Marker Set',
                'Pencil Box Premium', 'Gel Pen Pack 20', 'Calligraphy Set'
            ]},
            'Office Equipment': {'price_range': (1000, 20000), 'products': [
                'HP LaserJet Printer', 'Paper Shredder', 'Laminator Machine',
                'Label Maker', 'Projector Portable', 'Scanner Flatbed'
            ]},
            'Binders & Organizers': {'price_range': (200, 5000), 'products': [
                'Ring Binder Set', 'Desk Organizer Wood', 'File Folder Pack',
                'Document Holder', 'Pen Stand Premium', 'Cable Management Kit'
            ]},
        }
    }
}

REGIONS = {
    'North': ['Delhi', 'Haryana', 'Punjab', 'Uttar Pradesh', 'Rajasthan', 'Uttarakhand'],
    'South': ['Karnataka', 'Tamil Nadu', 'Kerala', 'Telangana', 'Andhra Pradesh'],
    'East': ['West Bengal', 'Bihar', 'Odisha', 'Jharkhand', 'Assam'],
    'West': ['Maharashtra', 'Gujarat', 'Goa', 'Madhya Pradesh']
}

CUSTOMER_SEGMENTS = ['Consumer', 'Corporate', 'Home Office', 'Small Business']

SHIP_MODES = ['Standard Class', 'Second Class', 'First Class', 'Same Day']


def generate_customers(n_customers=500):
    """Generate a list of unique customers."""
    first_names = [
        'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan',
        'Krishna', 'Ishaan', 'Ananya', 'Diya', 'Myra', 'Sara', 'Aanya', 'Aadhya',
        'Priya', 'Riya', 'Neha', 'Pooja', 'Rahul', 'Amit', 'Vikram', 'Rohan',
        'Suresh', 'Rajesh', 'Deepak', 'Manish', 'Sanjay', 'Kiran', 'Meera', 'Lakshmi',
        'Kavita', 'Sunita', 'Rekha', 'Sneha', 'Divya', 'Anjali', 'Nisha', 'Pallavi',
        'Mohit', 'Nikhil', 'Gaurav', 'Harsh', 'Kunal', 'Tarun', 'Varun', 'Akash',
        'Shivam', 'Tushar', 'Ritika', 'Shruti', 'Swati', 'Komal', 'Tanvi', 'Isha'
    ]
    last_names = [
        'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Reddy', 'Nair',
        'Iyer', 'Menon', 'Das', 'Chatterjee', 'Banerjee', 'Mukherjee', 'Joshi',
        'Mishra', 'Pandey', 'Tiwari', 'Dubey', 'Yadav', 'Agarwal', 'Jain',
        'Kapoor', 'Malhotra', 'Bhatia', 'Khanna', 'Mehra', 'Sinha', 'Saxena', 'Chopra'
    ]

    customers = []
    used_names = set()
    for i in range(n_customers):
        while True:
            name = f"{random.choice(first_names)} {random.choice(last_names)}"
            if name not in used_names:
                used_names.add(name)
                break

        customer_id = f"CUST-{i+1001:04d}"
        segment = np.random.choice(CUSTOMER_SEGMENTS, p=[0.5, 0.25, 0.15, 0.10])
        region = random.choice(list(REGIONS.keys()))
        state = random.choice(REGIONS[region])

        customers.append({
            'Customer_ID': customer_id,
            'Customer_Name': name,
            'Segment': segment,
            'Region': region,
            'State': state
        })

    return customers


def generate_orders(customers, n_orders=10000):
    """Generate realistic e-commerce orders with seasonal patterns."""

    # Build flat product list
    product_list = []
    for category, cat_data in CATEGORIES.items():
        for sub_cat, sub_data in cat_data['sub_categories'].items():
            for product in sub_data['products']:
                product_list.append({
                    'Product_Name': product,
                    'Category': category,
                    'Sub_Category': sub_cat,
                    'Price_Min': sub_data['price_range'][0],
                    'Price_Max': sub_data['price_range'][1],
                })

    # Assign product IDs
    for i, p in enumerate(product_list):
        p['Product_ID'] = f"PROD-{i+101:04d}"

    orders = []
    start_date = datetime(2021, 1, 1)
    end_date = datetime(2024, 12, 31)
    total_days = (end_date - start_date).days

    for i in range(n_orders):
        # ---- Date with seasonal bias ----
        # Higher probability for Oct-Dec (festive season) and Jul-Aug (sales)
        month_weights = [0.06, 0.05, 0.07, 0.07, 0.08, 0.08,
                         0.10, 0.09, 0.08, 0.10, 0.12, 0.10]

        year = np.random.choice([2021, 2022, 2023, 2024], p=[0.18, 0.23, 0.28, 0.31])
        month = np.random.choice(range(1, 13), p=month_weights)
        day = random.randint(1, 28)  # Safe for all months
        order_date = datetime(year, month, day)

        # Ship date: 1–7 days after order
        ship_mode = np.random.choice(SHIP_MODES, p=[0.55, 0.20, 0.15, 0.10])
        ship_delays = {'Standard Class': (3, 7), 'Second Class': (2, 5),
                       'First Class': (1, 3), 'Same Day': (0, 0)}
        delay = random.randint(*ship_delays[ship_mode])
        ship_date = order_date + timedelta(days=delay)

        # ---- Customer ----
        customer = random.choice(customers)

        # ---- Product ----
        # Category probability: Tech most popular
        cat_probs = {'Technology': 0.45, 'Furniture': 0.25, 'Office Supplies': 0.30}
        chosen_category = np.random.choice(list(cat_probs.keys()), p=list(cat_probs.values()))

        # Filter products by category
        cat_products = [p for p in product_list if p['Category'] == chosen_category]
        product = random.choice(cat_products)

        # ---- Sales, Quantity, Discount, Profit ----
        base_price = random.uniform(product['Price_Min'], product['Price_Max'])
        quantity = np.random.choice([1, 2, 3, 4, 5], p=[0.40, 0.30, 0.15, 0.10, 0.05])

        # Discount: higher for Office Supplies, lower for Technology
        if chosen_category == 'Technology':
            discount = np.random.choice([0, 0.05, 0.10, 0.15, 0.20],
                                        p=[0.40, 0.25, 0.20, 0.10, 0.05])
        elif chosen_category == 'Furniture':
            discount = np.random.choice([0, 0.05, 0.10, 0.15, 0.20, 0.30],
                                        p=[0.25, 0.20, 0.25, 0.15, 0.10, 0.05])
        else:
            discount = np.random.choice([0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30],
                                        p=[0.20, 0.15, 0.20, 0.20, 0.10, 0.10, 0.05])

        sales = round(base_price * quantity * (1 - discount), 2)

        # Profit: margins vary by category
        margin_ranges = {
            'Technology': (0.10, 0.35),
            'Furniture': (-0.10, 0.20),
            'Office Supplies': (0.05, 0.40)
        }
        margin = random.uniform(*margin_ranges[chosen_category])

        # High discount reduces profit significantly
        if discount >= 0.20:
            margin -= 0.15

        profit = round(sales * margin, 2)

        # ---- Order ID ----
        order_id = f"ORD-{year}{month:02d}-{i+1:05d}"

        orders.append({
            'Order_ID': order_id,
            'Order_Date': order_date.strftime('%Y-%m-%d'),
            'Ship_Date': ship_date.strftime('%Y-%m-%d'),
            'Ship_Mode': ship_mode,
            'Customer_ID': customer['Customer_ID'],
            'Customer_Name': customer['Customer_Name'],
            'Segment': customer['Segment'],
            'Region': customer['Region'],
            'State': customer['State'],
            'Product_ID': product['Product_ID'],
            'Product_Name': product['Product_Name'],
            'Category': product['Category'],
            'Sub_Category': product['Sub_Category'],
            'Sales': sales,
            'Quantity': quantity,
            'Discount': discount,
            'Profit': profit
        })

    return pd.DataFrame(orders)


def introduce_data_quality_issues(df):
    """
    Introduce controlled data quality issues for realistic data cleaning practice.
    This makes the dataset more realistic and gives students practice with cleaning.
    """
    df = df.copy()
    n = len(df)

    # 1. Add some missing values (~2% in select columns)
    missing_indices = np.random.choice(n, size=int(n * 0.02), replace=False)
    df.loc[missing_indices[:len(missing_indices)//2], 'Ship_Date'] = np.nan

    missing_indices2 = np.random.choice(n, size=int(n * 0.01), replace=False)
    df.loc[missing_indices2, 'Customer_Name'] = np.nan

    # 2. Add ~50 duplicate rows
    dup_indices = np.random.choice(n, size=50, replace=False)
    duplicates = df.iloc[dup_indices].copy()
    df = pd.concat([df, duplicates], ignore_index=True)

    # 3. Shuffle the dataframe
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    return df


def generate_dataset(output_path='data/ecommerce_data.csv', n_customers=500, n_orders=10000):
    """Main function to generate and save the complete dataset."""

    print("=" * 60)
    print("   E-COMMERCE DATASET GENERATOR")
    print("=" * 60)

    # Step 1: Generate customers
    print("\n📋 Generating customers...")
    customers = generate_customers(n_customers)
    print(f"   ✅ Created {len(customers)} unique customers")

    # Step 2: Generate orders
    print("\n🛒 Generating orders...")
    df = generate_orders(customers, n_orders)
    print(f"   ✅ Created {len(df)} orders")

    # Step 3: Introduce data quality issues
    print("\n🔧 Adding realistic data quality issues...")
    df = introduce_data_quality_issues(df)
    print(f"   ✅ Added missing values & duplicates (new shape: {df.shape})")

    # Step 4: Save to CSV
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"\n💾 Dataset saved to: {output_path}")

    # Step 5: Print summary
    print("\n" + "=" * 60)
    print("   DATASET SUMMARY")
    print("=" * 60)
    print(f"   📊 Total Records    : {len(df)}")
    print(f"   📅 Date Range       : {df['Order_Date'].min()} to {df['Order_Date'].max()}")
    print(f"   👥 Unique Customers : {df['Customer_ID'].nunique()}")
    print(f"   📦 Unique Products  : {df['Product_Name'].nunique()}")
    print(f"   🏷️  Categories       : {df['Category'].nunique()}")
    print(f"   🗺️  Regions          : {df['Region'].nunique()}")
    print(f"   💰 Total Sales      : ₹{df['Sales'].sum():,.2f}")
    print(f"   📈 Total Profit     : ₹{df['Profit'].sum():,.2f}")
    print(f"   ❌ Missing Values   : {df.isnull().sum().sum()}")
    print("=" * 60)

    return df


# =============================================================================
# Run dataset generation when script is executed directly
# =============================================================================
if __name__ == '__main__':
    # Use path relative to project root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    output_path = os.path.join(project_root, 'data', 'ecommerce_data.csv')

    df = generate_dataset(output_path=output_path)
    print(f"\n🎉 Dataset generation complete! Check: {output_path}")
