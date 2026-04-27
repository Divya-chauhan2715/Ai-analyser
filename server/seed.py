"""
=============================================================================
MongoDB Seed Script for BizConnect
=============================================================================
Populates the MongoDB database with realistic sample data:
- 5 business users (sellers)
- 20 buyer users
- 80+ products across categories
- 500+ orders with items
- Customer records
=============================================================================
"""

import pymongo
import bcrypt
import random
import numpy as np
from datetime import datetime, timedelta
from bson import ObjectId

np.random.seed(42)
random.seed(42)

MONGO_URI = 'mongodb://localhost:27017/bizconnect'

# =============================================================================
# DATA DEFINITIONS
# =============================================================================

CATEGORIES = {
    'Electronics': [
        ('iPhone 15 Pro', 129999, 'Latest Apple flagship with A17 Pro chip'),
        ('Samsung Galaxy S24', 79999, 'AI-powered Samsung smartphone'),
        ('OnePlus 12', 64999, 'Performance flagship with Snapdragon 8 Gen 3'),
        ('Google Pixel 8', 59999, 'Best camera phone with AI features'),
        ('MacBook Air M2', 114999, 'Ultra-thin laptop with Apple Silicon'),
        ('Dell XPS 15', 134999, 'Premium Windows ultrabook'),
        ('iPad Air', 69999, 'Versatile tablet for work and play'),
        ('Sony WH-1000XM5', 29999, 'Industry-leading noise cancellation'),
        ('AirPods Pro 2', 24999, 'Active noise cancellation earbuds'),
        ('Samsung Galaxy Tab S9', 74999, 'Android tablet with S Pen'),
        ('Logitech MX Master 3S', 8999, 'Premium wireless mouse'),
        ('Apple Watch Ultra 2', 89999, 'Rugged smartwatch for adventurers'),
        ('JBL Flip 6', 9999, 'Portable waterproof Bluetooth speaker'),
        ('Anker PowerBank 20K', 2499, 'Fast charging portable charger'),
        ('Samsung T7 SSD 1TB', 7999, 'Portable solid state drive'),
    ],
    'Clothing': [
        ('Premium Cotton T-Shirt', 999, 'Soft 100% cotton casual tee'),
        ('Slim Fit Jeans', 1999, 'Classic denim with modern fit'),
        ('Formal Shirt', 1499, 'Wrinkle-free business shirt'),
        ('Winter Jacket', 3999, 'Warm insulated winter coat'),
        ('Sneakers Pro', 4999, 'Comfortable running shoes'),
        ('Leather Belt', 799, 'Genuine leather formal belt'),
        ('Silk Kurta Set', 2999, 'Traditional ethnic wear'),
        ('Sports Track Pants', 1299, 'Quick-dry athletic pants'),
        ('Polo T-Shirt', 1199, 'Classic polo for casual wear'),
        ('Hoodie Premium', 1999, 'Fleece-lined comfortable hoodie'),
    ],
    'Home & Kitchen': [
        ('Stainless Steel Cookware Set', 4999, '5-piece premium cookware'),
        ('Air Fryer 5L', 6999, 'Digital air fryer with 8 presets'),
        ('Coffee Maker', 3499, 'Drip coffee machine with timer'),
        ('Mixer Grinder 750W', 3999, 'Heavy duty mixer with 3 jars'),
        ('Microwave Oven 25L', 8999, 'Convection microwave'),
        ('Water Purifier RO', 12999, 'RO+UV water purifier'),
        ('Vacuum Cleaner', 7999, 'Cordless stick vacuum'),
        ('Bed Sheet Set Premium', 1499, 'Egyptian cotton 400TC'),
        ('LED Table Lamp', 1999, 'Smart desk lamp with dimmer'),
        ('Storage Containers Set', 899, 'BPA-free food storage set'),
    ],
    'Books & Stationery': [
        ('Notebook Premium A5', 299, 'Hardbound ruled notebook'),
        ('Pen Set Executive', 999, 'Premium ballpoint pen set'),
        ('Self Help Book Bundle', 1499, 'Top 3 bestselling self-help books'),
        ('Art Supplies Kit', 1999, 'Complete drawing and painting kit'),
        ('Diary 2025 Planner', 599, 'Daily planner with monthly view'),
        ('Whiteboard Marker Set', 399, 'Assorted color marker pack'),
        ('Programming Books Set', 2499, 'Python + JavaScript + DSA'),
        ('Sticky Notes Combo', 199, 'Multi-color sticky note pack'),
    ],
    'Furniture': [
        ('Ergonomic Office Chair', 14999, 'Mesh back with lumbar support'),
        ('Standing Desk', 19999, 'Electric height adjustable desk'),
        ('Bookshelf 5-Tier', 5999, 'Engineered wood modern shelf'),
        ('Coffee Table', 7999, 'Solid wood center table'),
        ('Bean Bag XXL', 2999, 'Leatherette bean bag with beans'),
        ('TV Unit Modern', 11999, 'Wall mount entertainment unit'),
        ('Study Table', 6999, 'Compact desk with drawers'),
        ('Shoe Rack 4-Tier', 2499, 'Metal frame shoe organizer'),
    ],
}

INDIAN_STATES = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat',
                 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala', 'Telangana',
                 'Punjab', 'Haryana', 'Madhya Pradesh', 'Bihar', 'Odisha']

BUSINESS_NAMES = [
    ('TechMart India', 'techmart@bizconnect.com', 'Electronics'),
    ('FashionHub', 'fashionhub@bizconnect.com', 'Clothing'),
    ('HomeEssentials', 'homeessentials@bizconnect.com', 'Home & Kitchen'),
    ('BookWorm Store', 'bookworm@bizconnect.com', 'Books & Stationery'),
    ('FurniCraft', 'furnicraft@bizconnect.com', 'Furniture'),
]

BUYER_NAMES = [
    'Aarav Sharma', 'Priya Patel', 'Vivaan Kumar', 'Ananya Singh', 'Arjun Gupta',
    'Diya Reddy', 'Ishaan Verma', 'Myra Joshi', 'Sai Iyer', 'Neha Agarwal',
    'Rohan Mishra', 'Kavita Nair', 'Rahul Pandey', 'Sneha Das', 'Vikram Chopra',
    'Divya Mehta', 'Karan Sinha', 'Riya Bhatia', 'Mohit Tiwari', 'Tanvi Saxena',
]


def hash_password(password):
    """Hash password using bcrypt."""
    salt = bcrypt.gensalt(10)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def seed_database():
    """Main seed function."""
    print("=" * 60)
    print("   BIZCONNECT — DATABASE SEED SCRIPT")
    print("=" * 60)

    # Connect to MongoDB
    client = pymongo.MongoClient(MONGO_URI)
    db = client['bizconnect']

    # Clear existing data
    print("\n🗑️  Clearing existing data...")
    for col in ['users', 'products', 'orders', 'customers']:
        db[col].delete_many({})
        print(f"   Cleared: {col}")

    password_hash = hash_password('password123')

    # =========================================================================
    # 1. Create Admin User
    # =========================================================================
    print("\n👑 Creating admin user...")
    admin = {
        'name': 'Admin User',
        'email': 'admin@bizconnect.com',
        'password': password_hash,
        'role': 'admin',
        'isVerified': True,
        'isSuspended': False,
        'phone': '9999999999',
        'businessName': '',
        'address': 'Platform Admin Office, Delhi',
        'createdAt': datetime.utcnow(),
        'updatedAt': datetime.utcnow(),
    }
    db.users.insert_one(admin)
    print(f"   ✅ admin@bizconnect.com / password123")

    # =========================================================================
    # 2. Create Business Users (Sellers)
    # =========================================================================
    print("\n🏭 Creating business users...")
    seller_ids = {}
    for biz_name, email, category in BUSINESS_NAMES:
        seller = {
            'name': biz_name,
            'email': email,
            'password': password_hash,
            'role': 'business',
            'isVerified': True,
            'isSuspended': False,
            'phone': f'98{random.randint(10000000, 99999999)}',
            'businessName': biz_name,
            'address': f'{random.choice(INDIAN_STATES)}, India',
            'createdAt': datetime.utcnow() - timedelta(days=random.randint(180, 365)),
            'updatedAt': datetime.utcnow(),
        }
        result = db.users.insert_one(seller)
        seller_ids[category] = result.inserted_id
        print(f"   ✅ {email} / password123 ({biz_name})")

    # =========================================================================
    # 3. Create Buyer Users
    # =========================================================================
    print("\n👥 Creating buyer users...")
    buyer_ids = []
    for i, name in enumerate(BUYER_NAMES):
        email = name.lower().replace(' ', '.') + '@gmail.com'
        buyer = {
            'name': name,
            'email': email,
            'password': password_hash,
            'role': 'buyer',
            'isVerified': True,
            'isSuspended': False,
            'phone': f'97{random.randint(10000000, 99999999)}',
            'businessName': '',
            'address': f'{random.choice(INDIAN_STATES)}, India',
            'createdAt': datetime.utcnow() - timedelta(days=random.randint(30, 300)),
            'updatedAt': datetime.utcnow(),
        }
        result = db.users.insert_one(buyer)
        buyer_ids.append(result.inserted_id)
        if i < 5:
            print(f"   ✅ {email} / password123")
    print(f"   ... and {len(BUYER_NAMES) - 5} more buyers")

    # =========================================================================
    # 4. Create Products
    # =========================================================================
    print("\n📦 Creating products...")
    all_products = []
    for category, products in CATEGORIES.items():
        seller_id = seller_ids.get(category, list(seller_ids.values())[0])
        for name, price, description in products:
            product = {
                'name': name,
                'description': description,
                'price': price,
                'stock': random.randint(10, 200),
                'category': category,
                'image': '',
                'sellerId': seller_id,
                'isApproved': True,
                'createdAt': datetime.utcnow() - timedelta(days=random.randint(30, 300)),
                'updatedAt': datetime.utcnow(),
            }
            result = db.products.insert_one(product)
            product['_id'] = result.inserted_id
            all_products.append(product)

    print(f"   ✅ Created {len(all_products)} products across {len(CATEGORIES)} categories")

    # =========================================================================
    # 5. Create Orders (500+ orders spread over 12 months)
    # =========================================================================
    print("\n🛒 Creating orders...")
    order_count = 0
    customer_map = {}  # buyer_id -> {seller_id -> customer_doc_id}

    for _ in range(550):
        buyer_id = random.choice(buyer_ids)
        # Pick 1-4 items from random categories
        num_items = np.random.choice([1, 2, 3, 4], p=[0.4, 0.3, 0.2, 0.1])
        selected_products = random.sample(all_products, min(num_items, len(all_products)))

        # All items from same seller for simplicity (or multiple sellers)
        seller_id = selected_products[0]['sellerId']
        items_from_seller = [p for p in selected_products if p['sellerId'] == seller_id]
        if not items_from_seller:
            items_from_seller = [selected_products[0]]

        items = []
        total = 0
        for prod in items_from_seller:
            qty = int(np.random.choice([1, 2, 3, 5], p=[0.5, 0.3, 0.15, 0.05]))
            item_total = int(prod['price']) * qty
            items.append({
                'productId': prod['_id'],
                'name': prod['name'],
                'quantity': qty,
                'price': int(prod['price']),
            })
            total += item_total

        # Random date in last 12 months with seasonal bias
        month_weights = [0.06, 0.05, 0.07, 0.07, 0.08, 0.08,
                         0.10, 0.09, 0.08, 0.10, 0.12, 0.10]
        month = np.random.choice(range(12), p=month_weights)
        days_ago = random.randint(month * 30, (month + 1) * 30)
        order_date = datetime.utcnow() - timedelta(days=days_ago)

        order_status = np.random.choice(
            ['pending', 'confirmed', 'shipped', 'completed'],
            p=[0.10, 0.15, 0.15, 0.60]
        )
        payment_status = 'paid' if order_status == 'completed' else np.random.choice(
            ['pending', 'paid', 'overdue'], p=[0.3, 0.5, 0.2]
        )
        payment_method = np.random.choice(['upi', 'bank_transfer', 'cash'], p=[0.5, 0.3, 0.2])

        order = {
            'buyerId': buyer_id,
            'sellerId': seller_id,
            'items': items,
            'totalAmount': total,
            'orderStatus': order_status,
            'paymentStatus': payment_status,
            'paymentMethod': payment_method,
            'shippingAddress': f'{random.choice(INDIAN_STATES)}, India',
            'createdAt': order_date,
            'updatedAt': order_date + timedelta(days=random.randint(0, 5)),
        }
        db.orders.insert_one(order)
        order_count += 1

        # Create/Update customer record
        key = (str(buyer_id), str(seller_id))
        if key not in customer_map:
            buyer_doc = db.users.find_one({'_id': buyer_id})
            customer = {
                'businessId': seller_id,
                'name': buyer_doc['name'] if buyer_doc else 'Unknown',
                'email': buyer_doc['email'] if buyer_doc else '',
                'phone': buyer_doc.get('phone', ''),
                'totalRevenue': total,
                'totalOrders': 1,
                'lastOrderDate': order_date,
                'createdAt': order_date,
                'updatedAt': order_date,
            }
            result = db.customers.insert_one(customer)
            customer_map[key] = result.inserted_id
        else:
            db.customers.update_one(
                {'_id': customer_map[key]},
                {'$inc': {'totalRevenue': total, 'totalOrders': 1},
                 '$set': {'lastOrderDate': order_date, 'updatedAt': datetime.utcnow()}}
            )

    print(f"   ✅ Created {order_count} orders")
    print(f"   ✅ Created {len(customer_map)} customer relationships")

    # =========================================================================
    # Summary
    # =========================================================================
    print("\n" + "=" * 60)
    print("   DATABASE SEEDED SUCCESSFULLY!")
    print("=" * 60)
    print(f"   👑 Admin:     1 (admin@bizconnect.com / password123)")
    print(f"   🏭 Sellers:   {len(seller_ids)}")
    print(f"   👥 Buyers:    {len(buyer_ids)}")
    print(f"   📦 Products:  {len(all_products)}")
    print(f"   🛒 Orders:    {order_count}")
    print(f"   🤝 Customers: {len(customer_map)}")
    print(f"\n   Login as buyer: aarav.sharma@gmail.com / password123")
    print(f"   Login as seller: techmart@bizconnect.com / password123")
    print(f"   Login as admin: admin@bizconnect.com / password123")
    print("=" * 60)

    client.close()


if __name__ == '__main__':
    seed_database()
