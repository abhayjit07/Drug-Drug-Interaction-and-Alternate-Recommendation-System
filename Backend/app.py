import os
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth, initialize_app, firestore


# Firebase Configuration (matching your firebase.jsx)
firebase_config = {
    "apiKey": "AIzaSyBJsZVFFqbhTCo4bZYVyI7qbRGpVBOB_fk",
    "authDomain": "major-project-5f739.firebaseapp.com",
    "projectId": "major-project-5f739",
    "storageBucket": "major-project-5f739.firebasestorage.app",
    "messagingSenderId": "264696943617",
    "appId": "1:264696943617:web:482b06a70e60efc2d05c00",
}

# Initialize Firebase Admin SDK
cred = credentials.Certificate('./major-project.json')
print(cred.project_id)
firebase_admin.initialize_app(cred)

# Initialize Flask app
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})


import os
import sqlite3
import sys

def initialize_database(db_path='./Database/appointments.db'):
    """
    Comprehensive database initialization function
    """
    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        # Remove existing corrupted database if it exists
        if os.path.exists(db_path):
            try:
                # Attempt to verify the database
                test_conn = sqlite3.connect(db_path)
                test_conn.execute('SELECT name FROM sqlite_master')
                test_conn.close()
            except sqlite3.DatabaseError:
                print(f"Detected corrupted database. Removing {db_path}")
                os.remove(db_path)
        
        # Create a new database connection
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create appointments table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            location TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Create an index for faster user-specific queries
        cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_appointments_user_id 
        ON appointments(user_id)
        ''')
        
        # Commit changes and close connection
        conn.commit()
        conn.close()
        
        print(f"Database initialized successfully at {db_path}")
        return True
    
    except Exception as e:
        print(f"Database initialization error: {e}")
        print(f"Traceback: {sys.exc_info()}")
        return False

def get_db_connection(db_path='./Database/appointments.db'):
    """
    Robust database connection function
    """
    try:
        # Ensure database is initialized
        if not os.path.exists(db_path):
            print(f"Database not found at {db_path}. Initializing...")
            initialize_database(db_path)
        
        # Attempt to connect to the database
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    except sqlite3.Error as e:
        print(f"SQLite connection error: {e}")
        # Attempt to reinitialize the database
        initialize_database(db_path)
        
        # Retry connection
        try:
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row
            return conn
        except Exception as retry_error:
            print(f"Failed to reconnect after reinitialization: {retry_error}")
            raise

# Call this during application startup
initialize_database()

# Middleware to verify Firebase token
def verify_firebase_token(request):
    id_token = request.headers.get('Authorization')
    if not id_token:
        return None

    try:
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(id_token.split('Bearer ')[1])
        return decoded_token['uid']
    except Exception as e:
        print(f"Token verification error: {e}")
        return None

# Appointments CRUD Operations (similar to previous example)
@app.route('/appointments', methods=['GET'])
def get_appointments():
    user_id = verify_firebase_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT * FROM appointments WHERE user_id = ?', (user_id,))
        appointments = cursor.fetchall()
        return jsonify([dict(appointment) for appointment in appointments]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/addappointments', methods=['POST'])
def create_appointment():
    # Print out debugging information
    print("Current working directory:", os.getcwd())
    print("Absolute path to database:", os.path.abspath('./Database/appointments.db'))
    
    user_id = verify_firebase_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    
    try:
        # Use the new robust connection method
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO appointments 
                (user_id, title, date, time, location, description) 
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                user_id, 
                data['title'], 
                data['date'], 
                data['time'], 
                data.get('location', ''), 
                data.get('description', '')
            ))
            conn.commit()
            appointment_id = cursor.lastrowid
            return jsonify({"id": appointment_id}), 201
        except sqlite3.Error as sqlite_err:
            print(f"SQLite Error Details: {sqlite_err}")
            return jsonify({"error": f"Database error: {str(sqlite_err)}"}), 500
        finally:
            conn.close()
    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/', methods = ['GET'])
def home():
    return "hello world"


if __name__ == '__main__':
    app.run(debug=True)