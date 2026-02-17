from flask import Flask, Blueprint
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS # 1. Importação correta
from config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # 2. INICIALIZAÇÃO DO CORS (Obrigatório para o React funcionar)
    # Isso libera o acesso para o seu frontend na porta 5173
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

    db.init_app(app)
    migrate.init_app(app, db)

    # Importa os blueprints
    from app.routes.auth_routes import bp as auth_bp
    from app.routes.notificacao_routes import bp as notificacao_bp
    from app.routes.setor_routes import bp as setor_bp
    from app.routes import stats_routes 
    from app.routes import config_routes
    from app.routes.admin import admin_bp

    # REGISTRO PADRONIZADO
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(notificacao_bp, url_prefix='/api/notificacoes')
    app.register_blueprint(setor_bp, url_prefix='/api/setores')
    app.register_blueprint(stats_routes.bp, url_prefix='/api/stats')
    app.register_blueprint(config_routes.bp, url_prefix='/api/config')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Blueprint de teste (Ping)
    ping_bp = Blueprint("ping_api", __name__, url_prefix="/api")
    @ping_bp.get("/ping")
    def ping():
        return {"pong": True}
    app.register_blueprint(ping_bp)

    return app