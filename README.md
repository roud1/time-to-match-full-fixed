# v0-time-to-match-ui

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_HAvrpxXJVSylrpJBzlJPimbSKzf0)

## Getting Started

### Demo mode (no database)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without `DATABASE_URL`, the app uses **demo mode** (localStorage).

### Production mode locally

```bash
npm install
npm run db:setup    # Docker Postgres + .env.local + migrations
npm run dev
curl http://localhost:3000/api/ready   # expect mode: "production"
```

Or manually: `docker compose up -d`, copy `.env.example` → `.env.local`, set `DATABASE_URL` and `AUTH_SECRET`, then `npm run db:migrate`.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Vercel/Render/Docker deploy steps and the full env var checklist.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/roud1/v0-time-to-match-ui" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
