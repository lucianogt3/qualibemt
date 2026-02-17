from flask import Blueprint, jsonify
from app.models.notificacao import Notificacao
from app.models.configuracao import Setor
from app import db
from sqlalchemy import func

bp = Blueprint('stats', __name__, url_prefix='/api/stats')

@bp.route('/geral', methods=['GET'])
def stats_geral():
    # Conta por tipo de origem (NOT, ELO, REC)
    por_tipo = db.session.query(
        Notificacao.origem, func.count(Notificacao.id)
    ).group_by(Notificacao.origem).all()

    # Conta por status (Pendente, Em Análise, Concluído)
    por_status = db.session.query(
        Notificacao.status, func.count(Notificacao.id)
    ).group_by(Notificacao.status).all()

    # Top 5 setores com mais ocorrências
    por_setor = db.session.query(
        Notificacao.unidade_notificada, func.count(Notificacao.id)
    ).group_by(Notificacao.unidade_notificada).order_by(func.count(Notificacao.id).desc()).limit(5).all()

    return jsonify({
        "tipos": dict(por_tipo),
        "status": dict(por_status),
        "top_setores": [{"setor": s[0], "total": s[1]} for s in por_setor]
    }), 200