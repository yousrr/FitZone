# Firebase backend setup (FitZone)

This backend uses Firebase Cloud Functions + Firestore + Firebase Auth.
It exposes the same REST API the frontend calls from `src/lib/api.ts`.

## Requirements

- Firebase CLI installed
- Firebase project created
- Firestore and Auth enabled

## Setup

1) Copy env template and add your Firebase Web API key:

```bash
cp functions/.env.example functions/.env
```

Set `FIREBASE_API_KEY` in `functions/.env`.
You can find this key in the Firebase console:
Project Settings -> General -> Web API Key.

2) Initialize Firebase (one time):

```bash
firebase login
firebase use --add
```

3) Install dependencies:

```bash
cd functions
npm install
```

4) Run emulators:

```bash
npm run serve
```

This exposes functions at:
`http://localhost:5001/<project-id>/us-central1/api`

Set `VITE_API_BASE_URL` in your frontend `.env` to that URL.

## Data model

Collections used:

- `plans` (id, name, price, billingPeriod, features[])
- `categories` (id, name)
- `schedule` (title, dayOfWeek, startTime, endTime, category, room?, coach{name, specialties[]})
- `contractCodes` (doc id = code, status, planId, expiresAt?, usedBy?, usedAt?)
- `users` (userId, email, firstName, lastName, dateOfBirth, trainingFrequency, createdAt)
- `subscriptions` (userId, planId, status, startDate, endDate)
- `visits` (fullName, phone, preferredDate, preferredTime, message, createdAt)

If `plans`, `categories`, or `schedule` are empty, the API returns defaults.

## Contract codes

Create a contract code document with ID like `GYM-1234`:

```
contractCodes/GYM-1234
{
  "status": "ACTIVE",
  "planId": "pro"
}
```

## Deploy

```bash
cd functions
npm run build
firebase deploy --only functions
```
