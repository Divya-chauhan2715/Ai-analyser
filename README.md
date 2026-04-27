# 🛍️ E-commerce Data Analysis & Recommendation System

A complete end-to-end e-commerce analytics project that analyzes sales data, generates business insights, builds recommendation engines, and predicts future sales — structured like a real-world case study (Amazon/Flipkart style).

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [How to Run](#-how-to-run)
- [Key Findings](#-key-findings)
- [Screenshots](#-screenshots)

---

## 🎯 Project Overview

This project analyzes a synthetic e-commerce dataset (~10,000 orders) to extract meaningful business insights and build intelligent recommendation systems. It covers the full data analytics pipeline from raw data to actionable business recommendations.

### Objectives:
1. **Data Cleaning** — Handle missing values, duplicates, and data type issues
2. **Exploratory Data Analysis** — Uncover patterns in sales, customers, and products
3. **Business Insights** — Generate actionable recommendations for growth
4. **Recommendation System** — Content-based, collaborative, and hybrid filtering
5. **Sales Prediction** — ML models to forecast future revenue
6. **Interactive Dashboard** — Streamlit web app for stakeholder exploration

---

## ✨ Features

### 📊 Data Analysis
- Top-selling products by revenue and quantity
- Category & sub-category profitability analysis
- Monthly/yearly sales trends with seasonal patterns
- Region-wise performance comparison
- Customer purchasing behavior & segmentation (RFM-style)
- Discount impact on profitability

### 📈 Visualizations (12 chart types)
- Bar charts, line charts, pie charts
- Heatmaps (sales by month × year)
- Scatter plots (discount vs profit)
- Correlation matrices
- Box plots (profit distribution)

### 🤖 Recommendation System
- **Content-Based Filtering** — Recommends based on customer's category preferences
- **Collaborative Filtering** — Uses user-item matrix + cosine similarity
- **Hybrid Engine** — Combines both for robust recommendations

### 🔮 Machine Learning
- **Linear Regression** — Simple, interpretable baseline
- **Random Forest** — Captures non-linear patterns
- Evaluation: MAE, RMSE, R², MAPE
- Feature importance analysis

### 🖥️ Interactive Dashboard
- Streamlit web app with 5 tabs
- Real-time filters (year, category, region)
- KPI cards with gradient styling
- Interactive Plotly charts
- Customer recommendation explorer

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Python 3.9+ | Core language |
| Pandas | Data manipulation |
| NumPy | Numerical computing |
| Matplotlib | Static visualizations |
| Seaborn | Statistical plots |
| Scikit-learn | ML models & metrics |
| Plotly | Interactive charts |
| Streamlit | Web dashboard |
| Jupyter | Notebook environment |

---

## 📁 Project Structure

```
Vaishnavy_project/
├── data/
│   └── ecommerce_data.csv          # Generated dataset (10,000+ orders)
├── notebooks/
│   └── ecommerce_analysis.ipynb    # Main analysis notebook
├── src/
│   ├── __init__.py
│   ├── data_generator.py           # Dataset generation script
│   ├── data_cleaning.py            # Data cleaning & preprocessing
│   ├── analysis.py                 # Analysis functions
│   ├── visualizations.py           # Chart generation (12 types)
│   ├── recommendation.py           # Recommendation engines
│   └── sales_prediction.py         # ML prediction pipeline
├── dashboard/
│   └── app.py                      # Streamlit interactive dashboard
├── outputs/
│   └── *.png                       # Saved chart images
├── requirements.txt                # Python dependencies
└── README.md                       # This file
```

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.9 or higher
- pip (Python package manager)

### Step 1: Clone the repository
```bash
git clone <repository-url>
cd Vaishnavy_project
```

### Step 2: Install dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Generate the dataset
```bash
python src/data_generator.py
```

---

## 💻 How to Run

### Option 1: Jupyter Notebook (Recommended for analysis)
```bash
cd notebooks
jupyter notebook ecommerce_analysis.ipynb
```
Run all cells sequentially to see the complete analysis.

### Option 2: Streamlit Dashboard (Interactive exploration)
```bash
streamlit run dashboard/app.py
```
Opens a web browser with the interactive dashboard at `http://localhost:8501`.

### Option 3: Run individual modules
```python
from src.data_cleaning import get_clean_data
from src.analysis import generate_business_insights
from src.recommendation import HybridRecommender
from src.sales_prediction import run_prediction_pipeline

# Load and clean data
df = get_clean_data('data/ecommerce_data.csv')

# Get insights
insights = generate_business_insights(df)

# Get recommendations
rec = HybridRecommender(df)
rec.recommend('CUST-1001', n=5)

# Predict sales
results = run_prediction_pipeline(df)
```

---

## 📊 Key Findings

1. **Technology** is the highest-revenue category (~45% of sales)
2. Sales show clear **seasonal peaks** during October–December (festive season)
3. **Aggressive discounting (>20%)** reduces profit margins by ~15%
4. **Consumer segment** dominates with ~50% of total orders
5. **Year-over-year growth** indicates healthy business expansion
6. **Random Forest** outperforms Linear Regression for sales prediction

---

## 📸 Screenshots

Charts and visualizations are saved to the `outputs/` folder when you run the notebook.

---

## 📄 License

This project is for educational purposes.

---

## 🙏 Acknowledgments

- Dataset inspired by Superstore Sales and Indian E-commerce patterns
- Built as a beginner-friendly data analytics case study
