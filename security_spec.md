# Security Specification - BMA Books (Bantu Mentor Academy)

## 1. Data Invariants
- Books are public for reading: Anyone can read books and exercises without authentication.
- Modifying books (creating, updating, deleting) is restricted strictly to authenticated Admins whose UID exists in `/admins/{adminId}` or matches the bootstrapped admin `bantudesignstudio9@gmail.com`.
- Exercises belong to a parent book `/books/{bookId}/exercises/{exerciseId}`.
- All slugs (`book_id` and exercise `id`) must strictly match `^[a-z0-9-]+$` and be bounded in length.
- Timestamps (`createdAt`, `updatedAt`) must adhere to strict server timestamps.
- View count increments on books/exercises are managed securely.

## 2. The Dirty Dozen Payloads (Rejection Matrix)
1. **Unauthenticated Book Create**: Attempt to POST a book document without an auth token -> Expected: PERMISSION_DENIED.
2. **Non-Admin Book Mutation**: Authenticated standard user attempting to overwrite `/books/ingles-7-8` -> Expected: PERMISSION_DENIED.
3. **Invalid Slug Format**: Attempting to create book with slug `UPPER_CASE_&_SPACES` -> Expected: PERMISSION_DENIED.
4. **Huge String Injection**: Attempting to inject a 500KB payload into `title` or `id` -> Expected: PERMISSION_DENIED.
5. **Shadow Field Injection**: Writing ghost fields (`isHacked: true`) during book creation -> Expected: PERMISSION_DENIED.
6. **Admin Self-Promotion**: Unprivileged user writing themselves into `/admins/{uid}` -> Expected: PERMISSION_DENIED.
7. **Unverified Email Privilege**: User with `email_verified == false` attempting admin write -> Expected: PERMISSION_DENIED.
8. **Orphan Exercise Creation**: Creating an exercise under a non-existent parent book -> Expected: PERMISSION_DENIED.
9. **Exercise ID Poisoning**: Using non-slug path variable `{exerciseId}` -> Expected: PERMISSION_DENIED.
10. **Immutable Field Tampering**: Attempting to mutate `createdAt` or `book_id` in an existing book -> Expected: PERMISSION_DENIED.
11. **Spoofed Server Timestamp**: Client sending arbitrary future timestamp -> Expected: PERMISSION_DENIED.
12. **Blanket Collection Scraping on Admin Collection**: Unauthenticated listing of `/admins` -> Expected: PERMISSION_DENIED.
