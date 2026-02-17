from flask import Blueprint, request, jsonify
from app import db
from app.models.configuracao import Setor

bp = Blueprint('setores', __name__, url_prefix='/api/setores')

# 1. LISTAR SETORES (Usado tanto pelo ADM quanto pelo Formulário)
@bp.route('', methods=['GET'])
def listar_setores():
    # Se o formulário pedir apenas 'ativos', filtramos. 
    # Se não, o ADM vê todos (para poder reativar algum)
    status = request.args.get('status')
    
    if status == 'ativos':
        setores = Setor.query.filter_by(ativo=True).order_by(Setor.nome).all()
    else:
        setores = Setor.query.order_by(Setor.nome).all()
        
    return jsonify([{
        'id': s.id,
        'nome': s.nome,
        'sigla': s.sigla,
        'ativo': s.ativo
    } for s in setores]), 200

# 2. CADASTRAR NOVO SETOR (Pelo Painel ADM)
@bp.route('', methods=['POST'])
def criar_setor():
    data = request.get_json()
    
    if not data or not data.get('nome'):
        return jsonify({'error': 'Nome do setor é obrigatório'}), 400
        
    novo_setor = Setor(
        nome=data['nome'],
        sigla=data.get('sigla', data['nome'][:3].upper()),
        ativo=True
    )
    
    db.session.add(novo_setor)
    db.session.commit()
    return jsonify({'message': 'Setor cadastrado com sucesso!'}), 201

# 3. EDITAR OU INATIVAR (A mágica para não usar o VS Code)
@bp.route('/<int:id>', methods=['PUT'])
def editar_setor(id):
    setor = Setor.query.get_or_404(id)
    data = request.get_json()
    
    if 'nome' in data: setor.nome = data['nome']
    if 'sigla' in data: setor.sigla = data['sigla']
    if 'ativo' in data: setor.ativo = data['ativo'] # Aqui o ADM desativa o setor
    
    db.session.commit()
    return jsonify({'message': 'Setor atualizado!'}), 200