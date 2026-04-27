"""
=============================================================================
Sales Prediction Module (Machine Learning)
=============================================================================
Builds regression models to predict future sales using Linear Regression
and Random Forest. Includes evaluation and visualization.
=============================================================================
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import LabelEncoder
import os
import warnings
warnings.filterwarnings('ignore')

COLORS = {'primary': '#6366F1', 'success': '#10B981', 'danger': '#EF4444'}


def prepare_features(df):
    """Prepare features for ML model."""
    print("🔧 Preparing features for ML model...")
    df_ml = df.copy()

    le_cat = LabelEncoder()
    le_sub = LabelEncoder()
    le_seg = LabelEncoder()
    le_reg = LabelEncoder()
    le_ship = LabelEncoder()

    df_ml['Category_Enc'] = le_cat.fit_transform(df_ml['Category'])
    df_ml['SubCat_Enc'] = le_sub.fit_transform(df_ml['Sub_Category'])
    df_ml['Segment_Enc'] = le_seg.fit_transform(df_ml['Segment'])
    df_ml['Region_Enc'] = le_reg.fit_transform(df_ml['Region'])
    df_ml['ShipMode_Enc'] = le_ship.fit_transform(df_ml['Ship_Mode'])

    features = ['Quantity', 'Discount', 'Order_Year', 'Order_Month',
                'Order_Quarter', 'Category_Enc', 'SubCat_Enc',
                'Segment_Enc', 'Region_Enc', 'ShipMode_Enc']

    X = df_ml[features]
    y = df_ml['Sales']
    print(f"   ✅ {len(features)} features, {len(X)} samples")
    return X, y, features


def evaluate_model(y_true, y_pred, name="Model"):
    """Evaluate model with MAE, RMSE, R², MAPE."""
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    mape = np.mean(np.abs((y_true - y_pred) / y_true.replace(0, np.nan)).dropna()) * 100

    print(f"\n   📊 {name} Metrics:")
    print(f"      MAE  : ₹{mae:,.2f}")
    print(f"      RMSE : ₹{rmse:,.2f}")
    print(f"      R²   : {r2:.4f}")
    print(f"      MAPE : {mape:.2f}%")
    return {'MAE': round(mae,2), 'RMSE': round(rmse,2), 'R2_Score': round(r2,4), 'MAPE': round(mape,2)}


def train_models(X, y, test_size=0.2):
    """Train Linear Regression and Random Forest models."""
    print("\n" + "="*60)
    print("   TRAINING ML MODELS")
    print("="*60)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
    print(f"\n   Train: {len(X_train)} | Test: {len(X_test)}")

    results = {'X_train': X_train, 'X_test': X_test, 'y_train': y_train, 'y_test': y_test,
               'models': {}, 'predictions': {}, 'metrics': {}}

    # Linear Regression
    print(f"\n{'─'*40}\n📈 Linear Regression")
    lr = LinearRegression()
    lr.fit(X_train, y_train)
    lr_pred = lr.predict(X_test)
    results['models']['Linear Regression'] = lr
    results['predictions']['Linear Regression'] = lr_pred
    results['metrics']['Linear Regression'] = evaluate_model(y_test, lr_pred, "Linear Regression")

    # Random Forest
    print(f"\n{'─'*40}\n🌲 Random Forest")
    rf = RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    rf_pred = rf.predict(X_test)
    results['models']['Random Forest'] = rf
    results['predictions']['Random Forest'] = rf_pred
    results['metrics']['Random Forest'] = evaluate_model(y_test, rf_pred, "Random Forest")

    # Comparison
    comp = pd.DataFrame(results['metrics']).T
    print(f"\n{'='*60}\n   MODEL COMPARISON\n{'='*60}")
    print(f"\n{comp.to_string()}")
    best = comp['R2_Score'].idxmax()
    print(f"\n🏆 Best Model: {best} (R² = {comp.loc[best, 'R2_Score']:.4f})")

    return results


def plot_model_results(results, output_dir='outputs'):
    """Visualize model predictions vs actual values."""
    plt.style.use('seaborn-v0_8-whitegrid')
    y_test = results['y_test']
    fig, axes = plt.subplots(2, 2, figsize=(14, 12))

    for idx, (name, color) in enumerate([('Linear Regression', COLORS['primary']),
                                          ('Random Forest', COLORS['success'])]):
        ax = axes[0, idx]
        pred = results['predictions'][name]
        ax.scatter(y_test, pred, alpha=0.3, s=15, color=color, edgecolors='none')
        mx = max(y_test.max(), pred.max())
        ax.plot([0, mx], [0, mx], 'r--', linewidth=1.5, label='Perfect')
        ax.set_xlabel('Actual Sales (₹)'); ax.set_ylabel('Predicted Sales (₹)')
        ax.set_title(f'{name}: Actual vs Predicted', fontweight='bold')
        ax.legend(); ax.spines['top'].set_visible(False); ax.spines['right'].set_visible(False)

    # Residuals
    ax = axes[1, 0]
    for name, color in [('Linear Regression', COLORS['primary']), ('Random Forest', COLORS['success'])]:
        residuals = y_test - results['predictions'][name]
        ax.hist(residuals, bins=50, alpha=0.6, color=color, label=name)
    ax.axvline(x=0, color='red', linestyle='--'); ax.set_xlabel('Residual')
    ax.set_ylabel('Frequency'); ax.set_title('Residual Distribution', fontweight='bold')
    ax.legend(); ax.spines['top'].set_visible(False); ax.spines['right'].set_visible(False)

    # Metrics comparison
    ax = axes[1, 1]
    mdf = pd.DataFrame(results['metrics']).T
    x = np.arange(3); w = 0.35
    for i, (name, color) in enumerate([('Linear Regression', COLORS['primary']),
                                        ('Random Forest', COLORS['success'])]):
        vals = [mdf.loc[name, m] for m in ['MAE', 'RMSE', 'R2_Score']]
        bars = ax.bar(x + (i-0.5)*w, vals, w, label=name, color=color, alpha=0.85)
        for b in bars:
            ax.text(b.get_x()+b.get_width()/2, b.get_height(), f'{b.get_height():.2f}',
                    ha='center', va='bottom', fontsize=8)
    ax.set_xticks(x); ax.set_xticklabels(['MAE', 'RMSE', 'R²'])
    ax.set_title('Metrics Comparison', fontweight='bold'); ax.legend()
    ax.spines['top'].set_visible(False); ax.spines['right'].set_visible(False)

    plt.suptitle('Sales Prediction — Model Evaluation', fontsize=16, fontweight='bold', y=1.02)
    plt.tight_layout()
    os.makedirs(output_dir, exist_ok=True)
    fig.savefig(os.path.join(output_dir, 'model_evaluation.png'), dpi=150, bbox_inches='tight')
    print(f"\n💾 Model evaluation chart saved")
    return fig


def plot_feature_importance(results, feature_names, output_dir='outputs'):
    """Plot Random Forest feature importance."""
    plt.style.use('seaborn-v0_8-whitegrid')
    rf = results['models']['Random Forest']
    imp = rf.feature_importances_
    idx = np.argsort(imp)

    fig, ax = plt.subplots(figsize=(10, 7))
    ax.barh(range(len(idx)), imp[idx], color=COLORS['primary'], alpha=0.85, height=0.7)
    ax.set_yticks(range(len(idx)))
    ax.set_yticklabels([feature_names[i] for i in idx])
    for i, v in enumerate(imp[idx]):
        ax.text(v + 0.002, i, f'{v:.4f}', va='center', fontsize=9, fontweight='bold')
    ax.set_xlabel('Importance'); ax.set_title('Feature Importance', fontsize=16, fontweight='bold')
    ax.spines['top'].set_visible(False); ax.spines['right'].set_visible(False)
    plt.tight_layout()
    os.makedirs(output_dir, exist_ok=True)
    fig.savefig(os.path.join(output_dir, 'feature_importance.png'), dpi=150, bbox_inches='tight')
    print(f"💾 Feature importance chart saved")
    return fig


def run_prediction_pipeline(df, output_dir='outputs'):
    """Complete ML pipeline: prepare → train → evaluate → visualize."""
    print("\n" + "="*60)
    print("   SALES PREDICTION — ML PIPELINE")
    print("="*60)
    X, y, feat_names = prepare_features(df)
    results = train_models(X, y)
    results['feature_names'] = feat_names
    plot_model_results(results, output_dir=output_dir)
    plot_feature_importance(results, feat_names, output_dir=output_dir)
    return results
