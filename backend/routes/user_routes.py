from flask import Blueprint, jsonify

user_bp = Blueprint('users', __name__)

@user_bp.route('/users', methods=['GET'])
def users():
    return jsonify([])