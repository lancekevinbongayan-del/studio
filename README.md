
# OpenShelf Analytics 📊

A professional visitor management and facility analytics system for New Era University.

## 🌐 Live Application
The application is hosted at: **[https://studio-8706353121-4d298.web.app](https://studio-8706353121-4d298.web.app)**

## 🚀 Deployment Guide (IMPORTANT)

If you see the "Firebase Hosting Setup Complete" default page instead of the app, follow these steps:

### 1. Enable Web Frameworks
Ensure your CLI supports dynamic Next.js building:
```bash
firebase experiments:enable webframeworks
```

### 2. Remove Static Conflicts
**CRITICAL:** Delete the default `index.html` and `404.html` files from your root directory if they exist. These static files override your dynamic Next.js application.

### 3. Deploy the App
Run the following command to build and deploy the dynamic backend:
```bash
firebase deploy
```

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (App Router)
- **AI:** Genkit (Google Gemini 2.5 Flash)
- **Database/Auth:** Firebase Firestore & Firebase Auth
- **UI:** Tailwind CSS & ShadCN Components

---
© 2025 New Era University. Authorized Institutional Access Only.
