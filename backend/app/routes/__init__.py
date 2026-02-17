from flask import Blueprint

# Blueprint de teste
api_bp = Blueprint("api", __name__, url_prefix="/api")

@api_bp.get("/ping")
def ping():
    return {"pong": True}

# Função para registrar o blueprint
def register_blueprints(app):
    app.register_blueprint(api_bp)
