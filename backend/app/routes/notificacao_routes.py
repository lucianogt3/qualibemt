from flask import Blueprint, request, jsonify
from app import db
from app.models.notificacao import Notificacao
from app.services.protocolo_service import gerar_novo_protocolo
from datetime import datetime, timedelta

bp = Blueprint('notificacoes', __name__, url_prefix='/api/notificacoes')

# 1. LISTAR TODAS (Corrige o erro de carregamento na Triagem)
@bp.route('/todas', methods=['GET'])
def listar_todas():
    try:
        # Busca e ordena, garantindo que o to_dict() funcione
        notificacoes = Notificacao.query.order_by(Notificacao.criado_em.desc()).all()
        return jsonify([n.to_dict() for n in notificacoes]), 200
    except Exception as e:
        # Se houver erro de coluna faltando no banco, o erro aparecerá aqui
        return jsonify({"error": f"Erro no banco: {str(e)}"}), 500

# 2. REGISTRAR NOVA NOTIFICAÇÃO
@bp.route('/registrar', methods=['POST'])
def registrar_notificacao():
    # Agora usamos request.form para textos e request.files para arquivos
    data = request.form 
    try:
        novo_protocolo = gerar_novo_protocolo(data.get('origem'))
        
        # Lógica para salvar o arquivo se ele existir
        foto_nome = None
        if 'foto' in request.files:
            file = request.files['foto']
            if file.filename != '':
                # Aqui você pode salvar o arquivo em uma pasta 'uploads'
                foto_nome = f"{novo_protocolo}_{file.filename}"
                file.save(f"app/static/uploads/{foto_nome}")

        nova_notificacao = Notificacao(
            protocolo=novo_protocolo,
            origem=data.get('origem'),
            titulo_ocorrencia=data.get('titulo_ocorrencia'),
            unidade_notificante=data.get('unidade_notificante'),
            unidade_notificada=data.get('unidade_notificada'),
            turno=data.get('turno'),
            # No form, booleanos vêm como string 'true' ou 'false'
            envolveu_paciente=data.get('envolveu_paciente') == 'true',
            nome_paciente=data.get('nome_paciente'),
            prontuario=data.get('prontuario'),
            data_nascimento_paciente=datetime.strptime(data.get('data_nascimento_paciente'), '%Y-%m-%d').date() if data.get('data_nascimento_paciente') else None,
            descricao=data.get('descricao'),
            foto_path=foto_nome, # Salva o nome do arquivo no banco
            status='PENDENTE'
        )
        
        db.session.add(nova_notificacao)
        db.session.commit()
        return jsonify({"message": "Sucesso!", "protocolo": novo_protocolo}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao salvar: {str(e)}") # Log para você ver no terminal
        return jsonify({"error": str(e)}), 400

# 3. ATUALIZAR STATUS COM PRAZO DINÂMICO (Regra da Qualidade)
@bp.route('/<int:id>/status', methods=['PATCH'])
def atualizar_status(id):
    data = request.get_json()
    try:
        notificacao = Notificacao.query.get_or_404(id)
        
        # Atualiza campos básicos
        if 'status' in data:
            notificacao.status = data['status']
        if 'classificacao' in data:
            notificacao.classificacao = data['classificacao']
        if 'gestor_responsavel' in data:
            notificacao.gestor_responsavel = data['gestor_responsavel']
        
        # LÓGICA DE PRAZO DINÂMICO POR GRAVIDADE
        if 'gravidade' in data:
            notificacao.gravidade = data['gravidade']
            
            # Define os dias conforme o grau
            dias = 10 # Padrão para Leve
            if data['gravidade'] == 'Moderada':
                dias = 5
            elif 'Grave' in data['gravidade'] or 'Sentinela' in data['gravidade']:
                dias = 2
            
            # O prazo conta a partir de AGORA (momento da triagem)
            notificacao.prazo_limite = datetime.utcnow() + timedelta(days=dias)
        
        db.session.commit()
        return jsonify({"message": "Tratativa atualizada!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# 4. CONSULTAR POR PROTOCOLO
@bp.route('/consultar/<string:protocolo>', methods=['GET'])
def consultar_protocolo(protocolo):
    notificacao = Notificacao.query.filter_by(protocolo=protocolo.upper()).first()
    if not notificacao:
        return jsonify({"message": "Protocolo não encontrado"}), 404
    return jsonify(notificacao.to_dict()), 200

# SETUP
@bp.route('/setup-inicial-do-banco', methods=['GET'])
def setup_inicial():
    try:
        db.create_all()
        return "✅ Tabelas sincronizadas!", 200
    except Exception as e:
        return f"❌ Erro: {str(e)}", 500