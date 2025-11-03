## 🧠 Vibe Coding QA Checklist Template

**Version:** 2025.11  
**Author:** Anil Kumar  
**Purpose:** Ensure apps built through vibe coding are production-ready, stable, secure, and 100% functional before release.

---

## ✅ 1. Functional Testing

| #   | Test Area           | Description                                                               | Status | Remarks |
| --- | ------------------- | ------------------------------------------------------------------------- | ------ | ------- |
| 1.1 | Core User Journey   | Verify all major app workflows (Signup → Login → Main Action → Logout).   | ☐      |         |
| 1.2 | Form Validation     | Check required fields, incorrect input handling, and validation messages. | ☐      |         |
| 1.3 | CRUD Operations     | Test Create, Read, Update, Delete on all main entities.                   | ☐      |         |
| 1.4 | Navigation          | Confirm all pages, menus, and links route correctly.                      | ☐      |         |
| 1.5 | Multi-role Behavior | Test admin, normal user, and guest permissions.                           | ☐      |         |
| 1.6 | Error Handling      | Ensure all error messages are clear and user-friendly.                    | ☐      |         |

---

## ⚙️ 2. Integration & API Testing

| #   | Test Area               | Description                                                          | Status | Remarks |
| --- | ----------------------- | -------------------------------------------------------------------- | ------ | ------- |
| 2.1 | API Response Validation | Test all endpoints (200 OK, 400, 404, 500 scenarios).                | ☐      |         |
| 2.2 | DB Integration          | Ensure all API → DB reads/writes occur correctly.                    | ☐      |         |
| 2.3 | External Integrations   | Validate 3rd party integrations (email, payment, file upload, etc.). | ☐      |         |
| 2.4 | Webhooks                | Trigger incoming/outgoing webhook events and confirm receipt.        | ☐      |         |
| 2.5 | Rate Limiting           | Check if API handles rapid requests gracefully.                      | ☐      |         |

---

## 🎨 3. UI/UX Testing

| #   | Test Area              | Description                                               | Status | Remarks |
| --- | ---------------------- | --------------------------------------------------------- | ------ | ------- |
| 3.1 | Visual Consistency     | Fonts, colors, spacing, icons consistent throughout.      | ☐      |         |
| 3.2 | Responsiveness         | Test on desktop, tablet, and mobile (portrait/landscape). | ☐      |         |
| 3.3 | Accessibility          | Keyboard navigation, color contrast, alt-text.            | ☐      |         |
| 3.4 | Browser Compatibility  | Test on Chrome, Edge, Firefox, Safari.                    | ☐      |         |
| 3.5 | Animation and Feedback | Buttons, loaders, and transitions feel natural.           | ☐      |         |

---

## 🔒 4. Security Testing

| #   | Test Area          | Description                                            | Status | Remarks |
| --- | ------------------ | ------------------------------------------------------ | ------ | ------- |
| 4.1 | Authentication     | Test login/logout, password reset, session timeout.    | ☐      |         |
| 4.2 | Authorization      | Ensure restricted data is inaccessible to non-admins.  | ☐      |         |
| 4.3 | Input Sanitization | Test with `<script>` tags, SQL injection strings, etc. | ☐      |         |
| 4.4 | HTTPS Enforcement  | Confirm all endpoints use HTTPS only.                  | ☐      |         |
| 4.5 | Data Protection    | Check passwords are hashed and API keys hidden.        | ☐      |         |

---

## ⚡ 5. Performance & Load Testing

| #   | Test Area             | Description                                   | Status | Remarks |
| --- | --------------------- | --------------------------------------------- | ------ | ------- |
| 5.1 | Page Load Time        | Verify under 3 seconds on 4G network.         | ☐      |         |
| 5.2 | API Latency           | Confirm all API calls return < 500ms average. | ☐      |         |
| 5.3 | Load Test             | Simulate 100–1000 concurrent users.           | ☐      |         |
| 5.4 | DB Query Optimization | Identify slow queries and optimize indexes.   | ☐      |         |
| 5.5 | Memory Usage          | Monitor CPU/RAM under load.                   | ☐      |         |

---

## 🧩 6. Regression Testing

| #   | Test Area          | Description                                                    | Status | Remarks |
| --- | ------------------ | -------------------------------------------------------------- | ------ | ------- |
| 6.1 | Previous Bugs      | Verify no reoccurrence of earlier fixed bugs.                  | ☐      |         |
| 6.2 | Major Flows Retest | Retest all main flows after new changes.                       | ☐      |         |
| 6.3 | Version Comparison | Check for regressions between last stable and current version. | ☐      |         |

---



## 🚀 8. Deployment & Environment Validation

| #   | Test Area             | Description                                 | Status | Remarks |
| --- | --------------------- | ------------------------------------------- | ------ | ------- |
| 8.1 | Build Pipeline        | GitHub → Coolify deploy flow works.         | ☐      |         |
| 8.2 | Environment Variables | `.env` loaded and isolated correctly.       | ☐      |         |
| 8.3 | Fresh Install Test    | Spin new instance — no manual fix required. | ☐      |         |
| 8.4 | Rollback Test         | Simulate failed deployment and rollback.    | ☐      |         |

---

## 🧾 Notes

- **Status Key:** ☐ = Pending, ✅ = Pass, ❌ = Fail

- **Update this file per version release.**

- **Automate repetitive tests** using Postman, k6, or GitHub Actions where possible.

- **Save completed reports** in `/tests/reports/YYYY-MM-DD/qa-summary.md`.


