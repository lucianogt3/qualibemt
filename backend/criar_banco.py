from app import create_app, db
from app.models.notificacao import Notificacao
from app.models.setor import Setor
from app.models.usuario import Usuario

app = create_app()

with app.app_context():
    print("Conectando ao banco de dados...")
    db.create_all()
    print("Tabelas criadas com sucesso no PostgreSQL!")