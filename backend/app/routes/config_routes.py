from flask import Blueprint, request, jsonify
from app.models.configuracao import ItemFormulario
from app import db

bp = Blueprint('config', __name__, url_prefix='/api/config')

@bp.route('/itens', methods=['GET'])
def listar_itens():
    itens = ItemFormulario.query.filter_by(ativo=True).all()
    return jsonify([i.to_dict() for i in itens]), 200

@bp.route('/itens', methods=['POST'])
def cadastrar_item():
    dados = request.json
    novo_item = ItemFormulario(nome=dados['nome'], categoria=dados['categoria'])
    db.session.add(novo_item)
    db.session.commit()
    return jsonify(novo_item.to_dict()), 201