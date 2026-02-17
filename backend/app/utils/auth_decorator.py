from functools import wraps
from flask import request, jsonify
import jwt
from config import Config
from app.models.usuario import Usuario

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token ausente!'}), 401
        try:
            # Remove o prefixo "Bearer " se existir
            token = token.replace("Bearer ", "")
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            current_user = Usuario.query.get(data['user_id'])
        except:
            return jsonify({'error': 'Token inválido!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated