from flask import Flask
from flask_cors import CORS   # ✅ important

from routes.auth_routes import auth_bp
from routes.goal_routes import goal_bp
from routes.mentor_routes import mentor_bp

app = Flask(__name__)

CORS(app)   # ✅ THIS LINE FIXES YOUR ERROR

app.register_blueprint(auth_bp)
app.register_blueprint(goal_bp)
app.register_blueprint(mentor_bp)

@app.route('/')
def home():
    return "Backend running 🚀"

if __name__ == '__main__':
    app.run(debug=True)