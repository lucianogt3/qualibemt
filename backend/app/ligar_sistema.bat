@echo off
echo Iniciando Sistema de Qualidade Hospitalar...

start cmd /k "cd backend && .venv\Scripts\activate && python wsgi.py"
start cmd /k "cd frontend && npm run dev"

echo Backend e Frontend estao ligando em janelas separadas.
pause