from datetime import datetime
from app.models.notificacao import Notificacao
from app import db

def gerar_novo_protocolo(tipo_origem):
    """
    Gera protocolos no formato: TIPO + SEQUENCIAL + ANO
    Exemplos: ELO0012026, REC0012026, NOT0012026
    """
    # 1. Mapeia o prefixo com base na origem selecionada no formulário
    prefixos = {
        "Elogio": "ELO",
        "Reclamação": "REC",
        "Ocorrência": "NOT"
    }
    prefixo = prefixos.get(tipo_origem, "GEN") # GEN caso não encontre o tipo
    
    ano_atual = datetime.now().year
    
    # 2. Busca no banco a última notificação desse tipo no ano atual
    # Filtra por protocolos que começam com o prefixo e terminam com o ano atual
    ultima_notificacao = Notificacao.query.filter(
        Notificacao.protocolo.like(f"{prefixo}%{ano_atual}")
    ).order_by(Notificacao.id.desc()).first()

    if ultima_notificacao:
        # Extrai o número do meio (ex: de NOT0052026 tira o '005')
        # O prefixo tem 3 letras e o ano 4. O que sobra no meio é o número.
        try:
            ultimo_numero_str = ultima_notificacao.protocolo[3:-4]
            proximo_numero = int(ultimo_numero_str) + 1
        except ValueError:
            proximo_numero = 1
    else:
        # Se for a primeira do ano para esse tipo
        proximo_numero = 1

    # 3. Formata com 3 dígitos (001, 002...) e junta tudo
    sequencial = str(proximo_numero).zfill(3)
    
    return f"{prefixo}{sequencial}{ano_atual}"