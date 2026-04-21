from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    # TEMP test login
    if email == "test@test.com" and password == "123456":
        return jsonify({"message": "Login successful"})
    
    return jsonify({"error": "Invalid credentials"}), 401


# Vercel handler
def handler(request):
    return app(request.environ, start_response=None)