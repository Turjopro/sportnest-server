# SportNest (Server)

Backend REST API for **SportNest** — a full-stack sports facility booking
management system built with the MERN stack.

## Purpose
This server handles user authentication (JWT stored in httpOnly cookies),
facility management (CRUD), and booking management, all connected to a
MongoDB database. It powers the [SportNest Client](https://github.com/Turjopro/sportnest-client).


## Live URL
- Server: https://sportnest-server-usu2.onrender.com
## Live URL - Server: https://sportnest-server-usu2.onrender.com

## Tech Stack
- Node.js
- Express.js
- MongoDB (native driver)
- JWT (jsonwebtoken)
- Cookie-based authentication

## Features
- 🔐 JWT authentication with httpOnly, secure cookies
- 🛡️ Custom middleware (`verifyToken`) to protect private routes
- 🏟️ Facilities CRUD (create, read, update, delete) — owner-protected
- 🔍 Search facilities by name using MongoDB `$regex`
- 🎯 Filter facilities by sport type using MongoDB `$in`
- 📅 Bookings management — create, view by user, cancel
- 📈 Auto-increment `booking_count` on each new booking
- 🌐 CORS configured for the client domain with credentials support
- 🔒 Owner-only authorization checks on update/delete operations

## API Endpoints

### Auth
| Method | Route     | Description                          |
|--------|-----------|---------------------------------------|
| POST   | `/jwt`    | Issue JWT and set httpOnly cookie     |
| POST   | `/logout` | Clear the auth cookie                 |

### Facilities
| Method | Route                  | Access   | Description                          |
|--------|-------------------------|----------|---------------------------------------|
| GET    | `/facilities`           | Public   | Get all facilities (supports `search`, `type` query) |
| GET    | `/facilities/featured`  | Public   | Get 6 featured facilities              |
| GET    | `/facilities/:id`       | Public   | Get a single facility by id            |
| GET    | `/my-facilities`        | Private  | Get facilities added by the logged-in user |
| POST   | `/facilities`           | Private  | Add a new facility                     |
| PATCH  | `/facilities/:id`       | Private  | Update a facility (owner only)         |
| DELETE | `/facilities/:id`       | Private  | Delete a facility (owner only)         |

### Bookings
| Method | Route              | Access   | Description                        |
|--------|----------------------|----------|-------------------------------------|
| POST   | `/bookings`          | Private  | Create a new booking                 |
| GET    | `/bookings`          | Private  | Get bookings for the logged-in user  |
| DELETE | `/bookings/:id`      | Private  | Cancel/delete a booking              |

## NPM Packages Used
- `express` — web framework
- `mongodb` — MongoDB native driver
- `cors` — cross-origin resource sharing
- `dotenv` — environment variable management
- `cookie-parser` — parse cookies for JWT verification
- `jsonwebtoken` — issue and verify JWT tokens
- `nodemon` (dev) — auto-restart server during development

## Environment Variables
Create a `.env` file in the root based on `.env.example`, including:


## Getting Started Locally
```bash
git clone https://github.com/Turjopro/sportnest-server.git
cd sportnest-server
npm install
npm run dev
```




# SportNest (Client)

**SportNest** is a full-stack sports facility booking platform where users
can explore football turfs, badminton courts, swimming lanes and tennis
courts, and book a specific date and time slot. Logged-in users can also
list and manage their own facilities.

## Purpose
This is the client-side (frontend) of SportNest, built with React and
Tailwind CSS. It communicates with the [SportNest Server](https://github.com/Turjopro/sportnest-server)
for authentication, facility data, and booking management.

## Live URL
- Client: `<your-live-client-link-here>`
- Server: `<your-live-server-link-here>`

## Tech Stack
- React (Vite)
- React Router DOM
- Tailwind CSS
- Firebase Authentication
- Axios

## Features
- 🔑 Firebase Authentication (Email/Password + Google Login)
- 🍪 JWT stored in httpOnly cookie for protecting private routes/APIs
- 🏟️ Browse all facilities with search (by name) and filter (by sport type)
- 📅 Book a facility for a specific date, time slot and number of hours
- ✏️ Add / update / delete your own facilities (owner-only, with delete confirmation)
- 📖 View and cancel your own bookings
- 📱 Fully responsive design for mobile, tablet and desktop
- 🚫 Custom 404 page and loading spinner
- 🔄 Private routes persist correctly on page reload (no unwanted login redirect)

## Pages / Routes
| Route                    | Access   | Description                       |
|---------------------------|----------|-------------------------------------|
| `/`                       | Public   | Home page (banner + featured facilities) |
| `/facilities`             | Public   | All facilities (search + filter)   |
| `/facility/:id`           | Private  | Facility details + booking form    |
| `/login`                  | Public   | Login page                         |
| `/register`               | Public   | Registration page                  |
| `/add-facility`           | Private  | Add a new facility                 |
| `/manage-facilities`      | Private  | Manage/update/delete own facilities |
| `/update-facility/:id`    | Private  | Update a facility                  |
| `/my-bookings`            | Private  | View and cancel own bookings       |
| `*`                       | —        | Custom 404 Not Found page          |

## NPM Packages Used
- `react`, `react-dom` — UI library
- `react-router-dom` — client-side routing
- `firebase` — authentication
- `axios` — API requests
- `react-hook-form` — form handling and validation
- `react-hot-toast` — toast notifications
- `react-icons` — icon set
- `tailwindcss` — styling

## Environment Variables
Create a `.env` file in the root based on `.env.example`, including: