import os
import logging
import traceback

from flask import Flask, send_from_directory, jsonify, Blueprint
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # =========================
    # JWT
    # =========================
    app.config["JWT_SECRET_KEY"] = getattr(config_class, "JWT_SECRET_KEY", None) or os.getenv(
        "JWT_SECRET_KEY",
        "hospital-bem-t-care-secret-key-2026"
    )
    jwt.init_app(app)

    # =========================
    # LOGGING (garante app.logger)
    # =========================
    # Evita duplicar handlers em reload do debug
    if not app.logger.handlers:
        logging.basicConfig(level=logging.INFO)

    app.logger.setLevel(logging.INFO)
    app.logger.info("Iniciando aplicação...")

    # =========================
    # CORS
    # =========================
    # Se você usa cookies/sessão, supports_credentials=True ajuda.
    CORS(
        app,
        resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
        supports_credentials=True
    )

    # =========================
    # EXTENSÕES
    # =========================
    db.init_app(app)
    migrate.init_app(app, db)

    # =========================
    # UPLOADS
    # =========================
    upload_folder = os.path.join(app.root_path, "uploads", "evidencias")
    os.makedirs(upload_folder, exist_ok=True)
    app.logger.info(f"Pasta de uploads garantida: {upload_folder}")

    # Serve arquivos dentro de /uploads/*
    @app.get("/uploads/<path:filename>")
    def uploaded_file(filename):
        # Isso serve qualquer arquivo dentro de app/uploads/...
        return send_from_directory(os.path.join(app.root_path, "uploads"), filename)

    # =========================
    # BLUEPRINTS
    # =========================
    from app.routes.auth_routes import bp as auth_bp
    from app.routes.notificacao_routes import bp as notificacao_bp
    from app.routes.setor_routes import bp as setor_bp
    from app.routes import stats_routes
    from app.routes import config_routes
    from app.routes.admin import admin_bp

    # IMPORTANTE: seus blueprints já têm url_prefix interno?
    # Se o bp de notificações já tem url_prefix='/api/notificacoes',
    # então NÃO passe de novo aqui. Caso contrário, passe aqui.
    #
    # Pelo seu código de rotas, ele parece ter:
    # bp = Blueprint('notificacoes', __name__, url_prefix='/api/notificacoes')
    # então aqui deve ser:
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(notificacao_bp)  # sem url_prefix duplicado
    app.register_blueprint(setor_bp)        # idem, se já tiver prefix no bp
    app.register_blueprint(stats_routes.bp, url_prefix="/api/stats")
    app.register_blueprint(config_routes.bp, url_prefix="/api/config")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    # =========================
    # PING
    # =========================
    ping_bp = Blueprint("ping_api", __name__, url_prefix="/api")

    @ping_bp.get("/ping")
    def ping():
        return jsonify({"pong": True}), 200

    app.register_blueprint(ping_bp)

    # =========================
    # ERROS (NÃO ENGOLIR EXCEÇÃO)
    # =========================
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Recurso não encontrado"}), 404

    @app.errorhandler(400)
    def bad_request(error):
        # útil pra payload inválido / json malformado
        return jsonify({"error": "Requisição inválida", "detail": str(error)}), 400

    @app.errorhandler(500)
    def internal_error(error):
        # rollback sempre
        try:
            db.session.rollback()
        except Exception:
            pass

        # LOG COMPLETO no terminal
        app.logger.error("ERRO 500: %s", repr(error))
        app.logger.error(traceback.format_exc())

        # Em DEBUG, devolve detalhes (pra você corrigir rápido)
        if app.debug:
            return jsonify({
                "error": "Erro interno do servidor",
                "detail": str(error),
                "trace": traceback.format_exc()
            }), 500

        # Em produção, fica genérico
        return jsonify({"error": "Erro interno do servidor"}), 500

    app.logger.info("Aplicação iniciada com sucesso!")
    return app
