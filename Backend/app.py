import os
import sqlite3
import sys
import traceback
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
try:
    cred = credentials.Certificate('./major-project.json')
    firebase_admin.initialize_app(cred)
except Exception as e:
    raise

# Initialize Flask app
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

def initialize_database(db_path='./Database/appointments.db'):
    """
    Comprehensive database initialization function
    """
    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
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
        
        # Create medications table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS medications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            dosage TEXT NOT NULL,
            frequency TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Create indexes for faster user-specific queries
        cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_appointments_user_id 
        ON appointments(user_id)
        ''')
        
        cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_medications_user_id 
        ON medications(user_id)
        ''')
        
        # Commit changes and close connection
        conn.commit()
        conn.close()
        
        print(f"Database initialized successfully at {db_path}")
        return True
    
    except Exception as e:
        print(f"Database initialization error: {e}")
        print(traceback.format_exc())
        return False

def get_db_connection(db_path='./Database/appointments.db'):
    """
    Robust database connection function
    """
    try:
        # Ensure database directory exists
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        # Attempt to connect to the database
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    except Exception as e:
        print(f"Database connection error: {e}")
        print(traceback.format_exc())
        raise

# Initialize database on startup
initialize_database()

# Middleware to verify Firebase token
def verify_firebase_token(request):
    id_token = request.headers.get('Authorization')
    if not id_token:
        print("No Authorization token found")
        return None

    try:
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(id_token.split('Bearer ')[1])
        return decoded_token['uid']
    except Exception as e:
        print(f"Token verification error: {e}")
        print(traceback.format_exc())
        return None


@app.route('/appointments', methods=['GET'])
def get_appointments():
    try:
        # Verify user token first
        user_id = verify_firebase_token(request)
        if not user_id:
            print("Unauthorized access attempt")
            return jsonify({"error": "Unauthorized"}), 401
        
        # Attempt to get database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Execute query
        cursor.execute('SELECT * FROM appointments WHERE user_id = ?', (user_id,))
        appointments = cursor.fetchall()
        
        # Convert to list of dictionaries
        appointments_list = []
        for appointment in appointments:
            appointments_list.append(dict(zip([column[0] for column in cursor.description], appointment)))
        
        return jsonify(appointments_list), 200
    
    except sqlite3.Error as e:
        print(f"SQLite Error in get_appointments: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "Database error", "details": str(e)}), 500
    
    except Exception as e:
        print(f"Unexpected error in get_appointments: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
    
    finally:
        # Ensure connection is closed
        if 'conn' in locals():
            conn.close()

# Appointments creation route with detailed error handling
@app.route('/addappointments', methods=['POST'])
def create_appointment():
    try:
        # Verify user token first
        user_id = verify_firebase_token(request)
        if not user_id:
            print("Unauthorized access attempt")
            return jsonify({"error": "Unauthorized"}), 401
        
        # Get request data
        data = request.json
        print("Received appointment data:", data)
        
        # Validate required fields
        required_fields = ['title', 'date', 'time']
        for field in required_fields:
            if field not in data:
                print(f"Missing required field: {field}")
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Attempt to get database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert appointment
        cursor.execute('''
            INSERT INTO appointments 
            (user_id, title, date, time, location, description) 
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            user_id, 
            data['title'], 
            data['date'], 
            data['time'], 
            data.get('location'), 
            data.get('description')
        ))
        
        # Commit and get last row id
        conn.commit()
        appointment_id = cursor.lastrowid
        
        return jsonify({"id": appointment_id}), 201
    
    except sqlite3.Error as e:
        print(f"SQLite Error in create_appointment: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "Database error", "details": str(e)}), 500
    
    except Exception as e:
        print(f"Unexpected error in create_appointment: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
    
    finally:
        # Ensure connection is closed
        if 'conn' in locals():
            conn.close()
# Medications route with detailed error handling
@app.route('/medications', methods=['GET'])
def get_medications():
    try:
        # Verify user token first
        user_id = verify_firebase_token(request)
        if not user_id:
            print("Unauthorized access attempt")
            return jsonify({"error": "Unauthorized"}), 401
        
        # Attempt to get database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Execute query
        cursor.execute('SELECT * FROM medications WHERE user_id = ?', (user_id,))
        medications = cursor.fetchall()
        
        # Convert to list of dictionaries
        medications_list = []
        for medication in medications:
            medications_list.append(dict(zip([column[0] for column in cursor.description], medication)))
        
        return jsonify(medications_list), 200
    
    except sqlite3.Error as e:
        print(f"SQLite Error in get_medications: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "Database error", "details": str(e)}), 500
    
    except Exception as e:
        print(f"Unexpected error in get_medications: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
    
    finally:
        # Ensure connection is closed
        if 'conn' in locals():
            conn.close()

# Medications creation route with detailed error handling
@app.route('/addmedication', methods=['POST'])
def create_medication():
    try:
        # Verify user token first
        user_id = verify_firebase_token(request)
        if not user_id:
            print("Unauthorized access attempt")
            return jsonify({"error": "Unauthorized"}), 401
        
        # Get request data
        data = request.json
        print("Received medication data:", data)
        
        # Validate required fields
        required_fields = ['name', 'dosage', 'frequency']
        for field in required_fields:
            if field not in data:
                print(f"Missing required field: {field}")
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Attempt to get database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert medication
        cursor.execute('''
            INSERT INTO medications 
            (user_id, name, dosage, frequency) 
            VALUES (?, ?, ?, ?)
        ''', (
            user_id, 
            data['name'], 
            data['dosage'], 
            data['frequency']
        ))
        
        # Commit and get last row id
        conn.commit()
        medication_id = cursor.lastrowid
        
        return jsonify({"id": medication_id}), 201
    
    except sqlite3.Error as e:
        print(f"SQLite Error in create_medication: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "Database error", "details": str(e)}), 500
    
    except Exception as e:
        print(f"Unexpected error in create_medication: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
    
    finally:
        # Ensure connection is closed
        if 'conn' in locals():
            conn.close()

@app.route('/', methods=['GET'])
def home():
    return "hello world"

if __name__ == '__main__':
    app.run(debug=True)