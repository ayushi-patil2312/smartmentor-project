from flask import Blueprint, jsonify
from db import get_db_connection

report_bp = Blueprint('reports', __name__)

@report_bp.route('/reports/performance', methods=['GET'])
def get_performance_data():
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "Database error"}), 500
        
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM performance")
        records = cursor.fetchall()

        # Format to match frontend structure (academicData array)
        formatted_data = []
        
        # Group by student_id and type
        grouped = {}
        for row in records:
            student_id = row['student_id']
            rtype = row['type']
            key = f"{student_id}_{rtype}"
            
            if key not in grouped:
                grouped[key] = {
                    "id": f"perf_{len(grouped)}",
                    "studentId": str(student_id),
                    "type": rtype,
                    "data": []
                }
                
            if rtype == "marks":
                grouped[key]["data"].append({"subject": row['subject'], "score": row['score']})
            elif rtype == "progressOverTime":
                grouped[key]["data"].append({"name": row['week_name'], "score": row['score']})
                
        formatted_data = list(grouped.values())
        return jsonify({"status": "success", "data": formatted_data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
