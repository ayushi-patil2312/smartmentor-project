from flask import Flask, request, jsonify, g
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os

FRONTEND_DIST = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'dist'
)

app = Flask(
    __name__,
    static_folder=FRONTEND_DIST if os.path.isdir(FRONTEND_DIST) else None,
    static_url_path=''
)
CORS(app, supports_credentials=True)


def get_db():
    if 'db' not in g:
        database_url = os.getenv("DATABASE_URL")
        if database_url:
            g.db = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
        else:
            g.db = psycopg2.connect(
                host=os.getenv("PGHOST", "localhost"),
                database=os.getenv("PGDATABASE", "postgres"),
                user=os.getenv("PGUSER", "postgres"),
                password=os.getenv("PGPASSWORD", "password"),
                port=os.getenv("PGPORT", "5432"),
                cursor_factory=RealDictCursor,
            )
    return g.db


@app.teardown_appcontext
def close_db(error):
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"), cursor_factory=RealDictCursor)
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'student',
                mentor_id INTEGER
            );
            CREATE TABLE IF NOT EXISTS goals (
                id SERIAL PRIMARY KEY,
                student_id INTEGER,
                title TEXT NOT NULL,
                progress INTEGER DEFAULT 0,
                status TEXT DEFAULT 'pending'
            );
            CREATE TABLE IF NOT EXISTS mentor_requests (
                id SERIAL PRIMARY KEY,
                student_id INTEGER NOT NULL,
                preferred_subject TEXT,
                message TEXT,
                status TEXT DEFAULT 'pending',
                mentor_id INTEGER,
                created_at TIMESTAMP DEFAULT NOW(),
                assigned_at TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS feedbacks (
                id SERIAL PRIMARY KEY,
                student_id INTEGER NOT NULL,
                mentor_id INTEGER NOT NULL,
                feedback_text TEXT,
                rating INTEGER,
                created_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS student_performance (
                student_id INTEGER PRIMARY KEY,
                attendance INTEGER DEFAULT 0,
                marks JSONB DEFAULT '[]'::jsonb,
                study_hours INTEGER DEFAULT 0,
                updated_at TIMESTAMP DEFAULT NOW()
            );
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                message TEXT NOT NULL,
                type TEXT DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        """)
        # Migration: add mentor_id column on existing users table if missing
        cur.execute("""
            ALTER TABLE users ADD COLUMN IF NOT EXISTS mentor_id INTEGER;
        """)
        conn.commit()
    conn.close()


with app.app_context():
    try:
        init_db()
    except Exception as e:
        print("DB init error:", e)


@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({"error": str(e)}), 500


# ───── Static / SPA ─────
@app.route('/')
def home():
    if app.static_folder and os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return app.send_static_file('index.html')
    return jsonify({"status": "API Running"})
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})


# ───── Auth ─────
@app.route('/api/register', methods=['POST'])
@app.route('/register', methods=['POST'])
def register():
    data = request.json or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')
    if not name or not email or not password:
        return jsonify({"error": "Name, email and password required"}), 400

    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM users WHERE email=%s", (email,))
        if cur.fetchone():
            return jsonify({"error": "User already exists"}), 400
        cur.execute(
            "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s) RETURNING *",
            (name, email, password, role),
        )
        new_user = cur.fetchone()
        conn.commit()
    return jsonify({"status": "success", "user": new_user}), 201


@app.route('/api/login', methods=['POST'])
@app.route('/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM users WHERE email=%s AND password=%s", (email, password))
        user = cur.fetchone()
    if user:
        return jsonify({"status": "success", "user": user}), 200
    return jsonify({"error": "Invalid credentials", "status": "error"}), 401


@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.json or {}
    email = data.get('email')
    new_password = data.get('password') or data.get('new_password')
    if not email or not new_password:
        return jsonify({"error": "Email and new password required"}), 400
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("UPDATE users SET password=%s WHERE email=%s RETURNING id", (new_password, email))
        row = cur.fetchone()
        conn.commit()
    if not row:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"status": "success"})


# ───── Users ─────
@app.route('/api/users')
@app.route('/users')
def get_users():
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("SELECT id, name, email, role, mentor_id FROM users ORDER BY id")
        users = cur.fetchall()
    return jsonify(users)


@app.route('/api/users/add', methods=['POST'])
@app.route('/users/add', methods=['POST'])
def add_user():
    data = request.json or {}
    name, email = data.get('name'), data.get('email')
    if not name or not email:
        return jsonify({"error": "Name and email required"}), 400
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM users WHERE email=%s", (email,))
        if cur.fetchone():
            return jsonify({"error": "User exists"}), 400
        cur.execute(
            "INSERT INTO users (name, email, password, role) VALUES (%s,%s,%s,%s) RETURNING *",
            (name, email, data.get('password', '1234'), data.get('role', 'student')),
        )
        new_user = cur.fetchone()
        conn.commit()
    return jsonify({"status": "success", "user": new_user})


@app.route('/api/users/<int:uid>', methods=['DELETE'])
@app.route('/users/<int:uid>', methods=['DELETE'])
def delete_user(uid):
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("DELETE FROM users WHERE id=%s", (uid,))
        conn.commit()
    return jsonify({"status": "success"})


# ───── Goals ─────
@app.route('/api/goals')
@app.route('/goals')
def get_goals():
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM goals ORDER BY id DESC")
        rows = cur.fetchall()
    return jsonify(rows)


@app.route('/api/goals', methods=['POST'])
@app.route('/goals', methods=['POST'])
def add_goal():
    data = request.json or {}
    student_id = data.get('student_id')
    title = data.get('title')
    if not student_id or not title:
        return jsonify({"error": "student_id and title required"}), 400
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO goals (student_id, title, progress, status) VALUES (%s,%s,%s,%s) RETURNING *",
            (student_id, title, 0, "pending"),
        )
        row = cur.fetchone()
        conn.commit()
    return jsonify({"status": "success", "goal": row})


@app.route('/api/goals/<int:gid>/progress', methods=['PUT'])
@app.route('/goals/<int:gid>/progress', methods=['PUT'])
def update_goal_progress(gid):
    data = request.json or {}
    progress = int(data.get('progress', 0))
    status = 'completed' if progress >= 100 else ('in_progress' if progress > 0 else 'pending')
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE goals SET progress=%s, status=%s WHERE id=%s",
            (progress, status, gid),
        )
        conn.commit()
    return jsonify({"status": "success"})


# ───── Mentor Requests ─────
@app.route('/api/request-mentor', methods=['POST'])
def request_mentor():
    data = request.json or {}
    student_id = data.get('student_id')
    preferred_subject = data.get('preferred_subject') or data.get('preferredSubject')
    message = data.get('message', '')
    if not student_id or not preferred_subject:
        return jsonify({"error": "student_id and preferred_subject required"}), 400

    conn = get_db()
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id FROM mentor_requests WHERE student_id=%s AND status='pending'",
            (student_id,),
        )
        if cur.fetchone():
            return jsonify({"error": "You already have a pending request"}), 400
        cur.execute(
            "INSERT INTO mentor_requests (student_id, preferred_subject, message) VALUES (%s,%s,%s) RETURNING *",
            (student_id, preferred_subject, message),
        )
        row = cur.fetchone()
        conn.commit()
    return jsonify({"status": "success", "request": row})


@app.route('/api/my-requests/<int:student_id>')
def my_requests(student_id):
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute(
            "SELECT * FROM mentor_requests WHERE student_id=%s ORDER BY created_at DESC",
            (student_id,),
        )
        rows = cur.fetchall()
    return jsonify(rows)


@app.route('/api/pending-requests')
def pending_requests():
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("""
            SELECT r.*, u.name AS student_name, u.email AS student_email
            FROM mentor_requests r
            JOIN users u ON u.id = r.student_id
            WHERE r.status='pending'
            ORDER BY r.created_at DESC
        """)
        rows = cur.fetchall()
    return jsonify(rows)


def create_notification(cur, user_id, message, ntype='info'):
    cur.execute(
        "INSERT INTO notifications (user_id, message, type) VALUES (%s,%s,%s)",
        (user_id, message, ntype),
    )


@app.route('/api/assign-mentor', methods=['POST'])
def assign_mentor_route():
    data = request.json or {}
    student_id = data.get('student_id')
    mentor_id = data.get('mentor_id')
    request_id = data.get('request_id')
    if not student_id or not mentor_id:
        return jsonify({"error": "student_id and mentor_id required"}), 400

    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("UPDATE users SET mentor_id=%s WHERE id=%s", (mentor_id, student_id))
        if request_id:
            cur.execute(
                "UPDATE mentor_requests SET status='assigned', mentor_id=%s, assigned_at=NOW() WHERE id=%s",
                (mentor_id, request_id),
            )
        else:
            cur.execute(
                "UPDATE mentor_requests SET status='assigned', mentor_id=%s, assigned_at=NOW() WHERE student_id=%s AND status='pending'",
                (mentor_id, student_id),
            )
        # Lookup names for notification text
        cur.execute("SELECT name FROM users WHERE id=%s", (student_id,))
        s = cur.fetchone()
        cur.execute("SELECT name FROM users WHERE id=%s", (mentor_id,))
        m = cur.fetchone()
        student_name = (s or {}).get('name') if isinstance(s, dict) else (s and s[0]) or 'Student'
        mentor_name = (m or {}).get('name') if isinstance(m, dict) else (m and m[0]) or 'Mentor'
        create_notification(cur, student_id, f"You have been assigned to mentor {mentor_name}.", 'mentor_assigned')
        create_notification(cur, mentor_id, f"New student assigned: {student_name}.", 'student_assigned')
        conn.commit()
    return jsonify({"status": "success"})


# ───── Notifications ─────
@app.route('/api/notifications/<int:user_id>')
def get_notifications(user_id):
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute(
            "SELECT * FROM notifications WHERE user_id=%s ORDER BY created_at DESC LIMIT 50",
            (user_id,),
        )
        rows = cur.fetchall()
    return jsonify(rows)


@app.route('/api/notifications/<int:nid>/read', methods=['POST'])
def mark_notification_read(nid):
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("UPDATE notifications SET is_read=TRUE WHERE id=%s", (nid,))
        conn.commit()
    return jsonify({"status": "success"})


@app.route('/api/notifications/read-all/<int:user_id>', methods=['POST'])
def mark_all_read(user_id):
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("UPDATE notifications SET is_read=TRUE WHERE user_id=%s", (user_id,))
        conn.commit()
    return jsonify({"status": "success"})


# Legacy alias kept for backward compatibility
@app.route('/users/assign-mentor', methods=['POST'])
def assign_mentor_legacy():
    return assign_mentor_route()


# ───── Mentor: My Students ─────
@app.route('/api/my-students/<int:mentor_id>')
def my_students(mentor_id):
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("""
            SELECT u.id, u.name, u.email,
                   p.attendance, p.marks, p.study_hours, p.updated_at
            FROM users u
            LEFT JOIN student_performance p ON p.student_id = u.id
            WHERE u.mentor_id=%s AND u.role='student'
            ORDER BY u.name
        """, (mentor_id,))
        rows = cur.fetchall()
    return jsonify(rows)


@app.route('/mentor/students/<int:mentor_id>')
def mentor_students_legacy(mentor_id):
    return my_students(mentor_id)


# ───── Feedback ─────
@app.route('/api/feedback', methods=['POST'])
def add_feedback():
    data = request.json or {}
    student_id = data.get('student_id') or data.get('studentId')
    mentor_id = data.get('mentor_id') or data.get('mentorId')
    text = data.get('feedback_text') or data.get('text', '')
    rating = data.get('rating')
    if not student_id or not mentor_id:
        return jsonify({"error": "student_id and mentor_id required"}), 400
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO feedbacks (student_id, mentor_id, feedback_text, rating) VALUES (%s,%s,%s,%s) RETURNING *",
            (student_id, mentor_id, text, rating),
        )
        row = cur.fetchone()
        cur.execute("SELECT name FROM users WHERE id=%s", (mentor_id,))
        m = cur.fetchone()
        mentor_name = (m or {}).get('name') if isinstance(m, dict) else (m and m[0]) or 'Your mentor'
        create_notification(cur, student_id, f"{mentor_name} left you new feedback ({rating or '—'}★).", 'feedback')
        conn.commit()
    return jsonify({"status": "success", "feedback": row})


@app.route('/api/feedback/<int:student_id>')
def get_feedback(student_id):
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("""
            SELECT f.*, u.name AS mentor_name
            FROM feedbacks f
            LEFT JOIN users u ON u.id = f.mentor_id
            WHERE f.student_id=%s
            ORDER BY f.created_at DESC
        """, (student_id,))
        rows = cur.fetchall()
    return jsonify(rows)


@app.route('/api/feedbacks')
@app.route('/feedbacks')
def get_all_feedbacks():
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("""
            SELECT f.*, u.name AS mentor_name
            FROM feedbacks f
            LEFT JOIN users u ON u.id = f.mentor_id
            ORDER BY f.created_at DESC
        """)
        rows = cur.fetchall()
    return jsonify(rows)


# Legacy mentor feedback path
@app.route('/mentor/feedback', methods=['POST'])
def mentor_feedback_legacy():
    return add_feedback()


# ───── Student Performance ─────
@app.route('/api/performance/<int:student_id>')
def get_performance(student_id):
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM student_performance WHERE student_id=%s", (student_id,))
        row = cur.fetchone()
    if not row:
        return jsonify(None)
    return jsonify(row)


@app.route('/api/performance', methods=['POST'])
def save_performance():
    data = request.json or {}
    student_id = data.get('student_id')
    if not student_id:
        return jsonify({"error": "student_id required"}), 400
    attendance = data.get('attendance', 0)
    marks = data.get('marks', [])
    study_hours = data.get('study_hours', 0)
    import json as _json
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO student_performance (student_id, attendance, marks, study_hours, updated_at)
            VALUES (%s, %s, %s::jsonb, %s, NOW())
            ON CONFLICT (student_id) DO UPDATE SET
                attendance = EXCLUDED.attendance,
                marks = EXCLUDED.marks,
                study_hours = EXCLUDED.study_hours,
                updated_at = NOW()
            RETURNING *
        """, (student_id, attendance, _json.dumps(marks), study_hours))
        row = cur.fetchone()
        conn.commit()
    return jsonify({"status": "success", "performance": row})


@app.route('/student/performance', methods=['POST'])
def student_performance_legacy():
    """Legacy endpoint: appends a marks entry or sets attendance/study_hours."""
    data = request.json or {}
    student_id = data.get('student_id')
    rec_type = data.get('type')
    payload = data.get('data')
    if not student_id:
        return jsonify({"error": "student_id required"}), 400
    import json as _json
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM student_performance WHERE student_id=%s", (student_id,))
        existing = cur.fetchone() or {"attendance": 0, "marks": [], "study_hours": 0}
        attendance = existing.get('attendance', 0)
        marks = existing.get('marks', []) or []
        study_hours = existing.get('study_hours', 0)
        if rec_type == 'marks':
            marks = payload if isinstance(payload, list) else marks
        elif rec_type == 'attendance':
            attendance = int(payload or 0)
        elif rec_type == 'study_hours':
            study_hours = int(payload or 0)
        cur.execute("""
            INSERT INTO student_performance (student_id, attendance, marks, study_hours, updated_at)
            VALUES (%s, %s, %s::jsonb, %s, NOW())
            ON CONFLICT (student_id) DO UPDATE SET
                attendance=EXCLUDED.attendance,
                marks=EXCLUDED.marks,
                study_hours=EXCLUDED.study_hours,
                updated_at=NOW()
        """, (student_id, attendance, _json.dumps(marks), study_hours))
        conn.commit()
    return jsonify({"status": "success"})


@app.route('/api/reports/performance')
@app.route('/reports/performance')
def reports_performance():
    """Aggregate of all student performance for admin/reports."""
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("""
            SELECT p.*, u.name AS student_name
            FROM student_performance p
            JOIN users u ON u.id = p.student_id
        """)
        rows = cur.fetchall()
    return jsonify(rows)


# ───── Recommendations (rule-based) ─────
@app.route('/api/recommendations/<int:student_id>')
def recommendations(student_id):
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("SELECT mentor_id FROM users WHERE id=%s", (student_id,))
        u = cur.fetchone()
        cur.execute("SELECT * FROM student_performance WHERE student_id=%s", (student_id,))
        perf = cur.fetchone()

    recs = []
    if perf:
        attendance = perf.get('attendance') or 0
        marks = perf.get('marks') or []
        if attendance < 75:
            recs.append({
                "level": "warning",
                "title": "Attendance below 75%",
                "message": f"Your attendance is {attendance}%. Try to attend more sessions to stay on track.",
            })
        if marks:
            scores = [m.get('score', 0) if isinstance(m, dict) else 0 for m in marks]
            avg = sum(scores) / len(scores) if scores else 0
            if avg < 50:
                recs.append({
                    "level": "danger",
                    "title": "Average marks below 50",
                    "message": f"Your average is {round(avg, 1)}. Schedule extra practice sessions.",
                })
    else:
        recs.append({
            "level": "info",
            "title": "No performance data yet",
            "message": "Add your marks and attendance to receive personalized insights.",
        })

    if not u or not u.get('mentor_id'):
        recs.append({
            "level": "info",
            "title": "No mentor assigned",
            "message": "Request a mentor to get expert guidance for your goals.",
        })
    return jsonify(recs)


# ───── SPA fallback (must be last) ─────
@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
def spa_fallback(path):
    if path.startswith('api/'):
        return jsonify({"error": "Not found"}), 404
    if request.method != 'GET':
        return jsonify({"error": "Method not allowed"}), 405
    if app.static_folder:
        full = os.path.join(app.static_folder, path)
        if os.path.isfile(full):
            return app.send_static_file(path)
        if os.path.exists(os.path.join(app.static_folder, 'index.html')):
            return app.send_static_file('index.html')
    return jsonify({"error": "Not found"}), 404


if __name__ == '__main__':
    app.run(host='localhost', port=8000, debug=False)
