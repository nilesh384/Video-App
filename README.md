if visited for first time in few days maytake some time to load backend as it is deployed in free tier

# Video-App

A simple YouTube-like video application with a Node.js/Express backend and a Vite + React frontend.

This repository contains both Backend and Frontend so you can run the full app locally or inspect each part separately.

---

## Quick note (read first)

if visited for first time in few days maytake some time to load backend as it is deployed in free tier

Many free hosting providers suspend inactive instances. If you visit the deployed app after several days of inactivity, the backend may take extra time to wake up (cold start). This is expected behavior for free-tier deployments.

---

## What is this

Video-App is a learning/demo project that mimics basic features of a video-sharing site:

- User signup / login (JWT-based)
- Upload videos and cover images (Cloudinary integration)
- Like, comment, subscribe, and playlist functionality
- User dashboard and basic video management

It is split into two main folders:

- `Backend/` — Express API, models, controllers, and upload handling.
- `Frontend/` — React + Vite single-page app.

## Tech stack

- Backend: Node.js, Express, MongoDB (Mongoose), Cloudinary, multer (file handling)
- Frontend: React, Vite
- Dev tools: nodemon (optional), ESLint (frontend)

## Repo structure (high level)

- `Backend/`
  - `src/` — controllers, models, routes, middlewares, utils
  - `Public/Temp/` — temporary uploaded files used during development
  - `package.json` — backend scripts and dependencies
- `Frontend/`
  - `src/` — React pages, components, assets
  - `package.json` — frontend scripts and dependencies

Open the folders for full file listings.

## Local development (Windows PowerShell)

Prerequisites:
- Node.js v16+ (recommended)
- npm (or yarn)
- MongoDB (local or Atlas)

1) Clone the repo

```powershell
git clone <your-repo-url>
cd "Tube Bckend"
```

2) Backend setup

```powershell
cd Backend
npm install
# create a .env file next to src (see below)
```

Create `Backend/.env` with these variables (example):

```text
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/videodb?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend (development):

```powershell
npm run dev
# or
node src/index.js
```

If you get connection errors, verify `MONGO_URI` and that MongoDB allows connections from your IP (if using Atlas).

3) Frontend setup

```powershell
cd ..\Frontend
npm install
npm run dev
```

Open the address reported by Vite (usually `http://localhost:5173`). The frontend will request endpoints on the backend—update the frontend environment or proxy settings if your backend runs on a different host/port.

## Environment and configuration

- Backend expects a `.env` file with the variables listed above.
- Do NOT commit `.env` to source control. Add it to `.gitignore`.
- Cloudinary is used for storing uploaded media; you can use any other provider but will need to update `src/utils/cloudinary.js` accordingly.

## Deployment notes

- If you deploy the backend to a free-tier host, expect cold starts after inactivity (see top note).
- For production, use a managed MongoDB service (Atlas), secure `JWT_SECRET`, and enable HTTPS.

## Troubleshooting

- Backend won't start: check `PORT`, `MONGO_URI`, and that you installed dependencies (`npm install`).
- Uploads failing: verify Cloudinary credentials and that `CLOUDINARY_*` vars are set.
- CORS or connection errors from the frontend: ensure the backend URL is reachable and CORS is configured.

## Tests

There are no automated tests included by default. Adding a small test suite (Jest / supertest) for key API endpoints is recommended as a next step.

## Contributing

Contributions are welcome. If you plan to contribute:

1. Fork the repo
2. Create a feature branch
3. Open a pull request with a clear description of changes

Be careful not to commit secret keys or `.env` files.

## License

This project does not include a license file. If you want to publish it publicly, consider adding an OSI-approved license such as MIT.

## Contact

If you have questions, open an issue or contact the repository owner.

---

Thanks for checking out Video-App — enjoy exploring and extending it!
