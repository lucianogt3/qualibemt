from flask import Blueprint, request, jsonify
from app import db
from app.models.usuario import Usuario
from app.models.configuracao import Setor

bp = Blueprint('auth', __name__) 

# ==========================================
# 🚀 ROTA DE LOGIN (CORRIGIDA)
# ==========================================
@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    senha = data.get('senha')

    usuario = Usuario.query.filter_by(email=email).first()

    # Usamos o método check_senha que você definiu no Model
    if usuario and usuario.check_senha(senha):
        if not usuario.ativo:
            return jsonify({"error": "Usuário inativo. Procure o administrador."}), 403
            
        return jsonify({
            "token": "sessao_ativa_valida", 
            "usuario": usuario.to_dict() # Usamos seu to_dict() que já traz os setores!
        }), 200
    
    return jsonify({"error": "E-mail ou senha inválidos"}), 401

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
# 2. CADASTRAR NOVO USUÁRIO 👤🏢
# ==========================================
@bp.route('/usuarios', methods=['POST'])
def registrar():
    data = request.get_json()
    
    if Usuario.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Este e-mail já está cadastrado.'}), 400
        
    novo_usuario = Usuario(
        nome=data['nome'],
        email=data['email'],
        perfil=data.get('perfil', 'Gestor')
    )
    
    # Adiciona os setores se enviados
    ids_setores = data.get('setores_ids', [])
    if ids_setores:
        setores_selecionados = Setor.query.filter(Setor.id.in_(ids_setores)).all()
        novo_usuario.setores = setores_selecionados
    
    # Usa o set_senha do seu Model para gerar o hash
    senha = data.get('senha', '123456')
    novo_usuario.set_senha(senha)
    
    try:
        db.session.add(novo_usuario)
        db.session.commit()
        return jsonify({'message': 'Usuário criado com sucesso!'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Falha ao salvar no banco."}), 500

# ==========================================
# 3. ALTERAR STATUS 🟢⚪
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