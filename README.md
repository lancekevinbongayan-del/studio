
# OpenShelf Analytics 📊

A professional visitor management and facility analytics system for New Era University.

## 🌐 Live Application
The application is hosted at: **[https://studio-8706353121-4d298.web.app](https://studio-8706353121-4d298.web.app)**

## 🚀 Deployment Guide (IMPORTANT)

If you see the "Firebase Hosting Setup Complete" default page instead of the app, follow these **CRITICAL** steps in your terminal:

### 1. Enable Web Frameworks
This allows Firebase to build your Next.js project dynamically:
```bash
firebase experiments:enable webframeworks
```

### 2. Delete Static Placeholders
**IMPORTANT:** Delete any files named `index.html` or `404.html` in your root directory or the `Libtrack-analytics` folder. These static files block your dynamic app from loading.

### 3. Deploy the App
Run the following command to rebuild and deploy the dynamic backend:
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
