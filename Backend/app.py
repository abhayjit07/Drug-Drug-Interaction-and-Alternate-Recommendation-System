import os
import sqlite3
import traceback
import json
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth, initialize_app, firestore

# Firebase Configuration
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

# Sample medication interaction database (replace with your actual model)
# This is a simplified example - you would integrate with a more comprehensive drug interaction database
MEDICATION_INTERACTIONS = {
    ('amoxicillin', 'ibuprofen'): {
        'severity': 'mild',
        'description': 'May increase the risk of bleeding.'
    },
    ('lisinopril', 'potassium'): {
        'severity': 'severe',
        'description': 'May cause dangerous increase in potassium levels.'
    },
    ('warfarin', 'aspirin'): {
        'severity': 'severe',
        'description': 'Increased risk of bleeding.'
    },
    ('simvastatin', 'grapefruit'): {
        'severity': 'moderate',
        'description': 'May increase statin side effects.'
    },
    # Add more interactions as needed
}

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
        
        # Create updated medications table with times instead of frequency
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS medications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            dosage TEXT NOT NULL,
            times TEXT NOT NULL,
            medical_condition TEXT,
            start_date TEXT,
            end_date TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Create medication interactions table to store detected interactions
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS medication_interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            medication1_id INTEGER NOT NULL,
            medication2_id INTEGER NOT NULL,
            severity TEXT NOT NULL,
            description TEXT NOT NULL,
            FOREIGN KEY (medication1_id) REFERENCES medications (id),
            FOREIGN KEY (medication2_id) REFERENCES medications (id)
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
        
        cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_medication_interactions_user_id 
        ON medication_interactions(user_id)
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

# Date utilities for checking overlapping medications
def is_date_range_overlap(start1, end1, start2, end2):
    """Check if two date ranges overlap"""
    # Handle empty end dates (ongoing medications)
    if not end1:
        end1 = '9999-12-31'  # Far future date
    if not end2:
        end2 = '9999-12-31'  # Far future date
    
    # Return true if there's overlap
    return start1 <= end2 and start2 <= end1

def find_overlapping_medications(user_id):
    """Find all medications with overlapping date ranges for a user"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all medications for the user
        cursor.execute('SELECT * FROM medications WHERE user_id = ?', (user_id,))
        medications = [dict(medication) for medication in cursor.fetchall()]
        
        # Find overlapping pairs
        overlapping_pairs = []
        for i in range(len(medications)):
            for j in range(i+1, len(medications)):
                med1 = medications[i]
                med2 = medications[j]
                
                # Check if date ranges overlap
                if (med1['start_date'] and med2['start_date'] and 
                    is_date_range_overlap(
                        med1['start_date'], med1['end_date'],
                        med2['start_date'], med2['end_date']
                    )):
                    overlapping_pairs.append((med1, med2))
        
        return overlapping_pairs
    
    except Exception as e:
        print(f"Error finding overlapping medications: {e}")
        print(traceback.format_exc())
        return []
    
    finally:
        if 'conn' in locals():
            conn.close()

def check_medication_interaction(med1_name, med2_name):
    """Check if two medications have a known interaction"""
    # Normalize medication names for comparison (lowercase)
    med1_name_lower = med1_name.lower()
    med2_name_lower = med2_name.lower()
    
    # Check both possible orders of the medication pair
    if (med1_name_lower, med2_name_lower) in MEDICATION_INTERACTIONS:
        return MEDICATION_INTERACTIONS[(med1_name_lower, med2_name_lower)]
    elif (med2_name_lower, med1_name_lower) in MEDICATION_INTERACTIONS:
        return MEDICATION_INTERACTIONS[(med2_name_lower, med1_name_lower)]
    
    # No interaction found
    return None

def analyze_medication_interactions(user_id):
    """Analyze all medication interactions for a user"""
    try:
        # Find all overlapping medications
        overlapping_pairs = find_overlapping_medications(user_id)
        
        # Check each pair for interactions
        interactions = []
        for med1, med2 in overlapping_pairs:
            interaction = check_medication_interaction(med1['name'], med2['name'])
            if interaction:
                interactions.append({
                    'medication1': {
                        'id': med1['id'],
                        'name': med1['name'],
                        'dosage': med1['dosage']
                    },
                    'medication2': {
                        'id': med2['id'],
                        'name': med2['name'],
                        'dosage': med2['dosage']
                    },
                    'severity': interaction['severity'],
                    'description': interaction['description']
                })
        
        return interactions
    
    except Exception as e:
        print(f"Error analyzing medication interactions: {e}")
        print(traceback.format_exc())
        return []

# New endpoint to check medication interactions
@app.route('/medication-interactions', methods=['GET'])
def get_medication_interactions():
    try:
        # Verify user token first
        user_id = verify_firebase_token(request)
        if not user_id:
            print("Unauthorized access attempt")
            return jsonify({"error": "Unauthorized"}), 401
        
        # Analyze medication interactions
        interactions = analyze_medication_interactions(user_id)
        
        return jsonify({
            'interactions': interactions,
            'count': len(interactions)
        }), 200
    
    except Exception as e:
        print(f"Error in get_medication_interactions: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

# Endpoint to check interaction between two specific medications
@app.route('/check-interaction', methods=['POST'])
def check_specific_interaction():
    try:
        # Verify user token first
        user_id = verify_firebase_token(request)
        if not user_id:
            print("Unauthorized access attempt")
            return jsonify({"error": "Unauthorized"}), 401
        
        # Get request data
        data = request.json
        if 'medication1' not in data or 'medication2' not in data:
            return jsonify({"error": "Missing medication names"}), 400
        
        # Check for interaction
        interaction = check_medication_interaction(data['medication1'], data['medication2'])
        
        if interaction:
            return jsonify({
                'hasInteraction': True,
                'severity': interaction['severity'],
                'description': interaction['description']
            }), 200
        else:
            return jsonify({
                'hasInteraction': False
            }), 200
    
    except Exception as e:
        print(f"Error in check_specific_interaction: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

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
            med_dict = dict(zip([column[0] for column in cursor.description], medication))
            
            # Parse the times JSON string back into an array
            if 'times' in med_dict and med_dict['times']:
                try:
                    med_dict['times'] = json.loads(med_dict['times'])
                except:
                    med_dict['times'] = []
            
            medications_list.append(med_dict)
        
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
        required_fields = ['name', 'dosage', 'times']
        for field in required_fields:
            if field not in data:
                print(f"Missing required field: {field}")
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Convert times array to JSON string for storage
        times_json = json.dumps(data['times'])
        
        # Attempt to get database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert medication with all the new fields
        cursor.execute('''
            INSERT INTO medications 
            (user_id, name, dosage, times, medical_condition, start_date, end_date, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, 
            data['name'], 
            data['dosage'], 
            times_json,
            data.get('medicalCondition'),
            data.get('startDate'),
            data.get('endDate'),
            data.get('notes')
        ))
        
        # Commit and get last row id
        conn.commit()
        medication_id = cursor.lastrowid
        
        # After adding a new medication, check for new interactions
        interactions = analyze_medication_interactions(user_id)
        
        return jsonify({
            "id": medication_id,
            "newInteractionsCount": len(interactions)
        }), 201
    
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