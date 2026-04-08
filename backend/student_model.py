from db import get_db_connection

def get_all_students():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE role='student'")
    students = cursor.fetchall()

    conn.close()
    return students