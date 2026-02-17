from app import db

class ItemFormulario(db.Model):
    __tablename__ = 'itens_formulario'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    categoria = db.Column(db.String(50), default='Assistencial')
    ativo = db.Column(db.Boolean, default=True)

class Setor(db.Model):
    __tablename__ = 'setores'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False, unique=True)
    sigla = db.Column(db.String(10), nullable=True) # ✨ Campo recuperado de setor.py
    ativo = db.Column(db.Boolean, default=True)

    # 🔄 Relacionamento Muitos-para-Muitos com Usuario
    gestores = db.relationship(
        'Usuario', 
        secondary='usuarios_setores', 
        back_populates='setores'
    )

    def __repr__(self):
        return f'<Setor {self.nome}>'