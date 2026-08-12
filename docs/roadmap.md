# SPOV Project Roadmap — Missing Features & Work to Implement

## 1. Testing

### 1.1 Frontend Tests (Critical — AGENTS.md mandates TDD)

No `.spec.ts` files exist. Every component, service, and guard needs tests.

| File | Test type | What to test |
|------|-----------|--------------|
| `pages/*.component.ts` (all ~15 pages) | Unit | Render states: loading, empty, error, success. Template logic (`@if` branches, computed values). |
| `shared.components.ts` | Unit | Header, Footer, PageIntro, Logo, EventMeta render correctly with/without inputs. Header menu toggle, auth state. |
| `form.components.ts` | Unit | Form field rendering, error display, label association. |
| `guards/auth.guard.ts` | Unit | Allow when authenticated, redirect when not. |
| `guards/partner-auth.guard.ts` | Unit | Same as above. |
| `services/*.service.ts` | Unit | HTTP calls, error handling, token injection. |
| `app.routes.ts` | Integration | Route resolution, guard activation, title metadata. |

### 1.2 Backend Test Coverage

Current: 34 tests. Missing coverage for:

- Events controller (create, update, delete policies)
- Partner registration validation edge cases
- Auth flow (login failure, token expiry, refresh)
- Partner approve flow
- Contact submission
- Membership tiers endpoint
- Error handling middleware
- Input validation (null/empty fields, invalid IDs)

---

## 2. Frontend — Components & Pages

### 2.1 Missing Admin Features

| Feature | Reason |
|---------|--------|
| **Admin dashboard** — `/admin` should show stats (total partners, pending approvals, upcoming events) | Currently redirects straight to events. No overview. |
| **Partner detail page** in admin | Can list partners but cannot view/edit an individual partner's full profile. |
| **Edit partner** in admin | No way to update partner data or membership tier. |
| **Delete partner** in admin | No way to remove a partner. |
| **Event registration list** in admin | API exists (`GET /api/events/{id}/registrations`) but no frontend page to see who registered. |
| **Payment verification workflow** — mark payments as received | Admin cannot see payment proofs or mark them as verified. |
| **Article management** | API endpoints exist but no admin frontend for article CRUD. |

### 2.2 Missing Partner Features

| Feature | Reason |
|---------|--------|
| **Password reset page** | API has `forgotPassword`/`resetPassword` but no frontend UI. |
| **Edit own profile** | Partner cannot update their own info after registration. |
| **Upload payment proof** after registration | The profile shows a proof URL but there is no upload form on the registration success page or in the profile. |
| **Event registration from partner profile** | No way for partners to see or manage their event registrations. |
| **Documents page** | API has document endpoints but no frontend page for partners to access documents. |

### 2.3 Missing Public Pages

| Feature | Reason |
|---------|--------|
| **Article listing** | API has `/api/articles` but no frontend page. |
| **Single article page** | No detail page for articles. |
| **404 Not Found page** | Currently redirects to `/`. Should show a meaningful "Página não encontrada" page instead. |

### 2.4 Component-Level Gaps (per AGENTS.md)

| Requirement | Current state |
|-------------|---------------|
| **Lazy loading for feature routes** | All components are eagerly loaded. Routes should use `loadComponent`. |
| **Signals for state management** | All state uses plain class properties. Should migrate to signals + `computed()`. |
| **Signal Forms** | Still using ReactiveForms. Signal forms (`@angular/forms/signals`) preferred per AGENTS.md. |
| **`NgOptimizedImage`** for static images | Images use standard `<img>` — should use `NgOptimizedImage` directive. |
| **`@Service` decorator** over `@Injectable` | Services use `@Injectable` — should use the `@Service` decorator (Angular v22+). |
| **`host` object** instead of `@HostListener`/`@HostBinding` | `app.component.ts` still uses `@HostListener('window:scroll')`. |
| **AXE accessibility checks** | Never run. Must verify WCAG AA compliance. |
| **Inline styles elimination** | Several components still use `style="..."` attributes (e.g., membership component, partner login, partner profile error banner). |
| **Loading states & skeletons** | Most pages show plain text ("A carregar…") instead of styled skeleton or spinner. |

---

## 3. Backend — API & Business Logic

### 3.1 Missing Endpoints

| Endpoint | Why needed |
|----------|------------|
| `PUT /api/partners/{id}` | Admin edits partner data. |
| `DELETE /api/partners/{id}` | Admin removes a partner. |
| `PUT /api/partners/me` | Partner updates their own profile. |
| `POST /api/partners/{id}/verify-payment` | Admin marks a payment as verified. |
| `GET /api/dashboard/stats` | Admin dashboard statistics (counts by status). |
| `GET /api/partners/{id}/payments/proofs` | List payment proof files for a partner. |
| `POST /api/partners/me/payment-proof` | Partner uploads payment proof. (May already exist — verify `uploadProof()` wiring.) |

### 3.2 Missing Business Logic

| Feature | Reason |
|---------|--------|
| **Email notifications** | No emails sent on registration, approval, password reset, or event confirmation. API has `forgotPassword`/`resetPassword` but SMTP may not be configured. |
| **Payment expiry / membership renewal** | No automated logic to expire memberships or send renewal reminders. |
| **Audit logging** | No record of who approved which partner or when. |
| **Rate limiting** | No protection against brute-force login attempts. |
| **Input validation consistency** | Some endpoints may lack proper validation attributes or return inconsistent error shapes. |

---

## 4. Infrastructure & DevOps

### 4.1 CI/CD

| Missing | Details |
|---------|---------|
| **GitHub Actions workflow** | No CI pipeline. Should run `dotnet test` and `ng build` on every push/PR. |
| **Docker Compose for CI** | Tests need a PostgreSQL service. Should add a `docker-compose.ci.yml` for test runs. |
| **Test coverage reporting** | No coverage thresholds or reports generated. |
| **Deployment pipeline** | No staging/production deployment. Could add Docker image build + push. |

### 4.2 Docker

| Missing | Details |
|---------|---------|
| **Health checks** in compose | Containers have `restart: unless-stopped` but no health check probes. |
| **Volume for uploads** | Payment proof uploads may not be persisted across container restarts. |
| **Production Dockerfile** | Current Dockerfile may use development settings. Need multi-stage build with `dotnet publish` + `ng build --prod`. |

### 4.3 Monitoring & Logging

| Missing | Details |
|---------|---------|
| **Structured logging** | Not using Serilog or any structured logging provider. |
| **API health endpoint improvement** | `/health` exists but may not check DB connectivity. |
| **Error tracking** | No Sentry/Application Insights integration. |

---

## 5. Documentation

| Missing | Details |
|---------|---------|
| **api-reference.md is outdated** | Frontend routes section still shows old Portuguese paths (`/socios/login`, `/socios/aderir`, `/socios/perfil`). Admin section references `/admin/eventos` and `/admin/socios`. |
| **No setup guide** | No `CONTRIBUTING.md` or `SETUP.md` with step-by-step instructions for new developers. |
| **Environment variable documentation** | No list of required `appsettings` keys or `.env` variables. |
| **Architecture decision records** | No ADRs explaining why specific technologies/patterns were chosen. |

---

## 6. Misc / Polish

| Item | Details |
|------|---------|
| **SEO metadata** | All pages have `title` route data but no `<meta name="description">` tags or Open Graph. |
| **Sitemap** | No `/sitemap.xml` for search engines. |
| **PWA / offline support** | No service worker. Angular PWA (`@angular/pwa`) not added. |
| **Paginated lists** | Events list, partners list — all load full data with no pagination. |
| **Search** | No search functionality on any page. |
| **Internationalization (i18n)** | Mixed Portuguese/English in codebase. Route paths are English, UI text is Portuguese. No i18n framework. |
| **Dark mode** | Only light theme. No dark mode toggle. |
| **Animations** | No Angular animations for route transitions or element enter/leave. |
| **Error boundary / global error handler** | No centralized error handling in the Angular app for unhandled exceptions. |

---

## Priority Guide

| Priority | Label | Criteria |
|----------|-------|----------|
| P0 | Critical | Required by AGENTS.md rules, or blocks core functionality |
| P1 | High | Important for production readiness, user experience, or completeness |
| P2 | Medium | Nice to have, improves quality of life |
| P3 | Low | Polish, future enhancement |

**Suggested P0 (start here):**
- Frontend tests for all components
- Lazy loading routes
- Signals migration
- Fix `@HostListener` → `host` object
- Password reset UI
- Admin dashboard
- Update api-reference.md
- CI pipeline (GitHub Actions)
