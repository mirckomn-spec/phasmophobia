# Naltic & Neat

Monumento digital dedicado aos dois maiores investigadores paranormais da atualidade.

## Executar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000)

## Design

Identidade visual minimalista em preto, branco e cinza. Tipografia exclusiva Poppins (ExtraBold, Bold, SemiBold) da pasta `/fontes`.

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Home — Naltic & Neat como protagonistas |
| `/investigadores` | Dossiês completos da dupla |
| `/streak` | Win Streak e histórico |
| `/ghosts` | Banco de entidades |
| `/ghosts/[id]` | Dossiê de entidade |
| `/tools` | Ferramentas de campo |

## Dados

Por padrão, dados salvos em `data/local-db.json`. Para Supabase, configure `.env.local` conforme `.env.local.example`.
