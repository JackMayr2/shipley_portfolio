# Portfolio Website

A modern, single-page portfolio website for a graphic designer specializing in the sports industry. Built with Next.js, Firebase, and Tailwind CSS.

## Features

- **Single-page design** with smooth scrolling sections
- **Bio/Profile section** with customizable information
- **Project galleries** organized by category
- **Admin dashboard** for CRUD operations on profile and designs
- **Image upload** functionality for design portfolios
- **Social media links** footer
- **Password-protected admin route** at `/admin`

## Tech Stack

- **Frontend**: Next.js 14 (App Router) with React and TypeScript
- **Backend**: Firebase (Firestore for data, Firebase Storage for images)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Firebase Storage
4. Get your Firebase configuration from Project Settings

### 3. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Admin Password (for /admin route)
ADMIN_PASSWORD=your_secure_password_here
```

### 4. Firebase Security Rules

Set up Firestore security rules (allow read for all, write only for authenticated users or adjust as needed):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if false; // Admin writes handled server-side or with admin SDK
    }
  }
}
```

Set up Storage security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /designs/{designId}/{fileName} {
      allow read: if true;
      allow write: if false; // Admin writes handled server-side or with admin SDK
    }
  }
}
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

Access the admin dashboard at [http://localhost:3000/admin](http://localhost:3000/admin) using the password set in `ADMIN_PASSWORD`.

## Project Structure

```
shipley_portfolio/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main portfolio page
│   ├── admin/
│   │   └── page.tsx        # Admin dashboard
│   └── api/
│       └── admin/
│           └── verify/route.ts  # Password verification
├── components/
│   ├── BioSection.tsx      # Bio/profile section
│   ├── ProjectSection.tsx  # Projects/collections section
│   ├── SocialLinks.tsx     # Social media links footer
│   ├── AdminPanel.tsx      # CRUD interface
│   └── DesignUpload.tsx    # Image upload component
├── lib/
│   ├── firebase.ts         # Firebase configuration
│   ├── firestore.ts        # Firestore helper functions
│   └── storage.ts          # Firebase Storage helpers
└── types/
    └── index.ts            # TypeScript types
```

## Usage

### Admin Dashboard

1. Navigate to `/admin` in your browser
2. Enter the admin password
3. Use the **Profile** tab to update your bio, name, title, and social links
4. Use the **Designs** tab to:
   - Upload new design images
   - Edit design details (title, description, category)
   - Delete designs

### Adding Content

- **Profile**: Update your profile information through the admin dashboard
- **Designs**: Upload images with titles, descriptions, and categories
- **Categories**: Designs are automatically grouped by category on the main page

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your environment variables in Vercel's project settings
4. Deploy!

The environment variables from `.env.local` need to be added to Vercel's environment variables section.

## License

MIT
