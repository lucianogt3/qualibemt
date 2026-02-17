from flask import Blueprint, request, jsonify
from app import db
from app.models.notificacao import Notificacao
from app.models.plano_acao import PlanoAcao
from app.services.protocolo_service import gerar_novo_protocolo
from datetime import datetime, timedelta

bp = Blueprint('notificacoes', __name__, url_prefix='/api/notificacoes')

# ==========================================
# 1. LISTAR TODAS AS NOTIFICAÇÕES
# ==========================================
@bp.route('/todas', methods=['GET'])
def listar_todas():
    try:
        # Busca todas as notificações ordenadas pela data de criação (mais recentes primeiro)
        notificacoes = Notificacao.query.order_by(Notificacao.criado_em.desc()).all()
        # Certifique-se que o to_dict() no Model Notificacao inclua os campos do paciente
        return jsonify([n.to_dict() for n in notificacoes]), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao listar: {str(e)}"}), 500

# ==========================================
# 2. REGISTRAR NOVA NOTIFICAÇÃO (Público)
# ==========================================
@bp.route('/registrar', methods=['POST'])
def registrar_notificacao():
    data = request.form 
    try:
        novo_protocolo = gerar_novo_protocolo(data.get('origem'))
        
        foto_nome = None
        if 'foto' in request.files:
            file = request.files['foto']
            if file.filename != '':
                foto_nome = f"{novo_protocolo}_{file.filename}"
                file.save(f"app/static/uploads/{foto_nome}")

        nova_notificacao = Notificacao(
            protocolo=novo_protocolo,
            origem=data.get('origem'),
            titulo_ocorrencia=data.get('titulo_ocorrencia'),
            unidade_notificante=data.get('unidade_notificante'),
            unidade_notificada=data.get('unidade_notificada'),
            turno=data.get('turno'),
            envolveu_paciente=data.get('envolveu_paciente') == 'true',
            nome_paciente=data.get('nome_paciente'),
            prontuario=data.get('prontuario'),
            data_nascimento_paciente=datetime.strptime(data.get('data_nascimento_paciente'), '%Y-%m-%d').date() if data.get('data_nascimento_paciente') else None,
            descricao=data.get('descricao'),
            foto_path=foto_nome,
            status='PENDENTE'
        )
        
        db.session.add(nova_notificacao)
        db.session.commit()
        return jsonify({"message": "Notificação registrada!", "protocolo": novo_protocolo}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ==========================================
# 3. TRIAGEM E CLASSIFICAÇÃO (Qualidade)
# ==========================================
@bp.route('/<int:id>/status', methods=['PATCH'])
def realizar_triagem(id): # Nome alterado para evitar conflito
    data = request.get_json()
    try:
        notificacao = Notificacao.query.get_or_404(id)
        
        if 'status' in data:
            notificacao.status = data['status']
        if 'classificacao' in data:
            notificacao.classificacao = data['classificacao']
        if 'gestor_responsavel' in data:
            notificacao.gestor_responsavel = data['gestor_responsavel']
        
        # Lógica de Prazo por Gravidade
        if 'gravidade' in data:
            notificacao.gravidade = data['gravidade']
            dias = 10
            if data['gravidade'] == 'Moderada':
                dias = 5
            elif 'Grave' in data['gravidade'] or 'Sentinela' in data['gravidade']:
                dias = 2
            notificacao.prazo_limite = datetime.utcnow() + timedelta(days=dias)
        
        db.session.commit()
        return jsonify({"message": "Triagem salva. Notificação encaminhada ao Gestor!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ==========================================
# 4. SALVAR PLANO DE AÇÃO 5W2H (Gestor)
# ==========================================
def salvar_plano_gestor(id):import os
import json
from datetime import datetime
from flask import request, jsonify, current_app
from werkzeug.utils import secure_filename
from app import db
from app.models.notificacao import Notificacao
from app.models.plano_acao import PlanoAcao
from app.models.ishikawa import Ishikawa  # se aplicável

@bp.route('/<int:id>/plano', methods=['POST'])
def salvar_plano_gestor(id):
    notificacao = Notificacao.query.get_or_404(id)

    # Extrai os campos do formulário
    plano_json = request.form.get('plano', '{}')
    ishikawa_json = request.form.get('ishikawa', '{}')
    arquivo = request.files.get('evidencia')

    # Processa o arquivo, se enviado
    if arquivo and arquivo.filename:
        try:
            filename = secure_filename(arquivo.filename)
            timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
            unique_filename = f"{id}_{timestamp}_{filename}"

            upload_folder = os.path.join(current_app.root_path, 'uploads', 'evidencias')
            os.makedirs(upload_folder, exist_ok=True)

            filepath = os.path.join(upload_folder, unique_filename)
            arquivo.save(filepath)

            # Salva o caminho relativo no banco (campo evidencia_path)
            notificacao.evidencia_path = f"/uploads/evidencias/{unique_filename}"
        except Exception as e:
            return jsonify({"error": f"Falha ao salvar arquivo: {str(e)}"}), 500

    # Processa os JSONs (plano e ishikawa) que vêm como string
    try:
        plano_data = json.loads(plano_json)
    except json.JSONDecodeError:
        plano_data = {}

    try:
        ishikawa_data = json.loads(ishikawa_json)
    except json.JSONDecodeError:
        ishikawa_data = {}

    # Salva o plano 5W2H
    if plano_data:
        try:
            # Verifica se já existe um plano para esta notificação
            plano_acao = PlanoAcao.query.filter_by(notificacao_id=id).first()
            if plano_acao:
                # Atualiza
                for key, value in plano_data.items():
                    if hasattr(plano_acao, key):
                        setattr(plano_acao, key, value)
            else:
                # Cria novo
                plano_acao = PlanoAcao(notificacao_id=id, **plano_data)
                db.session.add(plano_acao)
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Erro ao salvar plano: {str(e)}"}), 500

    # Se houver análise Ishikawa, salva (opcional)
    if ishikawa_data:
        try:
            if notificacao.ishikawa:
                ishikawa_obj = notificacao.ishikawa
                for key, value in ishikawa_data.items():
                    if hasattr(ishikawa_obj, key):
                        setattr(ishikawa_obj, key, value)
            else:
                ishikawa_obj = Ishikawa(notificacao_id=id, **ishikawa_data)
                db.session.add(ishikawa_obj)
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Erro ao salvar Ishikawa: {str(e)}"}), 500

    # Atualiza o status da notificação (ex: "CONCLUIDO")
    notificacao.status = 'CONCLUIDO'
    notificacao.data_atualizacao = datetime.utcnow()

    try:
        db.session.commit()
        return jsonify({"message": "Plano salvo com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao salvar: {str(e)}"}), 500

# ==========================================
# 5. CONSULTAR PROTOCOLO
# ==========================================
@bp.route('/consultar/<string:protocolo>', methods=['GET'])
def consultar_protocolo(protocolo):
    notificacao = Notificacao.query.filter_by(protocolo=protocolo.upper()).first()
    if not notificacao:
        return jsonify({"message": "Protocolo não encontrado"}), 404
    return jsonify(notificacao.to_dict()), 200