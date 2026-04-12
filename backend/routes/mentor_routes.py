from flask import Blueprint, jsonify, request
from user_model import get_students_by_mentor
from db import get_db_connection

mentor_bp = Blueprint('mentor', __name__)

@mentor_bp.route('/mentor/students/<int:mentor_id>', methods=['GET'])
def fetch_students_for_mentor(mentor_id):
    try:
        students = get_students_by_mentor(mentor_id)
        return jsonify(students), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@mentor_bp.route('/mentor/feedback', methods=['POST'])
def add_feedback():
    data = request.json
    student_id = data.get('student_id')
    mentor_id = data.get('mentor_id')
    text = data.get('text')
    
    if not all([student_id, mentor_id, text]):
        return jsonify({"status": "error", "message": "Missing fields"}), 400
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO feedbacks (student_id, mentor_id, text) VALUES (%s, %s, %s)", 
                       (student_id, mentor_id, text))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Feedback added"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@mentor_bp.route('/feedbacks', methods=['GET'])
def get_all_feedbacks():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM feedbacks")
        feedbacks = cursor.fetchall()
        conn.close()
        return jsonify({"status": "success", "data": feedbacks}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
