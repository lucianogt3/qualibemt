from app import db
from datetime import datetime, timedelta

class Notificacao(db.Model):
    __tablename__ = 'notificacoes'

    # Identificadores
    id = db.Column(db.Integer, primary_key=True)
    protocolo = db.Column(db.String(20), unique=True, nullable=False)
    
    # 1 - Informações Básicas
    data_evento = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    turno = db.Column(db.String(20))
    origem = db.Column(db.String(50), nullable=False)
    titulo_ocorrencia = db.Column(db.String(255), nullable=False)
    unidade_notificante = db.Column(db.String(100), nullable=False)
    unidade_notificada = db.Column(db.String(100), nullable=False)
    
    # Detalhes do Paciente
    envolveu_paciente = db.Column(db.Boolean, default=False)
    nome_paciente = db.Column(db.String(255), nullable=True)
    prontuario = db.Column(db.String(50), nullable=True)
    data_nascimento_paciente = db.Column(db.Date, nullable=True)
    
    # Identificação do Notificante
    quer_se_identificar = db.Column(db.Boolean, default=False)
    identificacao_notificante = db.Column(db.String(255), nullable=True)
    
    # Relato
    descricao = db.Column(db.Text, nullable=False) 
    foto_path = db.Column(db.String(255), nullable=True) 

    # 2 - Ação Imediata
    houve_acao_imediata = db.Column(db.Boolean, default=False) 
    descricao_acao_imediata = db.Column(db.Text, nullable=True)
    data_acao_imediata = db.Column(db.DateTime, nullable=True)
    
    # 3 - Gestão, Triagem e Classificação
    status = db.Column(db.String(50), default='PENDENTE')
    classificacao = db.Column(db.String(50), nullable=True)
    gravidade = db.Column(db.String(50), nullable=True) 
    
    # Gestão de Resposta
    gestor_responsavel = db.Column(db.String(100), nullable=True)
    prazo_limite = db.Column(db.DateTime, nullable=True)
    
    # --- NOVOS CAMPOS PARA ENCERRAMENTO (QUALIDADE) ---
    motivo_encerramento_padrao = db.Column(db.String(100), nullable=True) # Duplicidade, Improcedente...
    justificativa_encerramento = db.Column(db.Text, nullable=True)        # Texto livre
    data_encerramento = db.Column(db.DateTime, nullable=True)
    # --------------------------------------------------

    # Auditoria
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)
    atualizado_por = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True)
    data_atualizacao = db.Column(db.DateTime, onupdate=db.func.now())

    def to_dict(self):
        """Converte para JSON, calculando também se o prazo venceu"""
        atrasado = False
        # Se tem prazo e não está concluído ou encerrado, verifica atraso
        if self.prazo_limite and self.status not in ['CONCLUIDO', 'ENCERRADA']:
            atrasado = datetime.utcnow() > self.prazo_limite

        return {
            "id": self.id,
            "protocolo": self.protocolo,
            "data_evento": self.data_evento.isoformat() if self.data_evento else None,
            "turno": self.turno,
            "origem": self.origem,
            "titulo_ocorrencia": self.titulo_ocorrencia,
            "unidade_notificante": self.unidade_notificante,
            "unidade_notificada": self.unidade_notificada,
            "envolveu_paciente": self.envolveu_paciente,
            "nome_paciente": self.nome_paciente,
            "prontuario": self.prontuario,
            "data_nascimento_paciente": self.data_nascimento_paciente.isoformat() if self.data_nascimento_paciente else None,
            "descricao": self.descricao,
            "status": self.status,
            "classificacao": self.classificacao,
            "gravidade": self.gravidade,
            "gestor_responsavel": self.gestor_responsavel,
            "prazo_limite": self.prazo_limite.isoformat() if self.prazo_limite else None,
            "atrasado": atrasado,
            "motivo_padrao": self.motivo_encerramento_padrao,
            "justificativa": self.justificativa_encerramento,
            "data_encerramento": self.data_encerramento.isoformat() if self.data_encerramento else None,
            "criado_em": self.criado_em.strftime('%d/%m/%Y %H:%M') if self.criado_em else None
        }

    def __repr__(self):
        return f'<Notificacao {self.protocolo}>'