# SPOV API Reference

This document explains how the API works — what authentication is, what a JWT token is, how roles and permissions control access, and how to use every endpoint. It is written for developers who may not have worked with authentication and authorization before.

---

## Table of Contents

1. [Concepts: Authentication vs Authorization](#1-concepts-authentication-vs-authorization)
2. [How Authentication Works (Getting a Token)](#2-how-authentication-works-getting-a-token)
3. [How to Use Your Token](#3-how-to-use-your-token)
4. [How Authorization Works (Roles and Policies)](#4-how-authorization-works-roles-and-policies)
5. [All API Endpoints](#5-all-api-endpoints)
6. [Error Handling](#6-error-handling)
7. [Testing with curl](#7-testing-with-curl)
8. [Frontend Routes — Partner Area](#8-frontend-routes--partner-area)
9. [Authorization Matrix (Visual Summary)](#9-authorization-matrix-visual-summary)

---

## 1. Concepts: Authentication vs Authorization

These two concepts are the foundation of the API. They are different but work together:

| Concept | Meaning | Analogy |
|---------|---------|---------|
| **Authentication** | "Who are you?" — proving your identity | Showing your ID card at the door |
| **Authorization** | "What are you allowed to do?" — what actions you can perform | The door only opens if your ID says "Employee" |

**Step 1 — Authenticate:** You send your email and password to the login endpoint. The server checks them, and if valid, gives you a **JWT token** (a digital pass).

**Step 2 — Authorize:** For every request after that, you include the token. The server reads it, identifies you, checks your **role** (Administrator or Partner), and decides if you're allowed to do what you're asking.

---

## 2. How Authentication Works (Getting a Token)

Authentication is handled by **ASP.NET Core Identity**, a built-in .NET system that manages user accounts, passwords, and roles. All auth endpoints are under `/api/auth`.

### The Login Flow (Step by Step)

```
You (or your app)                    API                          Database
      │                               │                              │
      │  POST /api/auth/login         │                              │
      │  { email, password }          │                              │
      │──────────────────────────────>│                              │
      │                               │  Find user + check password  │
      │                               │─────────────────────────────>│
      │                               │<─────────────────────────────│
      │                               │  Valid?                      │
      │  200 OK                       │                              │
      │  {                            │                              │
      │    accessToken: "eyJ...",     │  ←── This is the JWT token   │
      │    tokenType: "Bearer",       │                              │
      │    expiresIn: 3600            │  (1 hour until expiry)       │
      │  }                            │                              │
      │<──────────────────────────────│                              │
```

### What is a JWT Token?

A **JWT (JSON Web Token)** is a long string that looks like this:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6IkFkbWluaXN0cmF0b3IifQ.dQw4w9WgXcQ
```

It has three parts separated by dots:
1. **Header** — tells what type of token and how it's signed
2. **Payload** — contains information about the user (their ID, email, roles, expiry time)
3. **Signature** — a cryptographic proof that the token was issued by the server and hasn't been tampered with

**Important:** You cannot create a fake token. Only the server can issue valid ones. Your app just stores the token and sends it along.

### Auth Endpoints

| Method | Path | Description | What it does |
|--------|------|-------------|-------------|
| POST | `/api/auth/register` | Register a new user | Creates a basic account (email + password). Not used directly — use partner registration instead. |
| POST | `/api/auth/login` | Login | **The most important endpoint.** Send email + password, get back a JWT token. |
| POST | `/api/auth/refresh` | Refresh token | When your token expires, use this to get a new one without logging in again. |
| POST | `/api/auth/logout` | Logout | Invalidates the refresh token so the session ends. |
| POST | `/api/auth/forgotPassword` | Forgot password | Sends a password reset email. |
| POST | `/api/auth/resetPassword` | Reset password | Resets your password using a code sent by email. |
| GET | `/api/auth/manage/info` | Get profile | Returns your current user info (email, etc.). Requires token. |
| POST | `/api/auth/manage/info` | Update profile | Updates your user info. Requires token. |

---

## 3. How to Use Your Token

Once you have a token, you must send it with every request that requires authentication.

### Where to Put the Token

Add an HTTP header called `Authorization` with the value `Bearer <your-token>`:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example with curl

**Step 1 — Login to get a token:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@spov.pt", "password": "Admin123!"}'
```
This returns a response like:
```json
{
  "accessToken": "eyJhbGciOiJ...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

**Step 2 — Use the token to call a protected endpoint:**
```bash
curl http://localhost:8080/api/partners \
  -H "Authorization: Bearer eyJhbGciOiJ..."
```

Replace `eyJhbGciOiJ...` with the actual token you received.

### What Happens If You Don't Send a Token

If you call a protected endpoint without a token (or with an expired/invalid one), you get:
```json
{
  "status": 401,
  "title": "Unauthorized"
}
```

### What Happens If You Have a Token but the Wrong Role

If you have a valid token but your role doesn't allow the action, you get:
```json
{
  "status": 403,
  "title": "Forbidden"
}
```

---

## 4. How Authorization Works (Roles and Policies)

### Roles

A **role** is a label that the server assigns to a user. The API uses two roles:

| Role | Who has it | What they can do |
|------|-----------|-----------------|
| `Administrator` | Admin staff | Everything — create events, approve partners, manage news, etc. |
| `Partner` | Registered SPOV members | View their own profile, access documents, register for events |

When a user registers through `/api/partners/register`, the server automatically assigns them the `Partner` role. The `Administrator` role is set manually.

### Policies

A **policy** is a rule that checks roles. The API has three policies:

| Policy | Who can pass | What endpoints use it |
|--------|-------------|----------------------|
| `AdminOnly` | Only users with `Administrator` role | Creating events, managing partners, approving members, admin-only lists |
| `PartnerOrAdmin` | Users with either `Partner` or `Administrator` role | Document access |
| `[Authorize]` (no named policy) | Any authenticated user (any role) | Viewing your own profile, registering for events |

### Visual: Who Can Do What

```
                    ┌─────────────────┐
                    │   Any Visitor   │  (no token needed)
                    │  (unauthenticated) │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
     ┌────────────────┐ ┌──────────┐ ┌──────────────┐
     │  Public        │ │ /api/auth│ │ /api/partners │
     │  endpoints     │ │ /login   │ │ /register     │
     │  (health,      │ │          │ │               │
     │   events list, │ │          │ │               │
     │   news, etc.)  │ │          │ │               │
     └────────────────┘ └──────────┘ └──────────────┘
                                          │
                                   Token received
                                          │
                                          ▼
                              ┌─────────────────────┐
                              │   Authenticated      │
                              │   (has a JWT token)  │
                              └──────────┬──────────┘
                                         │
                            ┌────────────┼────────────┐
                            │            │            │
                            ▼            ▼            ▼
                   ┌────────────┐ ┌──────────┐ ┌──────────────┐
                   │ Partner    │ │ Admin    │ │ Any Auth     │
                   │ role       │ │ role     │ │ (profile,    │
                   │ (documents)│ │ (events, │ │  registrations)│
                   │            │ │  partners│ │              │
                   └────────────┘ └──────────┘ └──────────────┘
```

### Seed Data (Pre-loaded on First Run)

When the application starts for the first time, it creates:

| Type | Value |
|------|-------|
| Administrator user | `admin@spov.pt` / `Admin123!` |
| Roles created | `Administrator`, `Partner` |

This means you can immediately log in as admin and start using the system.

---

## 5. All API Endpoints

### Health

| Method | Path | Auth | Who can call | Description |
|--------|------|------|-------------|-------------|
| GET | `/health` | No | Anyone | Returns `OK` if the API is running. Useful for monitoring. |

---

### Auth (`/api/auth`)

| Method | Path | Auth | Who can call | Description |
|--------|------|------|-------------|-------------|
| POST | `/api/auth/login` | No | Anyone | Login with email + password. Returns a JWT token. |
| POST | `/api/auth/register` | No | Anyone | Register a new basic user account. |
| POST | `/api/auth/refresh` | Token | Authenticated | Get a new token when the current one expires. |
| POST | `/api/auth/logout` | Yes | Authenticated | End the current session. |
| POST | `/api/auth/confirmEmail` | No | Anyone | Confirm an email address using a code. |
| POST | `/api/auth/resendConfirmationEmail` | No | Anyone | Request a new confirmation email. |
| POST | `/api/auth/forgotPassword` | No | Anyone | Request a password reset email. |
| POST | `/api/auth/resetPassword` | No | Anyone | Reset the password using a code. |
| GET | `/api/auth/manage/info` | Yes | Authenticated | Get the current user's profile info. |
| POST | `/api/auth/manage/info` | Yes | Authenticated | Update the current user's profile info. |
| POST | `/api/auth/manage/2fa` | Yes | Authenticated | Manage two-factor authentication settings. |

---

### Partners (`/api/partners`)

These endpoints manage SPOV members (sócios).

| Method | Path | Auth | Policy | Who can call | Description |
|--------|------|------|--------|-------------|-------------|
| POST | `/api/partners/register` | No | Public | **Anyone** | **Register as a new partner.** Creates an ApplicationUser with Partner role AND a Partner profile with status "Pending". Takes name, email, password, phone, and optional fields. |
| GET | `/api/partners` | Yes | AdminOnly | **Admin only** | List all partners with their status. |
| GET | `/api/partners/{id}` | Yes | AdminOnly | **Admin only** | Get a specific partner by ID. |
| GET | `/api/partners/me` | Yes | [Authorize] | **Any authenticated user** | Get your own partner profile (you must have a Partner entity linked to your user). |
| GET | `/api/partners/my-profile` | Yes | [Authorize] | **Any authenticated user** | Get your full partner profile including payment history. |
| POST | `/api/partners/{id}/approve` | Yes | AdminOnly | **Admin only** | **Approve a pending partner.** Changes their MembershipStatus from "Pending" to "Active". |

**Detailed: Register a new partner (`POST /api/partners/register`):**

This is a special endpoint that does two things at once:
1. Creates a user account (an `ApplicationUser` with the `Partner` role)
2. Creates a `Partner` profile with status `Pending`

The password you provide is hashed and stored securely. It is never stored in plain text.

**Required fields:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+351 900 000 000",
  "partnerType": "Professional"
}
```

---

### Events (`/api/events`)

| Method | Path | Auth | Policy | Who can call | Description |
|--------|------|------|--------|-------------|-------------|
| GET | `/api/events` | No | Public | Anyone | List all events. |
| GET | `/api/events/{id}` | No | Public | Anyone | Get details of a specific event. |
| POST | `/api/events` | Yes | AdminOnly | **Admin only** | Create a new event. |
| PUT | `/api/events/{id}` | Yes | AdminOnly | **Admin only** | Update an existing event. |
| DELETE | `/api/events/{id}` | Yes | AdminOnly | **Admin only** | Delete an event. |

---

### Event Registrations (`/api/events/{eventId}/registrations`)

| Method | Path | Auth | Policy | Who can call | Description |
|--------|------|------|--------|-------------|-------------|
| GET | `/api/events/{eventId}/registrations` | Yes | AdminOnly | **Admin only** | List all registrations for an event. |
| POST | `/api/events/{eventId}/registrations` | Yes | [Authorize] | **Any authenticated user** | Register yourself for an event. |

---

### News (`/api/news`)

| Method | Path | Auth | Policy | Who can call | Description |
|--------|------|------|--------|-------------|-------------|
| GET | `/api/news` | No | Public | Anyone | List all news posts. |
| GET | `/api/news/{id}` | No | Public | Anyone | Get a specific news post. |
| POST | `/api/news` | Yes | AdminOnly | **Admin only** | Create a news post. |
| PUT | `/api/news/{id}` | Yes | AdminOnly | **Admin only** | Update a news post. |
| DELETE | `/api/news/{id}` | Yes | AdminOnly | **Admin only** | Delete a news post. |

---

### Articles (`/api/articles`)

| Method | Path | Auth | Policy | Who can call | Description |
|--------|------|------|--------|-------------|-------------|
| GET | `/api/articles` | No | Public | Anyone | List all articles. |
| POST | `/api/articles` | Yes | AdminOnly | **Admin only** | Create a new article. |

---

### Contacts (`/api/contacts`)

| Method | Path | Auth | Policy | Who can call | Description |
|--------|------|------|--------|-------------|-------------|
| POST | `/api/contacts` | No | Public | Anyone | Submit a contact message (name, email, subject, message). |

---

### Membership Tiers (`/api/membership-tiers`)

| Method | Path | Auth | Policy | Who can call | Description |
|--------|------|------|--------|-------------|-------------|
| GET | `/api/membership-tiers` | No | Public | Anyone | List all membership plans. |
| GET | `/api/membership-tiers/{id}` | Yes | AdminOnly | **Admin only** | Get details of a specific tier. |

---

### Payments (`/api/partners/{partnerId}/payments`)

| Method | Path | Auth | Policy | Who can call | Description |
|--------|------|------|--------|-------------|-------------|
| GET | `/api/partners/{partnerId}/payments` | Yes | AdminOnly | **Admin only** | List all payments for a given partner. |

---

### Documents (`/api/documents`)

| Method | Path | Auth | Policy | Who can call | Description |
|--------|------|------|--------|-------------|-------------|
| GET | `/api/documents` | Yes | PartnerOrAdmin | **Partner or Admin** | List documents. Partners see only their own; admins see all. |

---

### Admin Users (`/api/admin-users`)

| Method | Path | Auth | Policy | Who can call | Description |
|--------|------|------|--------|-------------|-------------|
| GET | `/api/admin-users` | Yes | AdminOnly | **Admin only** | List all admin users. |

---

## 6. Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ErrorType",
    "message": "Human-readable description of what went wrong."
  }
}
```

### Error Types

| Error Code | HTTP Status | Meaning | What to do |
|-----------|-------------|---------|------------|
| `NotFound` | 404 | The resource you requested doesn't exist | Check the ID in the URL |
| `Validation` | 400 | The data you sent is invalid | Check field names, types, and required fields |
| `Conflict` | 409 | The data conflicts with existing data (e.g. duplicate email) | Use a different value |
| `Unauthorized` | 401 | You are not logged in or your token is invalid/expired | Log in again to get a fresh token |
| `Forbidden` | 403 | You are logged in but don't have permission | Your role doesn't allow this action |
| `InternalError` | 500 | Something went wrong on the server | Contact the development team |

### Common Scenarios

**Sending invalid data (400 Bad Request):**
```json
{
  "error": "The Email field is not a valid e-mail address."
}
```

**Trying to register with an existing email (409 Conflict):**
```json
{
  "error": "Já existe um utilizador com este email."
}
```

**Calling an admin endpoint without being admin (403 Forbidden):**
```json
{
  "error": "Forbidden"
}
```

---

## 7. Testing with curl

### 1. Login as admin
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@spov.pt", "password": "Admin123!"}'
```
Save the `accessToken` from the response.

### 2. List all partners (admin only)
```bash
curl http://localhost:8080/api/partners \
  -H "Authorization: Bearer <accessToken>"
```

### 3. Approve a pending partner (admin only)
```bash
curl -X POST http://localhost:8080/api/partners/1/approve \
  -H "Authorization: Bearer <accessToken>"
```
Replace `1` with the actual partner ID.

### 4. Register as a new partner (public, no token needed)
```bash
curl -X POST http://localhost:8080/api/partners/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Maria Santos",
    "email": "maria@example.com",
    "password": "SecurePass123!",
    "phone": "+351 900 000 000",
    "partnerType": "Professional"
  }'
```

### 5. Login as a partner
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "maria@example.com", "password": "SecurePass123!"}'
```

### 6. View your own profile (authenticated, any role)
```bash
curl http://localhost:8080/api/partners/my-profile \
  -H "Authorization: Bearer <partnerToken>"
```

---

## 8. Frontend Routes — Partner Area

The Angular frontend has dedicated pages for partners:

| Path | Page | Auth Required | Description |
|------|------|-------------|-------------|
| `/socios/login` | Login | No | Login form. Enter email + password to get a JWT token. |
| `/socios/aderir` | Register | No | Registration form. Creates a new partner account with status "Pending". |
| `/socios/perfil` | Profile | **Yes** | View your profile, membership status, and payment history. Protected by `PartnerAuthGuard`. |

### How the Frontend Auth Flow Works

```
1. User visits /socios/login
2. Types email + password, clicks "Iniciar Sessão"
3. Frontend calls: POST /api/auth/login { email, password }
4. API returns: { accessToken: "eyJ...", tokenType: "Bearer", expiresIn: 3600 }
5. Frontend saves the token in browser localStorage as "spov_token"
6. User is redirected to /socios/perfil
7. Profile page calls: GET /api/partners/my-profile
   (the token is automatically sent in the Authorization header)
8. API verifies the token, looks up the partner, returns the profile
9. User sees their name, membership status, payments, etc.
```

### What is localStorage?

`localStorage` is a storage area in the browser that persists even after you close the tab. The token is stored there so the user stays logged in until they click "Sair" (Logout) or the token expires.

### Admin Frontend Routes

| Path | Page | Auth Required | Description |
|------|------|-------------|-------------|
| `/admin/login` | Admin Login | No | Admin login form. |
| `/admin` | Layout | **Yes** | Redirects to `/admin/eventos`. Protected by `AuthGuard`. |
| `/admin/eventos` | Manage Events | **Yes** | Create, edit, and delete events. |
| `/admin/socios` | Manage Partners | **Yes** | View all partners and approve pending ones. |

> **Note:** Admin and partner authentication share the same token key (`spov_token` in localStorage). The difference is the user's role, which is enforced server-side. An admin can do everything a partner can, plus admin-only operations.

---

## 9. Authorization Matrix (Visual Summary)

```
                    ┌──────────────────────────────────────┐
                    │              LEGEND                   │
                    │  🔓 Public (no token needed)          │
                    │  🔐 Any Authenticated (any role)      │
                    │  🛡️ Partner or Admin                   │
                    │  🔒 Admin Only                        │
                    └──────────────────────────────────────┘


  🔓 PUBLIC                    🔐 AUTHENTICATED          🛡️ PARTNER/ADMIN      🔒 ADMIN ONLY
  ────────────                 ────────────────          ────────────────       ────────────
  POST /api/auth/login         GET /api/partners/me      GET /api/documents     GET /api/partners
  POST /api/auth/register      GET /api/partners/                              GET /api/partners/{id}
  POST /api/partners/register     my-profile                                   POST /api/partners/{id}/approve
  GET /health                  POST /api/events/*/                             POST /api/events
  GET /api/events                  registrations                               PUT /api/events/{id}
  GET /api/events/{id}                                                         DELETE /api/events/{id}
  GET /api/news                                                               GET /api/events/*/registrations
  GET /api/news/{id}                                                          POST /api/news
  GET /api/articles                                                           PUT /api/news/{id}
  POST /api/contacts                                                          DELETE /api/news/{id}
  GET /api/membership-tiers                                                    POST /api/articles
                                                                              GET /api/membership-tiers/{id}
                                                                              GET /api/partners/*/payments
                                                                              GET /api/admin-users
```

---

### About the Technology Stack

| Component | Technology |
|-----------|-----------|
| API Framework | ASP.NET Core 10 (C#) |
| Authentication | ASP.NET Core Identity + JWT Bearer tokens |
| Database | PostgreSQL 17 |
| ORM | Entity Framework Core 10 |
| Frontend | Angular 20 (standalone components) |
| Password storage | PBKDF2 with SHA-256, random salt, multiple iterations — passwords are **never** stored in plain text |

The `Microsoft.AspNetCore.Identity` package generates all the login/register/manage endpoints automatically. The authorization policies and role checks are configured in `Program.cs` using simple policy definitions like:
```csharp
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", policy => policy.RequireRole(Roles.Administrator));
```