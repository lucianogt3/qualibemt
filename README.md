# Meu Sistema de Qualidade

Estrutura fullstack (Flask + React) para gestão da qualidade (notificações, triagem, análise, planos de ação).

## Rodar com Docker
```bash
docker compose up --build
```
- Backend: http://localhost:5010/health
- API: http://localhost:5010/api/ping
- Frontend: http://localhost:5173

## Rodar backend local (sem Docker)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m waitress --listen=0.0.0.0:5010 wsgi:app
```
