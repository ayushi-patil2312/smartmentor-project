from flask import Blueprint, jsonify, request
from student_model import get_all_students
from db import get_db_connection

student_bp = Blueprint('student', __name__)

@student_bp.route('/students', methods=['GET'])
def get_students():
    students = get_all_students()
    return jsonify(students)

@student_bp.route('/student/performance', methods=['POST'])
def update_performance():
    data = request.json
    student_id = data.get('student_id')
    type_val = data.get('type') # marks or progressOverTime
    record_data = data.get('data') # List of obj {subject, score} or {name, score}
    
    if not all([student_id, type_val, record_data]):
        return jsonify({"status": "error", "message": "Missing fields"}), 400
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Clear previous data of this type for simplicity (based on replace approach from frontend)
        cursor.execute("DELETE FROM performance WHERE student_id=%s AND type=%s", (student_id, type_val))
        
        for item in record_data:
            if type_val == 'marks':
                subject = item.get('subject')
                score = item.get('score')
                cursor.execute("INSERT INTO performance (student_id, type, subject, score) VALUES (%s, %s, %s, %s)",
                               (student_id, type_val, subject, score))
            else: # progressOverTime
                week_name = item.get('name')
                score = item.get('score')
                cursor.execute("INSERT INTO performance (student_id, type, week_name, score) VALUES (%s, %s, %s, %s)",
                               (student_id, type_val, week_name, score))
                               
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Performance uploaded"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500