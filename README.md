# LibTrack Analytics

A QR-based library and academic office visitor management system for New Era University.

## 📜 Description
LibTrack Analytics is a comprehensive visitor management system focusing on institutional authentication, role-based dashboards, and real-time usage statistics. It streamlines the check-in process for students while providing administrators with AI-powered insights into facility usage.

## 🚀 Key Features
- **Institutional Authentication:** Secure login restricted to `@neu.edu.ph` domains using Firebase Auth.
- **Quick Visitor Check-in:** Anonymous, password-free check-in flow for students and faculty.
- **Real-time Statistics Dashboard:** Live monitoring of active sessions and visitor volume using Firestore `onSnapshot`.
- **Dean's Office Queue:** Real-time waiting room management for academic appointments.
- **User Management:** Administrative control to block or restrict user access.
- **AI Summary Reports:** LLM-powered analytics (via Genkit) to identify peak hours and common visit reasons.

## 🛠️ Technologies Used
- **Language:** TypeScript
- **Framework:** Next.js (App Router)
- **Library:** React
- **UI Components:** ShadCN UI (Radix UI)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Backend/Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **AI Integration:** Firebase Genkit with Google Generative AI
- **Hosting:** Firebase App Hosting
