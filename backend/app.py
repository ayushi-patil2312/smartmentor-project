import os
from flask import Flask
from flask_cors import CORS   # ✅ important

from routes.auth_routes import auth_bp
from routes.goal_routes import goal_bp
from routes.mentor_routes import mentor_bp
from routes.student_routes import student_bp
from routes.user_routes import user_bp
from routes.report_routes import report_bp
from db_schema import init_db

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

app.register_blueprint(auth_bp)
app.register_blueprint(goal_bp)
app.register_blueprint(mentor_bp)
app.register_blueprint(student_bp)
app.register_blueprint(user_bp)
app.register_blueprint(report_bp)

@app.route('/')
def home():
    return "Backend running 🚀"

if __name__ == '__main__':
    init_db()  # Initialize the DB schemas directly on startup
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)