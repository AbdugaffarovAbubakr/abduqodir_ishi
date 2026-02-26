# Computer Devices Learning Platform

Backend (Node.js/Express) + JSON file database + simple vanilla frontend.

## Quick start
1. Copy `.env.example` to `.env` and set `JWT_SECRET`.
2. `npm install`
3. `npm run dev`

The app serves the frontend from `public/` at `http://localhost:3000/`.

## Notes
- JSON data lives in `src/database/`.
- First registered user becomes `admin`.

## API (summary)
POST /auth/register
POST /auth/login
GET /devices
GET /devices/:id
POST /devices (admin)
PUT /devices/:id (admin)
DELETE /devices/:id (admin)
GET /tests/:deviceId
POST /tests (admin)
DELETE /tests/:id (admin)
POST /results
GET /results/me
GET /results (admin)
GET /users (admin)
GET /stats (admin)
