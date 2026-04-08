from flask import Blueprint, request, jsonify
from user_model import get_user_by_email, add_user, update_password

# create blueprint
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400

        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        if not email or not password or not role:
            return jsonify({"status": "error", "message": "Email, password and role are required"}), 400

        user = get_user_by_email(email, password)

        if user:
            # Check if role matches
            if user.get('role') != role:
                return jsonify({"status": "fail", "message": "Incorrect role selected"}), 401
            
            # Prevent password from being sent to frontend
            if 'password' in user:
                del user['password']
            return jsonify({"status": "success", "user": user})
        
        return jsonify({"status": "fail", "message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400
        
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        if not all([name, email, password, role]):
            return jsonify({"status": "error", "message": "All fields are required"}), 400
            
        result = add_user(name, email, password, role)
        
        if result.get("status") == "error":
            return jsonify(result), 400
            
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.json
        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400
            
        email = data.get('email')
        new_password = data.get('new_password')
        
        if not all([email, new_password]):
            return jsonify({"status": "error", "message": "Email and new_password are required"}), 400
            
        result = update_password(email, new_password)
        
        if result.get("status") == "error":
            return jsonify(result), 404
            
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500