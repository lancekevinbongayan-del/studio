
# OpenShelf Analytics 📊

A professional visitor management and facility analytics system for New Era University.

## 🌐 Live Application
The application is hosted at: **[https://studio-8706353121-4d298.web.app](https://studio-8706353121-4d298.web.app)**

## 🚀 Deployment Guide

This project is optimized for dynamic deployment. Follow the steps below to see your app live.

### Path A: Firebase CLI Deployment (Recommended for Dev)
If you are deploying from your terminal, you **must** use the webframeworks integration:

1. **Enable the Experiment:**
   ```bash
   firebase experiments:enable webframeworks
   ```

2. **Deploy the App:**
   ```bash
   firebase deploy
   ```
   *Note: This command will now automatically detect Next.js, build the project, and deploy the dynamic functions and hosting assets.*

### Path B: Firebase App Hosting (Automated)
1. Push your code to a GitHub repository.
2. Connect your repo in the [Firebase Console](https://console.firebase.google.com/) under **App Hosting**.
3. Firebase will handle every build and deployment automatically on every push.

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (App Router)
- **AI:** Genkit (Google Gemini 1.5 Flash)
- **Database/Auth:** Firebase Firestore & Firebase Auth
- **UI:** Tailwind CSS & ShadCN Components

---
© 2025 New Era University. Authorized Institutional Access Only.
