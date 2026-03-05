# Backend - Redirect System

## Requisitos

- Node.js 18+
- Docker
- npm ou yarn

---

## 1. Subir o Banco de Dados

Na raiz do projeto (onde está o `docker-compose.yml`):

```bash
docker compose up -d
```

Isso irá iniciar o PostgreSQL na porta `5432`.

Verifique se o container está rodando:

```bash
docker ps
```

---

## 2. Configurar Variáveis de Ambiente

Dentro da pasta `/backend`, crie um arquivo `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/redirectdb"
JWT_SECRET="supersecretkey"
PORT=3001
```

---

## 3. Instalar Dependências

Acesse a pasta do backend:

```bash
cd backend
npm install
```

---

## 4. Executar Migrations do Prisma

```bash
npx prisma migrate dev
```

Se necessário, gerar o client manualmente:

```bash
npx prisma generate
```

---

## 5. Rodar o Servidor em Desenvolvimento

```bash
npm run dev
```

O servidor iniciará em:

```
http://localhost:3001
```

---

## 6. Build para Produção

```bash
npm run build
npm start
```

---

## 7. Fluxo Completo (Setup Rápido)

```bash
docker compose up -d
cd backend
npm install
npx prisma migrate dev
npm run dev
```

---

## Estrutura Esperada

```
backend/
  src/
  prisma/
  package.json
  tsconfig.json
  .env
```

---

## Teste Inicial

Acesse:

```
GET http://localhost:3001/r/test
```

Deve retornar `404`, indicando que o servidor está funcionando corretamente.
