
# OpenShelf Analytics

A professional visitor management and facility analytics system for New Era University.

## 🚀 Deployment Guide

This project is built for **Firebase App Hosting**. This is the modern way to deploy Next.js apps with Genkit AI features.

### Automated Deployment (Recommended)
1. Push your code to a GitHub repository.
2. Go to the [Firebase Console](https://console.firebase.google.com/).
3. Create an **App Hosting** backend and connect your GitHub repo.
4. Firebase will automatically build and deploy your app on every push.

### CLI Configuration
The `firebase.json` is configured for **Web Frameworks**. If you choose to deploy via CLI, ensure you have the experiment enabled:
```bash
firebase experiments:enable webframeworks
firebase deploy
```

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (App Router)
- **AI:** Genkit (Google Gemini 1.5 Flash)
- **Database/Auth:** Firebase Firestore & Firebase Auth
- **UI:** Tailwind CSS & ShadCN Components
