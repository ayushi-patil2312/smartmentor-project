from flask import Blueprint, jsonify
from student_model import get_all_students

student_bp = Blueprint('student', __name__)

@student_bp.route('/students', methods=['GET'])
def get_students():
    students = get_all_students()
    return jsonify(students)