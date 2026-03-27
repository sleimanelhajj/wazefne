<p align="center">
  <img src="Frontend/src/assets/logo/logo.png" alt="Wazefne Logo" width="180" />
</p>

<h1 align="center">✨ Wazefne ✨</h1>

<p align="center">
  <strong>The Ultimate Freelancer & Service Marketplace for Lebanon 🇱🇧</strong><br>
  <em>Connect with skilled professionals, book services seamlessly, and chat in real-time.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-19-DD0031?logoy=angular&logoColor=white" alt="Angular 19"/>
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express 5"/>
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white" alt="Supabase"/>
  <img src="https://img.shields.io/badge/Clerk-6C47FF?logo=clerk&logoColor=white" alt="Clerk Auth"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5"/>
  <img src="https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socket.io&logoColor=white" alt="Socket.IO"/>
</p>

---

## 🌟 Why Wazefne?

Finding reliable professionals in Lebanon shouldn't be a hassle. Whether you need a deep house cleaning in Achrafieh, a professional photographer in Tripoli, or a personal trainer in Verdun, **Wazefne** brings them straight to your screen. Browse, filter, chat, and book with ease!

---

## 🔥 Awesome Features

- 🔐 **Secure Auth powered by Clerk** — Seamless sign-in, OAuth (Google/GitHub), and complete user management via Clerk.
- 🎨 **Rich Profiles** — Show off your skills, upload a portfolio gallery, and set up a custom banner!
- 📍 **Smart Locations** — Auto-detects your nearest city! Filter by 90+ Lebanese locations across all 5 regions.
- 💬 **Live Chat!** — Real-time instant messaging powered by our custom Socket.IO integration.
- 🤝 **Reverse Marketplace** — Clients can post jobs and let freelancers submit bids and proposals.
- ⚡ **Urgent Hiring** — Find available freelancers ready to work _today_ in your area.
- ⭐ **Reviews & Ratings** — Leave feedback for freelancers. Star ratings are aggregated automatically!
- 📱 **Mobile-First UX** — Slide-in drawers, floating filter buttons, and a polished Angular Material UI that looks amazing on any screen size.

---

## 🚀 How It Works

1. **Sign Up:** Create a free account as a client or a service provider.
2. **Browse:** Use the powerful sidebar filters (Category, Location, Price, Rating) to find the perfect talent.
3. **Connect:** Click "Get in Touch" on their profile to instantly start a live chat.
4. **Review:** Once the job is done, drop a 5-star review!

---

## 🏗 Tech Stack Under the Hood

| Layer         | Technology                               |
| ------------- | ---------------------------------------- |
| **Frontend**  | Angular 19, Angular Material, TypeScript |
| **Backend**   | Express 5, Node.js, TypeScript           |
| **Database**  | PostgreSQL (Hosted on **Supabase**)      |
| **Auth**      | **Clerk** (JWT, OAuth, User Management)  |
| **Real-time** | Socket.IO (WebSockets)                   |
| **API Docs**  | Swagger (swagger-jsdoc + swagger-ui)     |
| **Uploads**   | Multer (memory storage → base64)         |

---

## 📁 The Architecture

```text
wazefne/
├── Backend/
│   ├── server.ts              # Express & Socket.IO entry point
│   └── src/
│       ├── config/            # DB connection, migrations, Swagger, Socket.IO
│       ├── controllers/       # Auth, Profile, Users, Reviews, Messages, Jobs
│       ├── middleware/        # JWT auth, error handling
│       ├── migrations/sql/    # SQL schemas + awesome seed data! 🪴
│       └── routes/            # API definitions
│
├── Frontend/
│   └── src/app/
│       ├── components/
│       │   ├── browse/        # Side-bar filters, user cards
│       │   ├── common/        # Top-bar, footer
│       │   ├── home/          # Hero section
│       │   ├── profile/       # Banner, reviews, portfolio
│       │   ├── messages/      # The live chat engine (bubbles, lists, inputs)
│       │   └── jobs/          # Reverse marketplace features (post job, bidding)
│       ├── pages/             # Route-level components
│       ├── services/          # REST & WebSocket communication layers
│       ├── models/            # Type-safe data structures
│       └── interceptors/      # Behind-the-scenes auth token injection
│
└── README.md
```

---

## 🎮 Run it Locally

Ready to dive in? Here’s how to get it running:

### Prerequisites

- Node.js ≥ 18
- PostgreSQL running locally
- Angular CLI (`npm i -g @angular/cli`)

### 1. Backend Setup

```bash
cd Backend
npm install
```

Create your `.env` file (Make sure you have your Supabase connection string and Clerk keys!):

```env
DATABASE_URL=postgresql://<user>:<password>@<supabase-host>:5432/postgres
CLERK_SECRET_KEY=sk_test_...
PORT=3000
```

Fire it up! 🚀

```bash
npm run dev
```

_(Pro-tip: The database tables and dummy users populate automatically on the first start! Check out the interactive API Docs at [http://localhost:3000/api-docs](http://localhost:3000/api-docs))_

### Sync local database between two laptops

If both machines run different local PostgreSQL instances, you can export/import data with the backend helper scripts:

```bash
cd Backend
npm run db:dump
```

This creates `Backend/db/latest.sql`. Move or sync that file to your other laptop, then run:

```bash
cd Backend
npm run db:restore
```

If you want restore to happen before backend startup on that machine:

```bash
cd Backend
npm run dev:sync
```

You can override the dump file path with `DB_SYNC_FILE` in `Backend/.env`.

### 2. Frontend Setup

In a new terminal:

```bash
cd Frontend
npm install
```

Create your frontend environment file (`Frontend/src/environments/environment.ts`):

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000",
  clerkPublishableKey: "pk_test_...",
};
```

```bash
ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser and enjoy the show! 🎉

---

## 🗺 Welcome to Lebanon

Wazefne speaks Lebanese geography fluently. We’ve mapped out 90+ locations across:

- **Beirut** (Hamra, Achrafieh, Gemmayze...)
- **Mount Lebanon** (Jounieh, Byblos, Broummana...)
- **North Lebanon** (Tripoli, Batroun, Zgharta...)
- **South Lebanon** (Saida, Tyre, Nabatieh...)
- **Bekaa** (Zahle, Baalbek, Chtaura...)

---

## � License

Built with ❤️ for the community. Licensed under the ISC License.
