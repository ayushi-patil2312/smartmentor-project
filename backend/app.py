from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import os

app = Flask(__name__)
CORS(app)

def get_db():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        port=os.getenv("DB_PORT")
    )

@app.route('/')
def home():
    return "API Running"

@app.route('/users')
def get_users():
    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute("SELECT * FROM users")
        users = cur.fetchall()

        cur.close()
        conn.close()

        return jsonify(users)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute("SELECT * FROM users WHERE email=%s AND password=%s", (email, password))
        user = cur.fetchone()

        cur.close()
        conn.close()

        if user:
            return jsonify({"message": "Login success"})
        else:
            return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run()