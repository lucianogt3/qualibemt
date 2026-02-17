from flask import Blueprint, request, jsonify
from app import db
from app.models.usuario import Usuario
from app.models.configuracao import Setor

bp = Blueprint('auth', __name__) 

# ==========================================
# 🚀 NOVA ROTA: LOGIN (ESSENCIAL PARA O REACT)
# ==========================================
@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    senha = data.get('senha')

    # Busca o usuário pelo e-mail
    usuario = Usuario.query.filter_by(email=email).first()

    # Verifica se usuário existe e a senha bate
    # Nota: Se estiver usando o set_senha com hash, use usuario.check_senha(senha)
    if usuario and (usuario.senha == senha or usuario.check_senha(senha)):
        if not usuario.ativo:
            return jsonify({"error": "Usuário inativo. Procure o administrador."}), 403
            
        return jsonify({
            "message": "Login realizado com sucesso",
            "token": "sessao_ativa_valida", # Aqui você pode implementar JWT no futuro
            "usuario": {
                "id": usuario.id,
                "nome": usuario.nome,
                "email": usuario.email,
                "perfil": usuario.perfil, # 'Gestor', 'Qualidade' ou 'Admin'
                "setores": [s.nome for s in usuario.setores]
            }
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
# 2. CADASTRAR NOVO USUÁRIO (N:N) 👤🏢
# ==========================================
@bp.route('/usuarios', methods=['POST'])
def registrar():
    data = request.get_json()
    
    if Usuario.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Este e-mail já está cadastrado no sistema.'}), 400
        
    novo_usuario = Usuario(
        nome=data['nome'],
        email=data['email'],
        perfil=data.get('perfil', 'Gestor')
    )
    
    ids_setores = data.get('setores_ids', [])
    if ids_setores:
        setores_selecionados = Setor.query.filter(Setor.id.in_(ids_setores)).all()
        novo_usuario.setores = setores_selecionados
    
    # Define a senha enviada ou a padrão
    senha = data.get('senha', '123456')
    if hasattr(novo_usuario, 'set_senha'):
        novo_usuario.set_senha(senha)
    else:
        novo_usuario.senha = senha # Fallback se não tiver o método de hash
    
    try:
        db.session.add(novo_usuario)
        db.session.commit()
        return jsonify({'message': 'Operador criado com sucesso!'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Falha ao salvar no banco de dados."}), 500

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