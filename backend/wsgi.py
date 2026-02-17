from app import create_app

app = create_app()

if __name__ == "__main__":
    # Alterado para a porta 5018 conforme solicitado
    app.run(debug=True, port=5018)