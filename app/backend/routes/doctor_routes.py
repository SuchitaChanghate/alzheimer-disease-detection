from flask import Blueprint, jsonify
from auth import doctor_required
from db import predictions_collection
from bson import ObjectId

doctor_bp = Blueprint('doctor', __name__)

@doctor_bp.route('/patients', methods=['GET'])
@doctor_required
def get_all_patient_predictions(current_user_id, user_role):
    try:
        # Step 1: Find all user IDs who have a subscription to this doctor
        from db import subscriptions_collection
        subscribed_users = subscriptions_collection.distinct("userId", {"doctorId": ObjectId(current_user_id), "status": "active"})
        
        # Step 2: Get predictions for these users
        pipeline = [
            {"$match": {"userId": {"$in": subscribed_users}}},
            {
                "$lookup": {
                    "from": "users",
                    "localField": "userId",
                    "foreignField": "_id",
                    "as": "user"
                }
            },
            {"$unwind": "$user"},
            {
                "$project": {
                    "_id": 1,
                    "prediction": 1,
                    "confidence": 1,
                    "createdAt": 1,
                    "age": 1,
                    "gender": 1,
                    "mmse": 1,
                    "cdr": 1,
                    "gradCamImage": 1,
                    "userName": "$user.name",
                    "userEmail": "$user.email"
                }
            },
            {"$sort": {"createdAt": -1}}
        ]
        history = list(predictions_collection.aggregate(pipeline))
        for entry in history:
            entry['_id'] = str(entry['_id'])
            entry['createdAt'] = entry['createdAt'].isoformat()
        return jsonify(history), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
