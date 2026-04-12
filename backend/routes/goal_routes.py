from flask import Blueprint, jsonify, request
from model.goal_model import get_goals, add_goal, update_goal_progress

goal_bp = Blueprint('goals', __name__)

@goal_bp.route('/goals', methods=['GET'])
def all_goals():
    try:
        goals = get_goals()
        # Ensure column names map smoothly to frontend JS expectations or handled in context
        return jsonify({"status": "success", "data": goals}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@goal_bp.route('/goals', methods=['POST'])
def create_goal():
    data = request.json
    student_id = data.get('student_id')
    title = data.get('title')
    
    if not all([student_id, title]):
        return jsonify({"status": "error", "message": "Missing fields"}), 400
        
    try:
        result = add_goal(student_id, title)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@goal_bp.route('/goals/<int:goal_id>/progress', methods=['PUT'])
def update_goal(goal_id):
    data = request.json
    progress = data.get('progress')
    
    if progress is None:
        return jsonify({"status": "error", "message": "Missing progress"}), 400
        
    try:
        result = update_goal_progress(goal_id, progress)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500