from app import create_app, db
from app.models.setor import Setor

app = create_app()

def alimentar():
    nomes_setores = [
        "Recepção", "Internação", "Diretoria", "Qualidade", 
        "Higienização", "Faturamento", "Farmácia", 
        "Eletroconvulsoterapia", "Centro Cirúrgico", 
        "Manutenção Engenharia Clínica", "TI - Tecnologia da Informação", 
        "Posto 1", "Posto 2", "Financeiro", "Compras", 
        "Recursos Humanos", "CME"
    ]
    
    with app.app_context():
        print("Cadastrando setores...")
        for nome in nomes_setores:
            existente = Setor.query.filter_by(nome=nome).first()
            if not existente:
                novo_setor = Setor(nome=nome, sigla=nome[:4].upper())
                db.session.add(novo_setor)
        
        db.session.commit()
        print("✅ Todos os setores foram cadastrados com sucesso!")

if __name__ == "__main__":
    alimentar()