import os
import logging
from flask import Flask, send_from_directory, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config

# Extensões
db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Configuração de logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    # CORS – libera apenas o frontend em desenvolvimento
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

    # Inicializa extensões
    db.init_app(app)
    migrate.init_app(app, db)

    # Garante que a pasta de uploads exista
    upload_folder = os.path.join(app.root_path, 'uploads', 'evidencias')
    os.makedirs(upload_folder, exist_ok=True)
    logger.info(f"Pasta de uploads garantida: {upload_folder}")

    # Rota para servir arquivos estáticos (evidências)
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(os.path.join(app.root_path, 'uploads'), filename)

    # Importação e registro dos blueprints
    from app.routes.auth_routes import bp as auth_bp
    from app.routes.notificacao_routes import bp as notificacao_bp
    from app.routes.setor_routes import bp as setor_bp
    from app.routes import stats_routes
    from app.routes import config_routes
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(notificacao_bp, url_prefix='/api/notificacoes')
    app.register_blueprint(setor_bp, url_prefix='/api/setores')
    app.register_blueprint(stats_routes.bp, url_prefix='/api/stats')
    app.register_blueprint(config_routes.bp, url_prefix='/api/config')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Blueprint de teste (Ping)
    from flask import Blueprint
    ping_bp = Blueprint("ping_api", __name__, url_prefix="/api")
    @ping_bp.get("/ping")
    def ping():
        return {"pong": True}
    app.register_blueprint(ping_bp)

    # Tratamento de erro 404 personalizado
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Recurso não encontrado"}), 404

    # Tratamento de erro 500 personalizado
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500

    logger.info("Aplicação iniciada com sucesso!")
    return app