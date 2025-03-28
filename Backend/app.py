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
CORS(app)

# Database Connection Helper
def get_db_connection():
    conn = sqlite3.connect('./Database/appointments.db')
    conn.row_factory = sqlite3.Row
    return conn

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

# Get user details from Firestore
@app.route('/user', methods=['GET'])
def get_user_details():
    print("Request: ", request)
    user_id = verify_firebase_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        # Assuming you want to fetch user details from Firestore
        db = firestore.client()
        user_ref = db.collection('Users').document(user_id)
        user_doc = user_ref.get()
        
        if user_doc.exists:
            return jsonify(user_doc.to_dict()), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Appointments CRUD Operations (similar to previous example)
@app.route('/appointments', methods=['POST'])
def create_appointment():
    user_id = verify_firebase_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
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
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        conn.close()

# Similar CRUD methods for get, update, delete appointments...

@app.route('/', methods = ['GET'])
def home():
    return "hello world"


if __name__ == '__main__':
    app.run(debug=True)