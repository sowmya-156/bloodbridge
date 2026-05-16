# BloodBridge - Donate Blood. Save Lives.

A modern, production-ready web platform connecting blood donors with recipients across India.

## Features
- Donor search by blood group and city
- Emergency blood requests with urgency levels
- Donor registration with geolocation
- Firebase Auth (signup/login/logout)
- Protected dashboard routes
- Dark/light mode toggle
- Mobile-responsive design
- Blood compatibility chart
- Toast notifications & loading skeletons

## Tech Stack
React 18 + Vite, Tailwind CSS v4, Firebase Auth + Firestore, React Router v6, Framer Motion

## Quick Start

1. `npm install`
2. `cp .env.example .env.local` and fill in Firebase credentials
3. `npm run dev`

## Firebase Setup
1. Create project at console.firebase.google.com
2. Enable Email/Password Authentication
3. Create Firestore database
4. Copy web app config to .env.local

## Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /donors/{donorId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /emergencyRequests/{reqId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Deploy to Vercel
`vercel --prod` (add VITE_FIREBASE_* env vars in dashboard)

## Deploy to Netlify
`npm run build` then drag dist/ folder, or connect GitHub repo with build command `npm run build`, publish dir `dist`
