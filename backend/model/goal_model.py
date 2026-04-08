from db import get_db_connection

def get_goals():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM goals")
    goals = cursor.fetchall()

    conn.close()
    return goals