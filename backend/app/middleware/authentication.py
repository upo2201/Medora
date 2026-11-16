import jwt
from functools import wraps
from flask import request, jsonify, g
from app.config import Config
from app.database import get_db

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authentication token missing or invalid"}), 401
        
        token = auth_header.split(" ")[1]
        try:
            # Check if using custom secret or Supabase JWT secret
            secret = Config.SUPABASE_JWT_SECRET if Config.SUPABASE_JWT_SECRET else Config.SECRET_KEY
            payload = jwt.decode(token, secret, algorithms=["HS256"])
            user_id = payload.get("sub") or payload.get("id")
            
            if not user_id:
                return jsonify({"error": "Invalid token payload"}), 401
                
            # Verify user exists in database
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT id, email, full_name FROM users WHERE id = ?", (user_id,))
                user = cursor.fetchone()
                if not user:
                    return jsonify({"error": "User account no longer exists"}), 401
                
                g.current_user = {
                    "id": user["id"],
                    "email": user["email"],
                    "full_name": user["full_name"]
                }
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Authentication token has expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid authentication token"}), 401
        except Exception as e:
            return jsonify({"error": "Authentication failure"}), 401

        return f(*args, **kwargs)
    return decorated

