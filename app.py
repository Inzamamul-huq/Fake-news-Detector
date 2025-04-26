from flask import Flask, request, jsonify, render_template
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for

import pickle
import os
from datetime import datetime

try:
    import pymongo
  
    try:
        client = pymongo.MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=5000)
        client.server_info()  
        print("MongoDB connection successful")
        db = client["fake_news_db"]
        feedback_collection = db["user_feedback"]
        news_collection = db["news"]

        using_mongodb = True
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        using_mongodb = False
except ImportError:
    print("pymongo not installed")
    using_mongodb = False

if not using_mongodb:
    print("Using in-memory database instead of MongoDB")
    class InMemoryDB:
        def __init__(self):
            self.data = {}
            
        def find_one(self, query):
            text = query.get("text", "")
            return self.data.get(text)
            
        def update_one(self, query, update, upsert=False):
            text = query.get("text", "")
            if text not in self.data and upsert:
                self.data[text] = {}
            if text in self.data:
                for k, v in update.get("$set", {}).items():
                    self.data[text][k] = v
                    
        def find(self, query=None, projection=None):
            return list(self.data.values())
    
    feedback_collection = InMemoryDB()

app = Flask(__name__)


try:
    with open('DT_model.pkl', 'rb') as f:
        model = pickle.load(f)
        
    with open('vectorizer.pkl', 'rb') as f:
        vectorizer = pickle.load(f)
    models_loaded = True
    print("Models loaded successfully")
except FileNotFoundError as e:
    print(f"Model file not found: {e}")
    models_loaded = False
except Exception as e:
    print(f"Error loading models: {e}")
    models_loaded = False

@app.route('/')
def home():
    return render_template('home.html')
@app.route('/home')
def homehome():
    return render_template('index.html')
@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/submit', methods=['POST'])
def submit_username():
    data = request.json
    username = data.get("username", "").strip()

    if not username:
        return jsonify({"error": "No username provided"}), 400

   
    existing_user = db["users"].find_one({"username": username})
    if not existing_user:
        db["users"].insert_one({"username": username}) 

    
    if username == "admininza007":
        return jsonify({"redirect": url_for('admin')})
    else:
        return jsonify({"redirect": url_for('homehome')})


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        news_text = data['text']
        
     
        existing_feedback = feedback_collection.find_one({"text": news_text})
        if existing_feedback:
            return jsonify({
                'prediction': existing_feedback.get('admin_label', 'UNKNOWN'),
                'probability': 1.0,
                'is_from_feedback': True
            })
        
       
        if models_loaded:
            text_vectorized = vectorizer.transform([news_text])
            prediction = model.predict(text_vectorized)[0]
            probabilities = model.predict_proba(text_vectorized)[0]
            probability = probabilities[0] if prediction == 0 else probabilities[1]
            
            result = {
                'prediction': 'FAKE' if prediction == 0 else 'REAL',
                'probability': float(probability),
                'is_from_feedback': False
            }
        else:
           
            is_fake = len(news_text) < 100  
            result = {
                'prediction': 'FAKE' if is_fake else 'REAL',
                'probability': 0.75,
                'is_from_feedback': False
            }
        
        return jsonify(result)
    except Exception as e:
        print(f"Error in predict route: {e}")
        return jsonify({
            'error': str(e),
            'prediction': 'UNKNOWN',
            'probability': 0.5,
            'is_from_feedback': False
        }), 500

@app.route('/feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.get_json()
        news_text = data['text']
        user_feedback = data['feedback'] 
        
        
        feedback_collection.update_one(
            {"text": news_text},
            {"$set": {
                "user_feedback": user_feedback,  
                "admin_label": user_feedback,  
                "timestamp": str(datetime.now()),
                "is_admin_reviewed": False
            }},
            upsert=True
        )
        
        return jsonify({"success": True})
    except Exception as e:
        print(f"Error in feedback route: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/admin/feedback', methods=['GET'])
def get_all_feedback():
    try:
        feedbacks = list(feedback_collection.find())
        
        if using_mongodb:
            for feedback in feedbacks:
                if '_id' in feedback:
                    feedback['_id'] = str(feedback['_id'])
        return jsonify(feedbacks)
    except Exception as e:
        print(f"Error in get_all_feedback route: {e}")
        return jsonify([]), 500
    
@app.route('/admin/approve', methods=['POST'])
def approve_feedback():
    try:
        data = request.get_json()
        news_text = data.get('text')
        admin_label = data.get('admin_label')

        if not news_text or not admin_label:
            return jsonify({"success": False, "error": "Missing text or admin_label"}), 400

       
        existing_feedback = feedback_collection.find_one({"text": news_text})

        if not existing_feedback:
            return jsonify({"success": False, "error": "No matching record found"}), 404

       
        user_feedback = existing_feedback.get('user_feedback', '')

        feedback_collection.update_one(
            {"text": news_text},
            {"$set": {
                "admin_label": admin_label,
                "is_admin_reviewed": True,
                "user_feedback": user_feedback 
            }}
        )

        return jsonify({"success": True})
    except Exception as e:
        print(f"Error in approve_feedback route: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

from bson import ObjectId  

@app.route('/admin/remove_feedback', methods=['DELETE'])
def remove_feedback():
    try:
        data = request.get_json()
        feedback_id = data.get('id', '').strip()  

        if not feedback_id:
            return jsonify({"success": False, "error": "Missing feedback ID"}), 400

    
        try:
            obj_id = ObjectId(feedback_id)
        except:
            return jsonify({"success": False, "error": "Invalid feedback ID"}), 400

        result = feedback_collection.delete_one({"_id": obj_id})

        if result.deleted_count > 0:
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "error": "Feedback not found"}), 404
    except Exception as e:
        print(f"Error in remove_feedback route: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


    
@app.route('/test', methods=['GET'])
def test_endpoint():
    return jsonify({
        "status": "API is working",
        "mongodb_connected": using_mongodb,
        "models_loaded": models_loaded
    })

if __name__ == '__main__':
    app.run(debug=True)