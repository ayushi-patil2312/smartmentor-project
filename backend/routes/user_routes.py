from flask import Blueprint, jsonify, request
from user_model import get_all_users, add_user, delete_user, assign_mentor

user_bp = Blueprint('users', __name__)

@user_bp.route('/users', methods=['GET'])
def users():
    try:
        users = get_all_users()
        # Clean up password exposure if necessary
        for u in users:
            if 'password' in u:
                del u['password']
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@user_bp.route('/users/add', methods=['POST'])
def add_new_user():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password', '1234')  # default
    role = data.get('role')
    
    if not all([name, email, role]):
        return jsonify({"status": "error", "message": "Missing fields"}), 400
        
    result = add_user(name, email, password, role)
    if result["status"] == "error":
        return jsonify(result), 400
    return jsonify(result), 200

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def remove_user(user_id):
    result = delete_user(user_id)
    return jsonify(result), 200

@user_bp.route('/users/assign-mentor', methods=['POST'])
def assign_user_mentor():
    data = request.json
    student_id = data.get('student_id')
    mentor_id = data.get('mentor_id')
    
    if not student_id:
        return jsonify({"status": "error", "message": "Student ID required"}), 400
        
    result = assign_mentor(student_id, mentor_id)
    return jsonify(result), 200