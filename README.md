# 🛍️ BizConnect — B2B Marketplace & AI Analytics Platform

A full-stack B2B marketplace with integrated **ML-powered analytics**, **product recommendations**, and **sales forecasting**. Built with the MERN stack + Python microservices.

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://bizconnect-app.onrender.com](https://bizconnect-app.onrender.com) |
| **Backend API** | [https://bizconnect-api.onrender.com](https://bizconnect-api.onrender.com) |

> **Note:** The app is hosted on Render's free tier. It may take ~30 seconds to spin up on first visit.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Deployment](#-deployment)
- [API Endpoints](#-api-endpoints)
- [Key Findings](#-key-findings)

---

## ✨ Features

### 🏪 B2B Marketplace
- Multi-role authentication (Business, Buyer, Admin)
- Product catalog with search & filters
- Order management with status tracking
- Customer relationship management
- Payment tracking & invoicing

### 📊 Business Dashboard
- Revenue analytics & trends
- Inventory management
- Order pipeline visualization
- Customer growth tracking
- Top products analysis

### 🤖 AI/ML Analytics (Python Microservice)
- **Product Recommendations** — Content-based, collaborative, and hybrid filtering
- **Sales Forecasting** — ML models to predict future revenue
- **Advanced Analytics** — Customer segmentation, trend analysis, feature importance
- **Trending Products** — Real-time popularity tracking

### 🖥️ Admin Panel
- Platform-wide business management
- User & product moderation
- System-wide analytics

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite 5 | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| React Router v6 | Client-side routing |
| Recharts | Chart visualizations |
| Axios | HTTP client |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication |
| Bcrypt.js | Password hashing |
| Cloudinary | Image hosting |

### Analytics Microservice
| Technology | Purpose |
|------------|---------|
| Python 3.9+ | Core language |
| Flask | Micro web framework |
| Scikit-learn | ML models |
| Pandas / NumPy | Data processing |
| PyMongo | MongoDB driver |

---

## 🏗️ Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│    React Frontend    │────▶│   Node.js Backend    │
│  (Render Static)     │     │   (Render Web Svc)   │
│                      │     │                      │
│  • Landing Page      │     │  • Auth API          │
│  • Marketplace       │     │  • Products API      │
│  • Business Dashboard│     │  • Orders API        │
│  • Analytics Views   │     │  • Customers API     │
│  • Admin Panel       │     │  • Analytics API     │
└──────────┬───────────┘     └──────────┬───────────┘
           │                            │
           │     ┌──────────────────┐   │
           └────▶│  Python Flask    │◀──┘
                 │  ML Microservice │
                 │                  │
                 │ • Recommendations│
                 │ • Sales Forecast │
                 │ • Advanced Stats │
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │    MongoDB       │
                 │  (Shared DB)     │
                 └──────────────────┘
```

---

## 📁 Project Structure

```
BizConnect/
├── client/                      # React Frontend (Vite)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Layout/          # Dashboard & navigation layout
│   │   │   └── ProtectedRoute   # Auth guard component
│   │   ├── context/             # React context (Auth)
│   │   ├── pages/
│   │   │   ├── Landing.jsx      # Public landing page
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Register.jsx     # Registration page
│   │   │   ├── dashboard/       # Business owner pages
│   │   │   │   ├── BusinessDashboard.jsx
│   │   │   │   ├── Products.jsx
│   │   │   │   ├── Inventory.jsx
│   │   │   │   ├── Orders.jsx
│   │   │   │   ├── Customers.jsx
│   │   │   │   ├── Payments.jsx
│   │   │   │   ├── Analytics.jsx
│   │   │   │   └── AdvancedAnalytics.jsx
│   │   │   ├── marketplace/     # Buyer pages
│   │   │   │   ├── Marketplace.jsx
│   │   │   │   ├── ProductDetail.jsx
│   │   │   │   ├── Recommendations.jsx
│   │   │   │   └── OrderHistory.jsx
│   │   │   └── admin/           # Admin pages
│   │   │       └── AdminDashboard.jsx
│   │   ├── utils/api.js         # Axios instance config
│   │   └── App.jsx              # Main router
│   ├── .env.development         # Local dev environment
│   ├── .env.production          # Production environment
│   └── vite.config.js           # Vite config with dev proxy
│
├── server/                      # Node.js Backend
│   ├── config/db.js             # MongoDB connection
│   ├── middleware/               # Auth & error handling
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Customer.js
│   ├── routes/                  # Express route handlers
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── customers.js
│   │   ├── admin.js
│   │   └── analytics.js
│   ├── server.js                # Express entry point
│   └── seed.py                  # Database seeder script
│
├── analytics-service/           # Python ML Microservice
│   ├── app.py                   # Flask API server
│   ├── recommendation_engine.py # Recommendation algorithms
│   ├── analytics_engine.py      # Sales prediction & analytics
│   └── requirements.txt         # Python dependencies
│
├── data/                        # Sample dataset
├── notebooks/                   # Jupyter analysis notebooks
├── src/                         # Standalone analytics modules
├── dashboard/                   # Streamlit dashboard (standalone)
└── outputs/                     # Generated charts
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/Divya-chauhan2715/Ai-analyser.git
cd Ai-analyser
```

### 2. Install Backend
```bash
cd server
npm install
```
Create `server/.env`:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/bizconnect
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Install Frontend
```bash
cd client
npm install
```

### 4. Install Analytics Service
```bash
cd analytics-service
pip install -r requirements.txt
```

### 5. Run All Services
```bash
# Terminal 1 — Backend
cd server && npm start

# Terminal 2 — Frontend
cd client && npm run dev

# Terminal 3 — Analytics
cd analytics-service && python app.py
```

Open `http://localhost:5173` in your browser.

---

## 🌍 Deployment

The app is deployed on **Render** (free tier).

### Frontend (Static Site)
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_URL` = `https://bizconnect-api.onrender.com/api`
  - `VITE_ML_API_URL` = `<your-analytics-service-url>`

### Backend (Web Service)
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Environment Variables:**
  - `MONGO_URI` = your MongoDB Atlas connection string
  - `JWT_SECRET` = your secret key
  - `PORT` = `10000` (Render default)

### Analytics Service (Web Service)
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn app:app`
- **Environment Variables:**
  - `MONGO_URI` = same MongoDB Atlas connection string

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/:id/status` | Update status |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/revenue` | Monthly revenue |
| GET | `/api/analytics/orders` | Order trends |
| GET | `/api/analytics/top-products` | Best sellers |
| GET | `/api/analytics/customer-growth` | Growth stats |

### ML Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ml/health` | Service health |
| GET | `/api/ml/recommendations/:userId` | Recommendations |
| GET | `/api/ml/analytics/advanced` | Advanced analytics |
| GET | `/api/ml/predictions/sales` | Sales forecast |
| GET | `/api/ml/trending` | Trending products |

---

## 📊 Key Findings

1. **Technology** is the highest-revenue category (~45% of sales)
2. Sales show clear **seasonal peaks** during October–December (festive season)
3. **Aggressive discounting (>20%)** reduces profit margins by ~15%
4. **Consumer segment** dominates with ~50% of total orders
5. **Random Forest** outperforms Linear Regression for sales prediction
6. **Hybrid recommendations** (content + collaborative) yield the most relevant results

---

## 📄 License

This project is for educational purposes.

---

## 🙏 Acknowledgments

- Built as a full-stack B2B marketplace case study
- ML analytics inspired by real-world e-commerce recommendation systems
- Dataset patterns based on Indian e-commerce trends
