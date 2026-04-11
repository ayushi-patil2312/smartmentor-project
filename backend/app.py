import os
from flask import Flask
from flask_cors import CORS   # ✅ important

from routes.auth_routes import auth_bp
from routes.goal_routes import goal_bp
from routes.mentor_routes import mentor_bp

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

app.register_blueprint(auth_bp)
app.register_blueprint(goal_bp)
app.register_blueprint(mentor_bp)

@app.route('/')
def home():
    return "Backend running 🚀"

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)