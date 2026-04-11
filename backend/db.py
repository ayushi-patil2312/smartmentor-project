import os
import mysql.connector

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("MYSQLHOST") or os.getenv("MYSQL_HOST"),
        user=os.getenv("MYSQLUSER") or os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQLPASSWORD") or os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQLDATABASE") or os.getenv("MYSQL_DATABASE"),
        port=int(os.getenv("MYSQLPORT") or os.getenv("MYSQL_PORT") or 3306)
    )