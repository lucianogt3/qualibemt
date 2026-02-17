from app import create_app, db
from app.models.usuario import Usuario # Certifique-se de que o nome do modelo está correto
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # Verifique se já existe um admin para não duplicar
    admin_existente = Usuario.query.filter_by(email='admin@admin.com').first()
    
    if not admin_existente:
        novo_admin = Usuario(
            nome='Luciano Administrador',
            email='admin@admin.com',
            # A senha '123456' será criptografada para segurança
            senha=generate_password_hash('123456'), 
            role='admin', # Define que este usuário pode ver o Menu ADM
            ativo=True
        )
        db.session.add(novo_admin)
        db.session.commit()
        print("✅ Usuário ADM criado com sucesso!")
        print("Login: admin@admin.com | Senha: 123456")
    else:
        print("⚠️ O usuário administrador já existe no banco.")