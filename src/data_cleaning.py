"""
=============================================================================
Data Cleaning & Preprocessing Module
=============================================================================
Functions for loading, cleaning, and feature-engineering the e-commerce dataset.
Handles missing values, duplicates, data type conversions, and creates
new features useful for analysis.
=============================================================================
"""

import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')


def load_data(filepath):
    """
    Load the e-commerce dataset from CSV.

    Parameters:
        filepath (str): Path to the CSV file

    Returns:
        pd.DataFrame: Raw dataframe
    """
    print("📂 Loading dataset...")
    df = pd.read_csv(filepath)
    print(f"   ✅ Loaded {df.shape[0]} rows × {df.shape[1]} columns")
    return df


def explore_data(df):
    """
    Perform initial data exploration and print summary statistics.

    Parameters:
        df (pd.DataFrame): Input dataframe

    Returns:
        dict: Dictionary with exploration results
    """
    print("\n" + "=" * 60)
    print("   DATA EXPLORATION")
    print("=" * 60)

    # Basic info
    print(f"\n📊 Shape: {df.shape}")
    print(f"\n📋 Columns: {list(df.columns)}")

    # Data types
    print(f"\n🔤 Data Types:")
    for col, dtype in df.dtypes.items():
        print(f"   {col:20s} → {dtype}")

    # Missing values
    missing = df.isnull().sum()
    missing_pct = (df.isnull().sum() / len(df) * 100).round(2)
    missing_df = pd.DataFrame({'Missing Count': missing, 'Missing %': missing_pct})
    missing_df = missing_df[missing_df['Missing Count'] > 0]

    if len(missing_df) > 0:
        print(f"\n❌ Missing Values:")
        for col, row in missing_df.iterrows():
            print(f"   {col:20s} → {int(row['Missing Count'])} ({row['Missing %']}%)")
    else:
        print(f"\n✅ No missing values found!")

    # Duplicates
    n_duplicates = df.duplicated().sum()
    print(f"\n📝 Duplicate Rows: {n_duplicates}")

    # Numerical summary
    print(f"\n📈 Numerical Summary:")
    print(df.describe().round(2).to_string())

    return {
        'shape': df.shape,
        'missing': missing_df,
        'duplicates': n_duplicates,
        'dtypes': df.dtypes
    }


def clean_data(df):
    """
    Clean the dataset by handling missing values, duplicates, and data types.

    Parameters:
        df (pd.DataFrame): Raw dataframe

    Returns:
        pd.DataFrame: Cleaned dataframe
    """
    print("\n" + "=" * 60)
    print("   DATA CLEANING")
    print("=" * 60)

    df_clean = df.copy()
    initial_shape = df_clean.shape[0]

    # ---- Step 1: Remove duplicates ----
    n_duplicates = df_clean.duplicated().sum()
    df_clean = df_clean.drop_duplicates().reset_index(drop=True)
    print(f"\n1️⃣  Removed {n_duplicates} duplicate rows")

    # ---- Step 2: Handle missing values ----
    # Fill missing Customer_Name with 'Unknown'
    if 'Customer_Name' in df_clean.columns:
        n_missing_name = df_clean['Customer_Name'].isnull().sum()
        df_clean['Customer_Name'] = df_clean['Customer_Name'].fillna('Unknown Customer')
        print(f"2️⃣  Filled {n_missing_name} missing Customer Names with 'Unknown Customer'")

    # Fill missing Ship_Date with Order_Date + median shipping days
    if 'Ship_Date' in df_clean.columns and 'Order_Date' in df_clean.columns:
        n_missing_ship = df_clean['Ship_Date'].isnull().sum()
        # Convert to datetime first for calculation
        df_clean['Order_Date'] = pd.to_datetime(df_clean['Order_Date'])
        df_clean['Ship_Date'] = pd.to_datetime(df_clean['Ship_Date'])

        # Calculate median shipping delay
        valid_mask = df_clean['Ship_Date'].notna() & df_clean['Order_Date'].notna()
        median_delay = (df_clean.loc[valid_mask, 'Ship_Date'] -
                        df_clean.loc[valid_mask, 'Order_Date']).dt.days.median()

        # Fill missing ship dates
        missing_ship = df_clean['Ship_Date'].isnull()
        df_clean.loc[missing_ship, 'Ship_Date'] = (
            df_clean.loc[missing_ship, 'Order_Date'] + pd.Timedelta(days=median_delay)
        )
        print(f"3️⃣  Filled {n_missing_ship} missing Ship Dates (median delay: {int(median_delay)} days)")

    # ---- Step 3: Convert data types ----
    df_clean['Order_Date'] = pd.to_datetime(df_clean['Order_Date'])
    df_clean['Ship_Date'] = pd.to_datetime(df_clean['Ship_Date'])

    # Ensure numeric columns
    numeric_cols = ['Sales', 'Quantity', 'Discount', 'Profit']
    for col in numeric_cols:
        df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')

    print(f"4️⃣  Converted date and numeric columns to proper types")

    # ---- Step 4: Remove any remaining nulls in critical columns ----
    critical_cols = ['Order_ID', 'Customer_ID', 'Product_ID', 'Sales']
    before = len(df_clean)
    df_clean = df_clean.dropna(subset=critical_cols)
    dropped = before - len(df_clean)
    if dropped > 0:
        print(f"5️⃣  Dropped {dropped} rows with missing critical fields")

    final_shape = df_clean.shape[0]
    print(f"\n✅ Cleaning complete: {initial_shape} → {final_shape} rows "
          f"({initial_shape - final_shape} removed)")

    return df_clean


def add_features(df):
    """
    Create new features for analysis from existing columns.

    Parameters:
        df (pd.DataFrame): Cleaned dataframe

    Returns:
        pd.DataFrame: Dataframe with new features
    """
    print("\n" + "=" * 60)
    print("   FEATURE ENGINEERING")
    print("=" * 60)

    df = df.copy()

    # Ensure datetime
    df['Order_Date'] = pd.to_datetime(df['Order_Date'])
    df['Ship_Date'] = pd.to_datetime(df['Ship_Date'])

    # ---- Time-based features ----
    df['Order_Year'] = df['Order_Date'].dt.year
    df['Order_Month'] = df['Order_Date'].dt.month
    df['Order_Month_Name'] = df['Order_Date'].dt.strftime('%B')
    df['Order_Quarter'] = df['Order_Date'].dt.quarter
    df['Order_DayOfWeek'] = df['Order_Date'].dt.day_name()
    df['Order_WeekOfYear'] = df['Order_Date'].dt.isocalendar().week.astype(int)
    df['Year_Month'] = df['Order_Date'].dt.to_period('M').astype(str)

    # ---- Shipping features ----
    df['Shipping_Days'] = (df['Ship_Date'] - df['Order_Date']).dt.days

    # ---- Financial features ----
    df['Profit_Margin'] = (df['Profit'] / df['Sales'] * 100).round(2)
    df['Revenue_Per_Unit'] = (df['Sales'] / df['Quantity']).round(2)

    # ---- Discount category ----
    df['Discount_Category'] = pd.cut(
        df['Discount'],
        bins=[-0.01, 0, 0.10, 0.20, 1.0],
        labels=['No Discount', 'Low (1-10%)', 'Medium (11-20%)', 'High (>20%)']
    )

    # ---- Profit category ----
    df['Profit_Category'] = pd.cut(
        df['Profit'],
        bins=[-np.inf, 0, 1000, 5000, np.inf],
        labels=['Loss', 'Low Profit', 'Medium Profit', 'High Profit']
    )

    print("   ✅ Added time features: Year, Month, Quarter, DayOfWeek, WeekOfYear")
    print("   ✅ Added shipping feature: Shipping_Days")
    print("   ✅ Added financial features: Profit_Margin, Revenue_Per_Unit")
    print("   ✅ Added categorical features: Discount_Category, Profit_Category")
    print(f"\n   📊 Final dataset: {df.shape[0]} rows × {df.shape[1]} columns")

    return df


def get_clean_data(filepath):
    """
    Complete pipeline: Load → Explore → Clean → Feature Engineer.

    Parameters:
        filepath (str): Path to the CSV file

    Returns:
        pd.DataFrame: Fully processed dataframe
    """
    df = load_data(filepath)
    explore_data(df)
    df = clean_data(df)
    df = add_features(df)
    return df
