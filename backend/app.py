from flask import Flask, request, jsonify, g
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os

app = Flask(__name__)
# Enable CORS properly for Vercel
CORS(app, resources={r"/*": {"origins": ["https://smartmentor-project.vercel.app", "http://localhost:5173", "*"]}})

def get_db():
    if 'db' not in g:
        g.db = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "postgres"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASS", "password"),
            port=os.getenv("DB_PORT", "5432"),
            cursor_factory=RealDictCursor
        )
    return g.db

@app.teardown_appcontext
def close_db(error):
    db = g.pop('db', None)
    if db is not None:
        db.close()

# Global Error Handler
@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({"error": str(e)}), 500

@app.route('/')
def home():
    return jsonify({"status": "API Running"})

@app.route('/users')
def get_users():
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM users")
        users = cur.fetchall()
    return jsonify(users)

@app.route('/goals')
def get_goals():
    try:
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM goals")
            goals = cur.fetchall()
        return jsonify(goals)
    except:
        return jsonify([])

@app.route('/feedbacks')
def get_feedbacks():
    try:
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM feedbacks")
            feedbacks = cur.fetchall()
        return jsonify(feedbacks)
    except:
        return jsonify([])

@app.route('/reports/performance')
def get_performance_reports():
    try:
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM performance_reports")
            reports = cur.fetchall()
        return jsonify(reports)
    except:
        return jsonify([])

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400
        
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')
    
    if not name or not email or not password:
        return jsonify({"error": "Name, email and password required"}), 400

    conn = get_db()
    with conn.cursor() as cur:
        # Check if user exists
        cur.execute("SELECT * FROM users WHERE email=%s", (email,))
        if cur.fetchone():
            return jsonify({"error": "User already exists"}), 400
        
        cur.execute("INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s) RETURNING *", 
                    (name, email, password, role))
        new_user = cur.fetchone()
        conn.commit()

    return jsonify({"status": "success", "user": new_user}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400
        
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM users WHERE email=%s AND password=%s", (email, password))
        user = cur.fetchone()

    if user:
        return jsonify({"status": "success", "user": user}), 200
    else:
        return jsonify({"error": "Invalid credentials", "status": "error"}), 401

if __name__ == '__main__':
    app.run()