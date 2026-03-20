
# OpenShelf Analytics

A professional visitor management and facility analytics system for New Era University.

## 🚀 Deployment Guide

This project is built for **Firebase App Hosting** (Recommended).

### Path A: Firebase App Hosting (Automated)
1. Push your code to a GitHub repository.
2. Go to the [Firebase Console](https://console.firebase.google.com/).
3. Create an **App Hosting** backend and connect your GitHub repo.
4. Firebase will automatically build and deploy your dynamic Next.js app on every push.

### Path B: Firebase CLI Deployment (Local Build)
If you prefer deploying via the terminal, you **must** enable the webframeworks experiment:
```bash
# 1. Enable the required experiment
firebase experiments:enable webframeworks

# 2. Deploy the application
firebase deploy
```

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (App Router)
- **AI:** Genkit (Google Gemini 1.5 Flash)
- **Database/Auth:** Firebase Firestore & Firebase Auth
- **UI:** Tailwind CSS & ShadCN Components
