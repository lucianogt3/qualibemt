import os
import json
import traceback
from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename

from app import db
from app.models.notificacao import Notificacao
from app.models.plano_acao import PlanoAcao
from app.models.ishikawa import Ishikawa  # ajuste se o caminho do model for diferente
from app.services.protocolo_service import gerar_novo_protocolo

bp = Blueprint('notificacoes', __name__, url_prefix='/api/notificacoes')


# ==========================================
# 1. LISTAR TODAS AS NOTIFICAÇÕES
# ==========================================
@bp.route('/todas', methods=['GET'])
def listar_todas():
    try:
        notificacoes = Notificacao.query.order_by(Notificacao.criado_em.desc()).all()
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
            if file and file.filename:
                foto_nome = f"{novo_protocolo}_{secure_filename(file.filename)}"
                os.makedirs("app/static/uploads", exist_ok=True)
                file.save(os.path.join("app/static/uploads", foto_nome))

        nova_notificacao = Notificacao(
            protocolo=novo_protocolo,
            origem=data.get('origem'),
            titulo_ocorrencia=data.get('titulo_ocorrencia'),
            unidade_notificante=data.get('unidade_notificante'),
            unidade_notificada=data.get('unidade_notificada'),
            turno=data.get('turno'),
            envolveu_paciente=(data.get('envolveu_paciente') == 'true'),
            nome_paciente=data.get('nome_paciente'),
            prontuario=data.get('prontuario'),
            data_nascimento_paciente=datetime.strptime(
                data.get('data_nascimento_paciente'), '%Y-%m-%d'
            ).date() if data.get('data_nascimento_paciente') else None,
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
def realizar_triagem(id):
    data = request.get_json(silent=True) or {}
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
            elif ('Grave' in data['gravidade']) or ('Sentinela' in data['gravidade']):
                dias = 2
            notificacao.prazo_limite = datetime.utcnow() + timedelta(days=dias)

        db.session.commit()
        return jsonify({"message": "Triagem salva. Notificação encaminhada ao Gestor!"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# ==========================================
# 4. GET/POST PLANO DE AÇÃO 5W2H (Gestor)
# ==========================================

@bp.route('/<int:id>/plano', methods=['GET'])
def obter_plano_gestor(id):
    notificacao = Notificacao.query.get_or_404(id)

    plano = PlanoAcao.query.filter_by(notificacao_id=id).first()
    ishikawa = getattr(notificacao, "ishikawa", None)

    # evidencia_path pode ou não existir no model
    evidencia_path = getattr(notificacao, "evidencia_path", None)

    return jsonify({
        "notificacao_id": id,
        "status": notificacao.status,
        "plano": plano.to_dict() if plano and hasattr(plano, "to_dict") else (plano.__dict__ if plano else None),
        "ishikawa": ishikawa.to_dict() if ishikawa and hasattr(ishikawa, "to_dict") else (ishikawa.__dict__ if ishikawa else None),
        "evidencia_path": evidencia_path
    }), 200


@bp.route('/<int:id>/plano', methods=['POST'])
def salvar_plano_gestor(id):
    try:
        notificacao = Notificacao.query.get_or_404(id)

        json_body = request.get_json(silent=True)

        plano_data = {}
        ishikawa_data = {}
        arquivo = None

        if json_body:
            plano_data = json_body.get("plano") or {}
            ishikawa_data = json_body.get("ishikawa") or {}
        else:
            plano_json = request.form.get('plano', '{}')
            ishikawa_json = request.form.get('ishikawa', '{}')
            arquivo = request.files.get('evidencia')

            try:
                plano_data = json.loads(plano_json) if plano_json else {}
            except Exception:
                plano_data = {}

            try:
                ishikawa_data = json.loads(ishikawa_json) if ishikawa_json else {}
            except Exception:
                ishikawa_data = {}

        # =====================================
        # 🔒 VALIDAÇÃO OBRIGATÓRIA 5W2H
        # =====================================
        required_fields = ["o_que", "por_que", "quem", "quando", "como", "onde"]

        missing = []
        for field in required_fields:
            value = plano_data.get(field)
            if not value or str(value).strip() == "":
                missing.append(field)

        if missing:
            return jsonify({
                "error": "Campos obrigatórios do 5W2H não preenchidos",
                "missing_fields": missing
            }), 400
        # =====================================

        # 1️⃣ Salvar evidência
        if arquivo and arquivo.filename:
            filename = secure_filename(arquivo.filename)
            timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
            unique_filename = f"{id}_{timestamp}_{filename}"

            upload_folder = os.path.join(current_app.root_path, 'uploads', 'evidencias')
            os.makedirs(upload_folder, exist_ok=True)

            filepath = os.path.join(upload_folder, unique_filename)
            arquivo.save(filepath)

            if hasattr(notificacao, "evidencia_path"):
                notificacao.evidencia_path = f"/uploads/evidencias/{unique_filename}"

        # 2️⃣ Salvar PlanoAcao
        plano_acao = PlanoAcao.query.filter_by(notificacao_id=id).first()

        if plano_acao:
            for key, value in plano_data.items():
                if hasattr(plano_acao, key):
                    setattr(plano_acao, key, value)
        else:
            valid = {k: v for k, v in plano_data.items() if hasattr(PlanoAcao, k)}
            plano_acao = PlanoAcao(notificacao_id=id, **valid)
            db.session.add(plano_acao)

        # 3️⃣ Ishikawa (opcional)
        if isinstance(ishikawa_data, dict) and ishikawa_data:
            if getattr(notificacao, "ishikawa", None):
                ishikawa_obj = notificacao.ishikawa
                for key, value in ishikawa_data.items():
                    if hasattr(ishikawa_obj, key):
                        setattr(ishikawa_obj, key, value)
            else:
                valid_i = {k: v for k, v in ishikawa_data.items() if hasattr(Ishikawa, k)}
                ishikawa_obj = Ishikawa(notificacao_id=id, **valid_i)
                db.session.add(ishikawa_obj)

        # 4️⃣ Atualiza status
        notificacao.status = 'CONCLUIDO'
        if hasattr(notificacao, "data_atualizacao"):
            notificacao.data_atualizacao = datetime.utcnow()

        db.session.commit()
        return jsonify({"message": "Plano salvo com sucesso!"}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error("ERRO salvar_plano_gestor: %s", repr(e))
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            "error": "Erro ao salvar",
            "detail": str(e)
        }), 500

# ==========================================
# 5. CONSULTAR PROTOCOLO
# ==========================================
@bp.route('/consultar/<string:protocolo>', methods=['GET'])
def consultar_protocolo(protocolo):
    notificacao = Notificacao.query.filter_by(protocolo=protocolo.upper()).first()
    if not notificacao:
        return jsonify({"message": "Protocolo não encontrado"}), 404
    return jsonify(notificacao.to_dict()), 200
