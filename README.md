# SportNest (Server)

## Purpose
This is the backend API for SportNest, a sports facility booking management
system. It handles authentication (JWT cookies), facilities CRUD, and
bookings management, connected to MongoDB.

## Live URL
- Server: <your-live-server-link-here>

## Features
- JWT authentication with httpOnly cookies
- Facilities CRUD (create, read, update, delete) — owner-protected
- Search facilities by name (`$regex`) and filter by type (`$in`)
- Bookings CRUD — create, view by user, cancel
- CORS configured for the client domain with credentials

## NPM Packages Used
- express
- mongodb
- cors
- dotenv
- cookie-parser
- jsonwebtoken
- nodemon (dev)

## Environment Variables
Create a `.env` file based on `.env.example` with your MongoDB credentials
and JWT secret.
