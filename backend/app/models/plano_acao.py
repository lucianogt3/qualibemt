from app import db
from datetime import datetime

class PlanoAcao(db.Model):
    __tablename__ = 'planos_acao'

    id = db.Column(db.Integer, primary_key=True)
    notificacao_id = db.Column(db.Integer, db.ForeignKey('notificacoes.id'), nullable=False)
    
    # Estrutura 5W2H
    o_que = db.Column(db.Text, nullable=False)    # What
    por_que = db.Column(db.Text)                 # Why
    onde = db.Column(db.String(100))             # Where
    quem = db.Column(db.String(100))             # Who
    quando = db.Column(db.Date)                  # When
    como = db.Column(db.Text)                    # How
    quanto = db.Column(db.String(50))            # How Much

    status = db.Column(db.String(20), default='Em Aberto') # Concluído, Em Atraso
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "o_que": self.o_que,
            "quem": self.quem,
            "quando": self.quando.isoformat() if self.quando else None,
            "status": self.status
        }