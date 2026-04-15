from flask import Flask, request, jsonify, g
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os

app = Flask(__name__)
CORS(app)

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

@app.route('/')
def home():
    return jsonify({"status": "API Running"})

@app.route('/users')
def get_users():
    try:
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users")
            users = cur.fetchall()
        return jsonify(users)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/goals')
def get_goals():
    try:
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM goals")
            goals = cur.fetchall()
        return jsonify(goals)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/feedbacks')
def get_feedbacks():
    try:
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM feedbacks")
            feedbacks = cur.fetchall()
        return jsonify(feedbacks)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reports/performance')
def get_performance_reports():
    try:
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM performance_reports")
            reports = cur.fetchall()
        return jsonify(reports)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
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

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run()