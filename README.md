# FitZone - Gym Membership Frontend

A modern React frontend for gym membership management with authentication, visit scheduling, and member dashboard.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Axios** for API requests
- **Zod** for form validation
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Replace with your actual API base URL in production.

## Routes

| Route | Page | Auth Required | Description |
|-------|------|---------------|-------------|
| `/` | PublicHome | No | Landing page with plans and categories |
| `/signup` | CreateAccount | No* | Account creation with contract code validation |
| `/plan-visit` | PlanVisit | No | Schedule a gym visit |
| `/login` | Login | No | Member login |
| `/member` | MemberDashboard | Yes | Protected member area with schedule |

\* Signup form is locked until a valid contract code is entered.

## Auth Flow

1. **Login Flow**:
   - User enters email/password on `/login`
   - On success, JWT is stored in localStorage
   - AuthContext is updated and user redirected to `/member`
   - 403 errors show subscription inactive message

2. **Signup Flow**:
   - User must first validate a contract code
   - Form fields are disabled until code validation succeeds
   - On successful signup, JWT is stored and user redirected to `/member`

3. **Protected Routes**:
   - Routes wrapped with `ProtectedRoute` component
   - Checks for valid JWT and active subscription
   - Redirects to `/login` if not authenticated

4. **State Management**:
   - `AuthContext` manages token, user, subscription, and plan state
   - On app load, if token exists, `/api/auth/me` is called to hydrate state
   - `logout()` clears all state and redirects to home

## API Integration

The frontend expects these endpoints (see `src/lib/api.ts`):

- `GET /api/public/plans` - Fetch available plans
- `GET /api/public/categories` - Fetch activity categories
- `POST /api/visits` - Submit visit request
- `POST /api/contract-codes/validate` - Validate contract code
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Authenticate
- `GET /api/auth/me` - Get current user info
- `GET /api/member/schedule` - Get class schedule (with filters)
