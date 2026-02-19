from datetime import datetime, timedelta
import re

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token

from app import db
from app.models.usuario import Usuario
from app.models.configuracao import Setor  # se você usa isso aqui

bp = Blueprint('auth', __name__)

# ====== Configs de Segurança ======
MAX_TENTATIVAS = 5
BLOQUEIO_MINUTOS = 15
EXPIRA_SENHA_DIAS = 90

SENHA_FORTE_REGEX = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$'

def senha_forte(s: str) -> bool:
    return bool(re.match(SENHA_FORTE_REGEX, s or ""))

def senha_expirada(usuario: Usuario) -> bool:
    if not usuario.senha_atualizada_em:
        return True
    return datetime.utcnow() - usuario.senha_atualizada_em > timedelta(days=EXPIRA_SENHA_DIAS)

def usuario_bloqueado(usuario: Usuario) -> bool:
    return bool(usuario.bloqueado_ate and usuario.bloqueado_ate > datetime.utcnow())

# ==========================================
# 🚀 LOGIN
# ==========================================
@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    senha = data.get('senha') or data.get('password') or ''

    usuario = Usuario.query.filter_by(email=email).first()

    # Não revela se existe ou não (boa prática). Mas você pode manter como está.
    if not usuario:
        return jsonify({"error": "E-mail ou senha inválidos"}), 401

    if not usuario.ativo:
        return jsonify({"error": "Usuário inativo. Procure o administrador."}), 403

    if usuario_bloqueado(usuario):
        minutos = int((usuario.bloqueado_ate - datetime.utcnow()).total_seconds() // 60) + 1
        return jsonify({"error": f"Usuário bloqueado por tentativas. Tente novamente em {minutos} min."}), 423

    if not usuario.check_senha(senha):
        usuario.tentativas_login = (usuario.tentativas_login or 0) + 1

        if usuario.tentativas_login >= MAX_TENTATIVAS:
            usuario.bloqueado_ate = datetime.utcnow() + timedelta(minutes=BLOQUEIO_MINUTOS)

        db.session.commit()
        return jsonify({"error": "E-mail ou senha inválidos"}), 401

    # ✅ Login ok: zera tentativas e bloqueio
    usuario.tentativas_login = 0
    usuario.bloqueado_ate = None
    db.session.commit()

    # ✅ Verifica ações obrigatórias
    acoes = []

    # primeiro acesso sempre exige: trocar senha + aceitar termos
    if usuario.primeiro_acesso:
        acoes.append("TROCAR_SENHA")
        acoes.append("ACEITAR_TERMOS")
    else:
        # senha expirada
        if senha_expirada(usuario):
            acoes.append("TROCAR_SENHA")

        # termos não aceitos
        if not usuario.aceitou_termos:
            acoes.append("ACEITAR_TERMOS")

    # 🔒 Se há ações obrigatórias, não devolve token ainda
    if acoes:
        return jsonify({
            "requires_action": True,
            "acoes": acoes,
            "usuario_id": usuario.id,
            "usuario": usuario.to_dict()
        }), 200

    # ✅ Tudo ok: devolve token
    token = create_access_token(identity=usuario.id)
    return jsonify({
        "requires_action": False,
        "token": token,
        "usuario": usuario.to_dict()
    }), 200

# ==========================================
# ✅ FINALIZAR PRIMEIRO ACESSO / EXIGÊNCIAS
# (troca senha + aceite termos)
# ==========================================
@bp.route('/finalizar-acesso', methods=['POST'])
def finalizar_acesso():
    data = request.get_json() or {}
    usuario_id = data.get('usuario_id')
    nova_senha = data.get('nova_senha')
    aceitou_termos = bool(data.get('aceitou_termos'))

    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"error": "Usuário não encontrado"}), 404

    if not usuario.ativo:
        return jsonify({"error": "Usuário inativo. Procure o administrador."}), 403

    # Se precisa trocar senha (primeiro acesso ou expirada)
    precisa_trocar = usuario.primeiro_acesso or senha_expirada(usuario)

    if precisa_trocar:
        if not senha_forte(nova_senha):
            return jsonify({
                "error": "Senha fraca. Use mínimo 8 caracteres com MAIÚSCULA, minúscula, número e símbolo."
            }), 400
        usuario.set_senha(nova_senha)
        usuario.primeiro_acesso = False

    # Se ainda não aceitou termos, exige aceite
    if (not usuario.aceitou_termos) and (not aceitou_termos):
        return jsonify({"error": "É obrigatório aceitar os termos e confidencialidade para acessar."}), 400

    if aceitou_termos:
        usuario.aceitou_termos = True
        usuario.aceitou_termos_em = datetime.utcnow()

    usuario.tentativas_login = 0
    usuario.bloqueado_ate = None

    db.session.commit()

    # Agora sim libera token
    token = create_access_token(identity=usuario.id)
    return jsonify({
        "message": "Acesso liberado com sucesso.",
        "token": token,
        "usuario": usuario.to_dict()
    }), 200

# ==========================================
# 🔄 RESET DE SENHA PELO ADM
# ==========================================
@bp.route('/usuarios/<int:id>/reset-senha', methods=['POST'])
def admin_reset_senha(id):
    usuario = Usuario.query.get_or_404(id)

    senha_padrao = "123456"  # você pode manter, mas é fraca — o usuário será obrigado a trocar
    usuario.set_senha(senha_padrao)

    usuario.primeiro_acesso = True
    usuario.aceitou_termos = False
    usuario.aceitou_termos_em = None
    usuario.tentativas_login = 0
    usuario.bloqueado_ate = None

    try:
        db.session.commit()
        return jsonify({
            "message": f"Senha de {usuario.nome} resetada. Troca obrigatória no próximo acesso."
        }), 200
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Erro ao resetar no banco."}), 500

# ==========================================
# LISTAR / CADASTRAR / TOGGLE (mantém os seus)
# ==========================================
@bp.route('/usuarios', methods=['GET'])
def listar_usuarios():
    usuarios = Usuario.query.all()
    return jsonify([u.to_dict() for u in usuarios]), 200

@bp.route('/usuarios', methods=['POST'])
def registrar():
    data = request.get_json() or {}

    if Usuario.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Este e-mail já está cadastrado.'}), 400

    novo_usuario = Usuario(
        nome=data.get('nome'),
        email=(data.get('email') or '').strip().lower(),
        perfil=data.get('perfil', 'Gestor'),
        primeiro_acesso=True,
        aceitou_termos=False
    )

    ids_setores = data.get('setores_ids', [])
    if ids_setores:
        setores_selecionados = Setor.query.filter(Setor.id.in_(ids_setores)).all()
        novo_usuario.setores = setores_selecionados

    # senha inicial (fraca ok, pois primeiro acesso exige troca forte)
    senha_inicial = data.get('senha', '123456')
    novo_usuario.set_senha(senha_inicial)

    db.session.add(novo_usuario)
    db.session.commit()
    return jsonify({'message': 'Usuário criado com sucesso!'}), 201

@bp.route('/usuarios/<int:id>/toggle', methods=['PATCH'])
def toggle_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    usuario.ativo = not usuario.ativo
    db.session.commit()
    return jsonify({
        'message': f'Usuário {"ativado" if usuario.ativo else "inativado"}!',
        'ativo': usuario.ativo
    }), 200
