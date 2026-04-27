"""
=============================================================================
BizConnect Analytics Microservice — Flask API
=============================================================================
REST API that provides ML-powered analytics and recommendations.
Connects to the same MongoDB as the Node.js backend.

Endpoints:
  GET /api/ml/recommendations/<user_id>  — Product recommendations
  GET /api/ml/analytics/advanced          — Advanced analytics
  GET /api/ml/predictions/sales           — Sales forecast
  GET /api/ml/health                     — Health check
=============================================================================
"""

from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import pymongo
import json
import numpy as np
from recommendation_engine import RecommendationEngine
from analytics_engine import AnalyticsEngine
import os


def sanitize(obj):
    """Recursively convert numpy types to native Python for JSON serialization."""
    if isinstance(obj, dict):
        return {k: sanitize(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [sanitize(v) for v in obj]
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, np.bool_):
        return bool(obj)
    return obj


def safe_jsonify(data, status=200):
    """jsonify with numpy type handling."""
    return Response(
        json.dumps(sanitize(data)),
        status=status,
        mimetype='application/json'
    )


app = Flask(__name__)
CORS(app)

# MongoDB connection
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/bizconnect')
client = pymongo.MongoClient(MONGO_URI)
db = client['bizconnect']

# Initialize engines (lazy-loaded on first request)
_rec_engine = None
_analytics_engine = None


def get_rec_engine():
    global _rec_engine
    if _rec_engine is None:
        _rec_engine = RecommendationEngine(db)
    return _rec_engine


def get_analytics_engine():
    global _analytics_engine
    if _analytics_engine is None:
        _analytics_engine = AnalyticsEngine(db)
    return _analytics_engine


# =============================================================================
# ENDPOINTS
# =============================================================================

@app.route('/', methods=['GET'])
def root():
    """Root health check for Render."""
    return safe_jsonify({'service': 'BizConnect Analytics', 'status': 'running'})


@app.route('/api/ml/health', methods=['GET'])
def health():
    """Health check endpoint."""
    try:
        db.command('ping')
        order_count = db.orders.count_documents({})
        product_count = db.products.count_documents({})
        return safe_jsonify({
            'status': 'ok',
            'database': 'connected',
            'orders': order_count,
            'products': product_count,
        })
    except Exception as e:
        return safe_jsonify({'status': 'error', 'message': str(e)}, 500)


@app.route('/api/ml/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    """Get product recommendations for a user."""
    try:
        n = request.args.get('n', 6, type=int)
        method = request.args.get('method', 'hybrid')

        engine = get_rec_engine()

        if method == 'content':
            recs = engine.get_content_based_recommendations(user_id, n=n)
        elif method == 'collaborative':
            recs = engine.get_collaborative_recommendations(user_id, n=n)
        else:
            recs = engine.get_hybrid_recommendations(user_id, n=n)

        return safe_jsonify({
            'userId': user_id,
            'method': method,
            'count': len(recs),
            'recommendations': recs
        })
    except Exception as e:
        return safe_jsonify({'error': str(e)}, 500)


@app.route('/api/ml/recommendations/refresh', methods=['POST'])
def refresh_recommendations():
    """Force refresh the recommendation engine (reload data from DB)."""
    global _rec_engine
    _rec_engine = None
    _rec_engine = RecommendationEngine(db)
    return safe_jsonify({'status': 'refreshed', 'message': 'Recommendation engine reloaded'})


@app.route('/api/ml/analytics/advanced', methods=['GET'])
def get_advanced_analytics():
    """Get advanced ML-powered analytics."""
    try:
        seller_id = request.args.get('sellerId', None)
        engine = get_analytics_engine()
        result = engine.get_advanced_analytics(seller_id)
        return safe_jsonify(result)
    except Exception as e:
        return safe_jsonify({'error': str(e)}, 500)


@app.route('/api/ml/predictions/sales', methods=['GET'])
def get_sales_prediction():
    """Get sales forecast for future months."""
    try:
        seller_id = request.args.get('sellerId', None)
        months = request.args.get('months', 3, type=int)
        engine = get_analytics_engine()
        result = engine.get_sales_prediction(seller_id, months_ahead=months)
        return safe_jsonify(result)
    except Exception as e:
        return safe_jsonify({'error': str(e)}, 500)


@app.route('/api/ml/trending', methods=['GET'])
def get_trending():
    """Get trending/popular products."""
    try:
        n = request.args.get('n', 10, type=int)
        engine = get_rec_engine()
        popular = engine._get_popular_products(n=n)
        return safe_jsonify({'trending': popular})
    except Exception as e:
        return safe_jsonify({'error': str(e)}, 500)


# =============================================================================
# RUN
# =============================================================================
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    print("=" * 50)
    print("  BizConnect Analytics Service")
    print(f"  http://localhost:{port}")
    print("=" * 50)
    app.run(host='0.0.0.0', port=port, debug=True)
