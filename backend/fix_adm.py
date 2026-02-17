from app import create_app, db
from app.models.usuario import Usuario
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # 1. Limpa o admin antigo para evitar conflito de email único
    Usuario.query.filter_by(email='admin@admin.com').delete()
    db.session.commit()

    # 2. Cria o novo admin usando os nomes exatos do seu modelo
    novo_admin = Usuario(
        nome='Luciano Administrador',
        email='admin@admin.com',
        senha_hash=generate_password_hash('123456'), # Nome exato: senha_hash
        perfil='ADM',                               # Nome exato: perfil
        ativo=True
    )
    
    db.session.add(novo_admin)
    db.session.commit()
    print("✅ ADM criado com sucesso!")
    print("Login: admin@admin.com | Senha: 123456 | Perfil: ADM")