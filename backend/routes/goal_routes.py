from flask import Blueprint, jsonify
from model.goal_model import get_goals

goal_bp = Blueprint('goals', __name__)

@goal_bp.route('/goals', methods=['GET'])
def all_goals():
    return jsonify(get_goals())