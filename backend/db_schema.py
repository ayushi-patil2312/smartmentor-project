import logging
from db import get_db_connection

logger = logging.getLogger(__name__)

def init_db():
    conn = get_db_connection()
    if not conn:
        logger.error("Could not connect to database for initialization.")
        return

    cursor = conn.cursor()

    try:
        # Users Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'mentor', 'student') NOT NULL,
                mentor_id INT DEFAULT NULL,
                FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE SET NULL
            )
        """)

        # Goals Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS goals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                progress INT DEFAULT 0,
                status ENUM('In Progress', 'Completed') DEFAULT 'In Progress',
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Feedback Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS feedbacks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                mentor_id INT NOT NULL,
                text TEXT NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Performance (Academic Records/Marks) Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS performance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                type ENUM('marks', 'progressOverTime') NOT NULL,
                subject VARCHAR(255) NULL,
                score INT NOT NULL,
                week_name VARCHAR(100) NULL,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        conn.commit()
        logger.info("Database schemas initialized successfully.")

    except Exception as e:
        logger.error(f"Error initializing DB schema: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    init_db()
