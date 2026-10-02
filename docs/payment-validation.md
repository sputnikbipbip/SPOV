# Partner Subscription Payment Validation

This document describes how the SPOV partner subscription payment lifecycle works.

## Payment Status Lifecycle

```
Pending → Submitted → Verified
                  → Rejected
```

| Status | Description |
|--------|-------------|
| `Pending` | Payment created on partner registration. Awaiting proof upload. |
| `Submitted` | Partner has uploaded a proof file. Awaiting admin review. |
| `Verified` | Admin confirmed the proof is valid. Partner membership is activated. |
| `Rejected` | Admin rejected the proof. Partner can re-upload. |

## Flow

### 1. Payment Creation (Automatic)

When a partner registers, a `Pending` payment is created automatically with the server-derived fee:

- **Student partners:** Registration fee (€30) + Annual quota (€20) = **€50**
- **Professional partners:** Registration fee (€30) + Annual quota (€50) = **€80**

Fees are determined server-side based on the partner's selected fee type, preventing client-side manipulation.

### 2. Proof Upload (Partner)

Partners submit payment proof through their profile page. The system accepts:

- **File types:** PDF, JPEG, PNG
- **Max size:** 10 MB
- **Validation:** Magic-byte signature check (PDF: `%PDF`, JPEG: `FF D8 FF`, PNG: `89 50 4E 47 0D 0A 1A 0A`)

On successful upload the payment status transitions from `Pending` to `Submitted`. Only one open (non-verified) payment is allowed per partner at a time.

### 3. Proof Review (Admin)

Admins can download and review the uploaded proof. Two actions are available:

- **Validate:** Confirms the proof is legitimate. Status becomes `Verified`. Partner membership is automatically set to `Active`.
- **Reject:** Proof is invalid (e.g., wrong amount, illegible). Status becomes `Rejected`. An optional note explains the reason. The partner sees this note and can re-upload.

### 4. Membership Activation

Membership is only activated when a payment is verified. This is enforced both:

- **On registration:** `ApproveAsync` requires at least one `Verified` payment before activating a partner.
- **On review:** Validating a payment sets `MembershipStatus = Active` in the same transaction.

## Concurrency Protection

The `Payment` entity uses a `Version` field (GUID) as an optimistic concurrency token. If two admins review the same payment concurrently, the second attempt receives a conflict error and the frontend retries the latest state.

## File Storage

Proof files are stored on disk via the `IFileStorage` interface (implemented by `LocalFileStorage`). Files are served back through a controller endpoint that:

- Verifies access (partner can only access their own, admins can access any)
- Sets `X-Content-Type-Options: nosniff` header on downloads
- Cleans up orphaned files when a partner re-uploads

In Docker the files persist in the `payment-proofs` volume.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/partners/me/payment-proof` | Partner | Upload payment proof |
| `POST` | `/api/partners/{id}/payments/{paymentId}/verify` | Admin | Validate payment |
| `POST` | `/api/partners/{id}/payments/{paymentId}/reject` | Admin | Reject payment |
| `GET` | `/api/partners/{id}/payments/{paymentId}/proof` | Partner / Admin | Download proof |

## Security Considerations

- Fees are server-derived, not client-submitted
- File uploads are validated by magic bytes, not just MIME type
- Stored file names are sanitized (no path traversal)
- Orphaned files are cleaned up on re-upload
- Concurrency token prevents double-review
- Only the partner or an admin can access a proof file
