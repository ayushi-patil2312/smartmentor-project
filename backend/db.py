import os
import mysql.connector
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_connection():
    try:
        # Railway MySQL environment variables with fallbacks
        host = os.getenv("MYSQLHOST") or os.getenv("MYSQL_HOST")
        user = os.getenv("MYSQLUSER") or os.getenv("MYSQL_USER")
        password = os.getenv("MYSQLPASSWORD") or os.getenv("MYSQL_PASSWORD")
        database = os.getenv("MYSQLDATABASE") or os.getenv("MYSQL_DATABASE")
        
        port_env = os.getenv("MYSQLPORT") or os.getenv("MYSQL_PORT")

        # Safely convert port to int, default to 3306
        if port_env is not None and str(port_env).strip() != "":
            port = int(port_env)
        else:
            port = 3306
            
        if not host:
            logger.error("DB connection variables are missing!")

        return mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=port
        )
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise