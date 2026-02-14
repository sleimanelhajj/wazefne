<p align="center">
  <img src="Frontend/src/assets/logo/logo.png" alt="Wazefne Logo" width="180" />
</p>

<h1 align="center">Wazefne</h1>

<p align="center">
  A freelancer & service marketplace connecting skilled professionals with clients.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-19-DD0031?logo=angular&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
</p>

---

## ✨ Features

- **JWT Authentication** — Secure signup & login with token-based auth
- **Profile Management** — Title, bio, skills, languages, hourly rate, portfolio
- **Portfolio Upload** — Upload images directly from your computer (stored as base64)
- **Browse Freelancers** — Discover and filter service providers
- **Bookings & History** — Track current and past bookings
- **Real-time Messaging** — Chat interface between clients and freelancers
- **Responsive UI** — Built with Angular Material components

---

## 🏗 Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | Angular 19, Angular Material, TypeScript |
| Backend    | Express 5, Node.js, TypeScript           |
| Database   | PostgreSQL                               |
| Auth       | JWT (jsonwebtoken), bcrypt               |
| API Docs   | Swagger (swagger-jsdoc + swagger-ui)     |
| File Upload| Multer (memory storage → base64)         |

---

## 📁 Project Structure

```
wazefne/
├── Backend/
│   ├── server.ts              # Express entry point
│   └── src/
│       ├── config/            # DB connection, migrations, Swagger
│       ├── controllers/       # Auth & Profile controllers
│       ├── middleware/         # JWT auth, error handler
│       ├── migrations/sql/    # SQL migration files
│       └── routes/            # API route definitions
│
├── Frontend/
│   └── src/app/
│       ├── components/        # Reusable UI components
│       ├── pages/             # Route-level pages
│       ├── services/          # HTTP services (auth, profile, filter)
│       ├── models/            # TypeScript interfaces
│       ├── guards/            # Route protection (auth guard)
│       └── interceptors/      # HTTP interceptors (auth token)
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** running locally
- **Angular CLI** (`npm i -g @angular/cli`)

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/wazefne.git
cd wazefne
```

### 2. Backend setup

```bash
cd Backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/wazefne
JWT_SECRET=your-secret-key
PORT=3000
```

Start the dev server:

```bash
npm run dev
```

> API docs available at [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### 3. Frontend setup

```bash
cd Frontend
npm install
ng serve
```

> App runs at [http://localhost:4200](http://localhost:4200)

---

## 📡 API Endpoints

| Method | Endpoint                        | Description              | Auth |
| ------ | ------------------------------- | ------------------------ | ---- |
| POST   | `/api/auth/signup`              | Register a new user      | ✗    |
| POST   | `/api/auth/login`               | Login & get JWT          | ✗    |
| GET    | `/api/profile/me`               | Get current user profile | ✓    |
| PUT    | `/api/profile/update-profile`   | Update profile info      | ✓    |
| POST   | `/api/profile/upload-portfolio` | Upload portfolio images  | ✓    |

---

## 📄 License

This project is licensed under the ISC License.
