from app import db
from werkzeug.security import generate_password_hash, check_password_hash

usuarios_setores = db.Table(
    'usuarios_setores',
    db.Column('usuario_id', db.Integer, db.ForeignKey('usuarios.id'), primary_key=True),
    db.Column('setor_id', db.Integer, db.ForeignKey('setores.id'), primary_key=True),
    extend_existing=True
)

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha_hash = db.Column(db.String(255), nullable=False)
    perfil = db.Column(db.String(20), default='Gestor')
    ativo = db.Column(db.Boolean, default=True)

    primeiro_acesso = db.Column(db.Boolean, default=True)
    tentativas_login = db.Column(db.Integer, default=0)

    setores = db.relationship(
        'Setor',
        secondary=usuarios_setores,
        back_populates='gestores'
    )

    def set_senha(self, senha: str):
        self.senha_hash = generate_password_hash(senha)

    def check_senha(self, senha: str) -> bool:
        return check_password_hash(self.senha_hash, senha)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "perfil": self.perfil,
            "ativo": bool(self.ativo),
            "primeiro_acesso": bool(self.primeiro_acesso),
            "setores": [s.nome for s in self.setores]
        }
