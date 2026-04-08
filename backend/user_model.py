from db import get_db_connection

# 🔐 LOGIN FUNCTION
def get_user_by_email(email, password):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = "SELECT * FROM users WHERE email=%s AND password=%s"
    cursor.execute(query, (email, password))

    user = cursor.fetchone()

    conn.close()

    return user

# 👤 GET ALL USERS (optional for admin)
def get_all_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()

    conn.close()

    return users

# ➕ ADD USER (student/mentor/admin)
def add_user(name, email, password, role):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Check for duplicate email
    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    if cursor.fetchone():
        conn.close()
        return {"status": "error", "message": "Email already exists"}

    query = "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)"
    cursor.execute(query, (name, email, password, role))

    conn.commit()
    conn.close()

    return {"status": "success", "message": "User added successfully"}

# 🔑 RESET PASSWORD
def update_password(email, new_password):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    if not cursor.fetchone():
        conn.close()
        return {"status": "error", "message": "User not found"}

    query = "UPDATE users SET password=%s WHERE email=%s"
    cursor.execute(query, (new_password, email))

    conn.commit()
    conn.close()

    return {"status": "success", "message": "Password updated successfully"}

# 🎓 GET STUDENTS BY MENTOR
def get_students_by_mentor(mentor_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = "SELECT id, name, email FROM users WHERE role='student' AND mentor_id=%s"
    cursor.execute(query, (mentor_id,))
    students = cursor.fetchall()

    conn.close()

    return students