from flask import Blueprint, request, jsonify
from app import db
from app.models.usuario import Usuario
from app.models.configuracao import Setor
from flask_jwt_extended import create_access_token

bp = Blueprint('auth', __name__)

# ==========================================
# 🚀 ROTA DE LOGIN
# ==========================================
@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    senha = data.get('senha') or data.get('password')

    if not email or not senha:
        return jsonify({"error": "Informe e-mail e senha."}), 400

    usuario = Usuario.query.filter_by(email=email).first()

    if usuario and usuario.check_senha(senha):
        if not usuario.ativo:
            return jsonify({"error": "Usuário inativo. Procure o administrador."}), 403

        usuario.tentativas_login = 0
        db.session.commit()

        token = create_access_token(identity=str(usuario.id))

        return jsonify({
            "token": token,
            "usuario": usuario.to_dict(),
            "primeiro_acesso": bool(usuario.primeiro_acesso)
        }), 200

    if usuario:
        usuario.tentativas_login += 1
        db.session.commit()

    return jsonify({"error": "E-mail ou senha inválidos"}), 401


# ==========================================
# 🔐 ROTA PARA RESET DE 1º ACESSO (USUÁRIO)
# ==========================================
@bp.route('/reset-primeiro-acesso', methods=['POST'])
def reset_primeiro_acesso():
    data = request.get_json() or {}
    usuario_id = data.get('usuario_id')
    nova_senha = data.get('nova_senha')

    if not usuario_id or not nova_senha:
        return jsonify({"error": "usuario_id e nova_senha são obrigatórios."}), 400

    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"error": "Usuário não encontrado"}), 404

    usuario.set_senha(nova_senha)
    usuario.primeiro_acesso = False
    usuario.tentativas_login = 0

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Erro ao salvar nova senha."}), 500

    # ✅ Gera token novo após troca de senha
    token = create_access_token(identity=str(usuario.id))

    return jsonify({
        "message": "Senha atualizada com sucesso!",
        "token": token,
        "usuario": usuario.to_dict()
    }), 200


# ==========================================
# 🔄 RESET DE SENHA PELO ADM (PAINEL QUALIDADE)
# ==========================================
@bp.route('/usuarios/<int:id>/reset-senha', methods=['POST'])
def admin_reset_senha(id):
    usuario = Usuario.query.get_or_404(id)

    senha_padrao = "123456"
    usuario.set_senha(senha_padrao)
    usuario.primeiro_acesso = True
    usuario.tentativas_login = 0

    try:
        db.session.commit()
        return jsonify({
            "message": f"Senha de {usuario.nome} resetada para '{senha_padrao}'. Troca obrigatória no próximo acesso."
        }), 200
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Erro ao resetar no banco."}), 500


# ==========================================
# 1. LISTAR USUÁRIOS 📋
# ==========================================
@bp.route('/usuarios', methods=['GET'])
def listar_usuarios():
    try:
        usuarios = Usuario.query.all()
        return jsonify([u.to_dict() for u in usuarios]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==========================================
# 2. CADASTRAR NOVO USUÁRIO 👤
# ==========================================
@bp.route('/usuarios', methods=['POST'])
def registrar():
    data = request.get_json() or {}

    if not data.get('email') or not data.get('nome'):
        return jsonify({'error': 'nome e email são obrigatórios.'}), 400

    if Usuario.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Este e-mail já está cadastrado.'}), 400

    novo_usuario = Usuario(
        nome=data['nome'],
        email=data['email'],
        perfil=data.get('perfil', 'Gestor'),
        primeiro_acesso=True
    )

    ids_setores = data.get('setores_ids', [])
    if ids_setores:
        setores_selecionados = Setor.query.filter(Setor.id.in_(ids_setores)).all()
        novo_usuario.setores = setores_selecionados

    senha_inicial = data.get('senha', '123456')
    novo_usuario.set_senha(senha_inicial)

    try:
        db.session.add(novo_usuario)
        db.session.commit()
        return jsonify({'message': 'Usuário criado com sucesso!'}), 201
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Erro ao salvar."}), 500


# ==========================================
# 3. ALTERAR STATUS (ATIVO/INATIVO) 🟢⚪
# ==========================================
@bp.route('/usuarios/<int:id>/toggle', methods=['PATCH'])
def toggle_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    usuario.ativo = not usuario.ativo
    db.session.commit()
    return jsonify({
        'message': f'Usuário {"ativado" if usuario.ativo else "inativado"}!',
        'ativo': usuario.ativo
    }), 200
