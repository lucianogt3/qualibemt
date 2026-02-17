from app import db

class Setor(db.Model):
    __tablename__ = 'setores'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), unique=True, nullable=False)
    sigla = db.Column(db.String(10), nullable=True)
    ativo = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f'<Setor {self.nome}>'