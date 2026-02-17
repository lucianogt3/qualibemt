from flask import Blueprint, request, jsonify
from app import db
from app.models.configuracao import ItemFormulario, Setor

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/config/itens', methods=['GET', 'POST'])
def gerenciar_itens():
    if request.method == 'POST':
        try:
            dados = request.json
            # Flexibilidade: aceita 'titulo' ou 'nome'
            texto = dados.get('titulo') or dados.get('nome')
            
            if not texto:
                return jsonify({"error": "Texto é obrigatório"}), 400

            novo = ItemFormulario(
                titulo=texto, 
                categoria=dados.get('categoria', 'Assistencial'),
                ativo=True
            )
            db.session.add(novo)
            db.session.commit()
            return jsonify({"message": "Salvo com sucesso"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    itens = ItemFormulario.query.all()
    return jsonify([{"id": i.id, "titulo": i.titulo, "categoria": i.categoria, "ativo": i.ativo} for i in itens])

@admin_bp.route('/setores', methods=['GET', 'POST'])
def gerenciar_setores():
    if request.method == 'POST':
        try:
            dados = request.json
            novo = Setor(nome=dados.get('nome'), ativo=True)
            db.session.add(novo)
            db.session.commit()
            return jsonify({"message": "Setor criado"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    setores = Setor.query.all()
    return jsonify([{"id": s.id, "nome": s.nome, "ativo": s.ativo} for s in setores])