from app import db
from datetime import datetime

class Ishikawa(db.Model):
    __tablename__ = 'analises_ishikawa'

    id = db.Column(db.Integer, primary_key=True)
    notificacao_id = db.Column(db.Integer, db.ForeignKey('notificacoes.id'), nullable=False)
    
    # Os 6Ms do Diagrama de Espinha de Peixe
    metodo = db.Column(db.Text)       # Falha no processo ou protocolo?
    mao_de_obra = db.Column(db.Text)  # Falha humana ou falta de treinamento?
    maquina = db.Column(db.Text)      # Problema com equipamento?
    material = db.Column(db.Text)     # Insumo ou medicamento com defeito?
    meio_ambiente = db.Column(db.Text)# Infraestrutura, barulho, iluminação?
    medida = db.Column(db.Text)       # Erro de indicador ou dosagem?

    conclusao = db.Column(db.Text)    # Parecer final da Qualidade
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamento
    notificacao = db.relationship('Notificacao', backref=db.backref('ishikawa', uselist=False))

    def to_dict(self):
        return {
            "id": self.id,
            "metodo": self.metodo,
            "mao_de_obra": self.mao_de_obra,
            "maquina": self.maquina,
            "material": self.material,
            "meio_ambiente": self.meio_ambiente,
            "medida": self.medida,
            "conclusao": self.conclusao
        }