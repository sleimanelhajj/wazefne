<p align="center">
  <img src="Frontend/src/assets/logo/logo.png" alt="Wazefne Logo" width="180" />
</p>

<h1 align="center">Wazefne</h1>

<p align="center">
  A freelancer & service marketplace connecting skilled professionals with clients across Lebanon.
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
- **Profile Setup** — Guided profile completion with title, bio, category, skills, languages, hourly rate, and portfolio
- **Location-Based Filtering** — 90+ Lebanese locations, geolocation-powered "Current Location" detection
- **Browse & Filter** — Discover service providers with filters for category, location, price range, rating, and availability
- **Reviews & Ratings** — Leave reviews for service providers with automatic rating aggregation
- **Portfolio Upload** — Upload images directly from your device (stored as base64)
- **Bookings & History** — Track current and past bookings
- **Real-time Messaging** — Chat interface between clients and freelancers
- **Mobile-First Design** — Responsive layout with slide-in drawer navigation, floating filter button, and mobile-optimized sidebar
- **Modern UI** — Built with Angular Material components, smooth animations, and a polished design

---

## 🏗 Tech Stack

| Layer       | Technology                               |
| ----------- | ---------------------------------------- |
| Frontend    | Angular 19, Angular Material, TypeScript |
| Backend     | Express 5, Node.js, TypeScript           |
| Database    | PostgreSQL                               |
| Auth        | JWT (jsonwebtoken), bcrypt               |
| API Docs    | Swagger (swagger-jsdoc + swagger-ui)     |
| File Upload | Multer (memory storage → base64)         |

---

## 📁 Project Structure

```
wazefne/
├── Backend/
│   ├── server.ts              # Express entry point
│   └── src/
│       ├── config/            # DB connection, migrations, Swagger
│       ├── controllers/       # Auth, Profile, Users, Reviews controllers
│       ├── middleware/         # JWT auth, error handler
│       ├── migrations/sql/    # SQL migration files (schema + seed data)
│       └── routes/            # API route definitions
│
├── Frontend/
│   └── src/app/
│       ├── components/
│       │   ├── browse/        # Side-bar filters, user cards
│       │   ├── common/        # Top-bar, footer
│       │   ├── home/          # Hero section
│       │   └── profile/       # Banner, reviews, portfolio
│       ├── pages/             # Route-level pages (home, browse, profile, setup)
│       ├── services/          # HTTP services (auth, profile, filter)
│       ├── models/            # TypeScript interfaces & shared data
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
git clone https://github.com/sleimanelhajj/wazefne.git
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

> Migrations run automatically on first start. API docs available at [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### 3. Frontend setup

```bash
cd Frontend
npm install
ng serve
```

> App runs at [http://localhost:4200](http://localhost:4200)

---

## 📡 API Endpoints

| Method | Endpoint                            | Description                | Auth |
| ------ | ----------------------------------- | -------------------------- | ---- |
| POST   | `/api/auth/signup`                  | Register a new user        | ✗    |
| POST   | `/api/auth/login`                   | Login & get JWT            | ✗    |
| GET    | `/api/profile/me`                   | Get current user profile   | ✓    |
| GET    | `/api/profile/:id`                  | Get public profile by ID   | ✓    |
| PUT    | `/api/profile/update-profile`       | Update profile info        | ✓    |
| POST   | `/api/profile/upload-portfolio`     | Upload portfolio images    | ✓    |
| POST   | `/api/profile/upload-profile-image` | Upload profile picture     | ✓    |
| GET    | `/api/users`                        | List all service providers | ✓    |
| POST   | `/api/reviews`                      | Create a review            | ✓    |
| GET    | `/api/reviews/user/:userId`         | Get reviews for a user     | ✗    |

---

## 🗺 Location System

The platform supports **90+ Lebanese locations** organized across five regions:

- **Beirut** — Achrafieh, Hamra, Verdun, Gemmayze, Mar Mikhael, Badaro, and more
- **Mount Lebanon** — Jounieh, Byblos (Jbeil), Baabda, Aley, Broummana, Kaslik, and more
- **North Lebanon** — Tripoli, Batroun, Ehden, Zgharta, Bcharre, Akkar, and more
- **South Lebanon** — Saida (Sidon), Tyre (Sour), Nabatieh, Jezzine, and more
- **Bekaa** — Zahle, Baalbek, Chtaura, Aanjar, Hermel, and more

Users can also use **📍 Current Location** to auto-detect the nearest city via the browser's geolocation API.

---

## 📄 License

This project is licensed under the ISC License.
