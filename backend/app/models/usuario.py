from datetime import datetime
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

    # Segurança
    primeiro_acesso = db.Column(db.Boolean, default=True)
    tentativas_login = db.Column(db.Integer, default=0)

    # ✅ NOVOS CAMPOS
    bloqueado_ate = db.Column(db.DateTime, nullable=True)            # bloqueio após tentativas
    senha_atualizada_em = db.Column(db.DateTime, nullable=True)      # expiração 90 dias
    aceitou_termos = db.Column(db.Boolean, default=False)            # termo de uso + confidencialidade
    aceitou_termos_em = db.Column(db.DateTime, nullable=True)

    # Relacionamento
    setores = db.relationship('Setor', secondary=usuarios_setores, back_populates='gestores')

    def set_senha(self, senha: str):
        self.senha_hash = generate_password_hash(senha)
        self.senha_atualizada_em = datetime.utcnow()

    def check_senha(self, senha: str) -> bool:
        return check_password_hash(self.senha_hash, senha)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "perfil": self.perfil,
            "ativo": self.ativo,
            "primeiro_acesso": self.primeiro_acesso,
            "tentativas_login": self.tentativas_login,
            "bloqueado_ate": self.bloqueado_ate.isoformat() if self.bloqueado_ate else None,
            "senha_atualizada_em": self.senha_atualizada_em.isoformat() if self.senha_atualizada_em else None,
            "aceitou_termos": self.aceitou_termos,
            "aceitou_termos_em": self.aceitou_termos_em.isoformat() if self.aceitou_termos_em else None,
            "setores": [s.nome for s in self.setores]
        }
