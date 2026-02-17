from app import create_app, db
from app.models.configuracao import ItemFormulario
# Se você tiver um modelo de Setor, importe-o aqui. Ex:
# from app.models.setor import Setor 

app = create_app()

with app.app_context():
    print("Iniciando alimentação do banco de dados...")
    
    # 1. Itens Extraídos das fotos do Hospital do Coração
    itens = [
        # CATEGORIA: ASSISTENCIAL (Envolve Paciente)
        ItemFormulario(nome="Flebite", categoria="Assistencial"),
        ItemFormulario(nome="Queda de paciente", categoria="Assistencial"),
        ItemFormulario(nome="Medicação - Falha na administração", categoria="Assistencial"),
        ItemFormulario(nome="Medicação - Falha na checagem", categoria="Assistencial"),
        ItemFormulario(nome="Lesão por pressão (LPP)", categoria="Assistencial"),
        ItemFormulario(nome="Identificação - Falha na pulseira", categoria="Assistencial"),
        ItemFormulario(nome="Extubação acidental", categoria="Assistencial"),
        ItemFormulario(nome="Cirurgia em local errado", categoria="Assistencial"),
        
        # CATEGORIA: APOIO / INFRA (Não Envolve Paciente)
        ItemFormulario(nome="Gases Medicinais - Vazamento ou falta", categoria="Apoio"),
        ItemFormulario(nome="TI - Instabilidade de sistema/rede", categoria="Apoio"),
        ItemFormulario(nome="Equipamento - Falha crítica", categoria="Apoio"),
        ItemFormulario(nome="CME - Falha na esterilização", categoria="Apoio"),
        ItemFormulario(nome="Infraestrutura - Elétrica/Hidráulica", categoria="Apoio"),
        ItemFormulario(nome="Higienização - Falha na limpeza", categoria="Apoio"),
        ItemFormulario(nome="Faturamento - Erro de conta", categoria="Apoio")
    ]
    
    try:
        # Adiciona os itens ao banco
        db.session.add_all(itens)
        db.session.commit()
        print("✅ Itens de formulário cadastrados com sucesso!")
    except Exception as e:
        db.session.rollback()
        print(f"❌ Erro ao popular banco: {e}")

if __name__ == "__main__":
    print("Processo concluído.")