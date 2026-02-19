📘 QUALI-BEMT
Sistema de Gestão da Qualidade Hospitalar

Plataforma fullstack (Flask + React + PostgreSQL) para gestão de notificações, eventos adversos, triagem, análise de causas e planos de ação.

Desenvolvido para ambiente hospitalar com foco em:

🔒 Segurança da Informação (LGPD)

🏥 Gestão de Qualidade Assistencial

📊 Monitoramento e indicadores

🔍 Rastreabilidade e auditoria

👥 Controle de acesso por perfil

🚀 Funcionalidades do Sistema
🔔 Notificações

Registro público de notificações

Consulta por protocolo

Upload de evidências

Classificação por setor e categoria

Status (Pendente, Em análise, Concluído)

🧪 Triagem e Análise

Avaliação inicial pela Qualidade

Encaminhamento automático para gestor responsável

Ferramenta Ishikawa (6M)

Registro de plano de ação

Histórico de alterações

👥 Gestão de Usuários

Perfis: ADM, Qualidade, Gestor

Vínculo a múltiplos setores

Bloqueio automático após 5 tentativas

Expiração de senha (90 dias)

Primeiro acesso obrigatório (troca de senha + aceite de termos)

Reset administrativo de senha

Controle de ativo/inativo

🔐 Segurança Implementada

JWT Authentication

Política de senha forte

Bloqueio temporário por tentativas

Aceite obrigatório de Termo de Uso e Confidencialidade

Rastreabilidade de ações

Controle de permissões por rota (ProtectedRoute)

🏗️ Arquitetura
Backend

Flask 3

SQLAlchemy

Flask-Migrate

PostgreSQL

JWT

Waitress (produção)

Frontend

React

React Router

Axios

TailwindCSS

Banco de Dados

PostgreSQL

Versionamento com Alembic