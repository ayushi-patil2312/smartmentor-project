from flask import Blueprint, jsonify
from user_model import get_students_by_mentor

mentor_bp = Blueprint('mentor', __name__)

@mentor_bp.route('/mentor/students/<int:mentor_id>', methods=['GET'])
def fetch_students_for_mentor(mentor_id):
    try:
        students = get_students_by_mentor(mentor_id)
        return jsonify(students), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
