# API Consistency Review Document

**Date:** June 15, 2025

**Objective:** To review and resolve inconsistencies between the `micro-plan.md` summary and the detailed service design documents (`auth-service.md`, `user-service.md`, `group-service.md`, `expense-service.md`).

**Instructions for Reviewers:** Please examine the points below and provide feedback or confirm the suggested changes. The goal is to ensure all API documentation is aligned before merging.

---

## 1. User Service (`user-service.md` vs. `micro-plan.md`)

*   **Point 1.1: `GET /users/me` Response Structure**
    *   **Inconsistency:**
        *   `micro-plan.md`: Flat response: `{ id, name, email, ... }`
        *   `user-service.md`: Nested response: `{ "user": { id, name, email, ... } }`
    *   **Suggestion:** Align the response structure. The nested `{"user": {...}}` is a common practice.
    *   **Decision/Action:** _________________________________________________________

*   **Point 1.2: `DELETE /users/me` Response Structure**
    *   **Inconsistency:**
        *   `micro-plan.md`: `{ success: true }`
        *   `user-service.md`: `{ success: true, message: "User account scheduled for deletion." }`
    *   **Suggestion:** Decide if the `message` field is crucial for `micro-plan.md`.
    *   **Decision/Action:** _________________________________________________________

---

## 2. Group Service (`group-service.md` vs. `micro-plan.md`)

*   **Point 2.1: Group Joining Mechanism (Major Discrepancy)**
    *   **Inconsistency:**
        *   `micro-plan.md`: Email-based invite (`POST /groups/{group_id}/invites` & `POST /groups/{group_id}/join` with `invite_token`).
        *   `group-service.md`: `joinCode` system (`POST /groups/join` with `joinCode`).
    *   **Suggestion:** Reconcile. Clarify if both mechanisms are supported or choose one. Update documents accordingly.
    *   **Decision/Action:** _________________________________________________________

---

## 3. Expense Management Service (`expense-service.md` vs. `micro-plan.md`)

*   **Point 3.1: `POST /groups/{group_id}/expenses` Request Body**
    *   **Inconsistency:**
        *   `micro-plan.md`: `{ description, amount, paid_by: user_id, splits: [...], tags?, attachments? }`
        *   `expense-service.md`: `{ "description": "...", "receiptUrls": ["..."] }`
    *   **Suggestion:** `micro-plan.md` version is more comprehensive. Update `expense-service.md`.
    *   **Decision/Action:** _________________________________________________________

*   **Point 3.2: `GET /groups/{group_id}/expenses/{expense_id}` Response Body**
    *   **Inconsistency:**
        *   `micro-plan.md`: `{ expense, history?: […], comments?: […] }`
        *   `expense-service.md`: `{ "expense": { ... }, "relatedSettlements": [...] }`
    *   **Suggestion:** Align response details. Note `history` and `comments` are also listed as a separate service in `micro-plan.md` (see Section 5).
    *   **Decision/Action:** _________________________________________________________

*   **Point 3.3: `PATCH /groups/{group_id}/expenses/{expense_id}` Request Body**
    *   **Inconsistency:**
        *   `micro-plan.md`: `{ description?, amount?, splits?, tags? }`
        *   `expense-service.md`: `{ "description": "Updated dinner description" }`
    *   **Suggestion:** `micro-plan.md` version is more comprehensive. Update `expense-service.md`.
    *   **Decision/Action:** _________________________________________________________

*   **Point 3.4: Attachment Handling**
    *   **Inconsistency:**
        *   `micro-plan.md`: Dedicated endpoints `POST .../attachments` and `GET .../attachments/{key}`.
        *   `expense-service.md`: Mentions `receiptUrls` in create expense request.
    *   **Suggestion:** Dedicated attachment endpoints in `micro-plan.md` offer more flexibility. Adopt consistently.
    *   **Decision/Action:** _________________________________________________________

*   **Point 3.5: Expense Simplification Endpoint**
    *   **Inconsistency:** `micro-plan.md` has `POST /groups/{group_id}/expenses/{expense_id}/simplify`.
    *   **Suggestion:** This seems misplaced. Settlement simplification typically applies to a group. `expense-service.md` has `POST /groups/{group_id}/settlements/optimize`. Consider removing the `/simplify` endpoint from the expense section of `micro-plan.md`.
    *   **Decision/Action:** _________________________________________________________

---

## 4. Settlement Service (`expense-service.md#2-settlement-management` vs. `micro-plan.md`)

*   **Point 4.1: Missing Endpoints in `expense-service.md`**
    *   **Inconsistency:** `micro-plan.md` lists these, but they are absent in `expense-service.md`'s settlement section:
        *   `POST /groups/{group_id}/settlements` (Manually record a payment)
        *   `GET /groups/{group_id}/settlements/{settlement_id}` (Get single settlement)
        *   `DELETE /groups/{group_id}/settlements/{settlement_id}` (Remove/undo settlement)
    *   **Suggestion:** Update `expense-service.md` to include these if they are part of the design.
    *   **Decision/Action:** _________________________________________________________

*   **Point 4.2: Optimized/Simplified Settlements Endpoint**
    *   **Inconsistency & Link Issue:**
        *   `expense-service.md`: `POST /groups/{group_id}/settlements/optimize`.
        *   `micro-plan.md`: Settlement Service table's "Manually record a payment settlement" (`POST /groups/{group_id}/settlements`) incorrectly links to `expense-service.md#calculate-optimized-settlements`. The table doesn't explicitly list an "optimize" endpoint.
    *   **Suggestion:** Standardize on `POST /groups/{group_id}/settlements/optimize`. List it clearly in `micro-plan.md`'s Settlement Service table. Correct the link for "Manually record a payment settlement."
    *   **Decision/Action:** _________________________________________________________

*   **Point 4.3: `PATCH /groups/{group_id}/settlements/{settlement_id}` Request Body (Mark Paid)**
    *   **Inconsistency:**
        *   `micro-plan.md`: `{ amount?, status? }`
        *   `expense-service.md`: `{ "status": "completed", "paidAt": "..." }`
    *   **Suggestion:** Clarify and align. `expense-service.md`'s version is more specific.
    *   **Decision/Action:** _________________________________________________________

---

## 5. Comments & History Service (`expense-service.md` vs. `micro-plan.md`)

*   **Point 5.1: Endpoint Definition**
    *   **Inconsistency:**
        *   `micro-plan.md`: Lists separate endpoints for comments/history (`POST /../comments`, `GET /../comments`, `GET /../history`).
        *   `expense-service.md`: Implies comments/history are part of `GET /groups/{group_id}/expenses/{expense_id}` response, no separate management endpoints.
    *   **Suggestion:** Decide on the approach. If separate management is desired, update `expense-service.md`.
    *   **Decision/Action:** _________________________________________________________

---

## 6. Friends Balance Aggregation Service (`expense-service.md#3-friends-balance-aggregation` vs. `micro-plan.md`)

*   **Point 6.1: Overall User Balance Summary**
    *   **Inconsistency/Missing Endpoint:**
        *   `micro-plan.md`: `GET /users/me/balance-summary` (Overall summary for current user).
        *   `expense-service.md`: Does not list this endpoint; has `GET /groups/{group_id}/users/{user_id}/balance` (specific user in specific group).
    *   **Suggestion:** Both endpoints are useful. Consistently define both if intended. `expense-service.md` could adopt `/users/me/balance-summary`.
    *   **Decision/Action:** _________________________________________________________

---

## 7. Notifications Service

*   **Point 7.1: Missing Detailed Design Document**
    *   **Observation:** The `Notifications Service` is defined in `micro-plan.md` but does not have a corresponding detailed service file in the provided attachments.
    *   **Suggestion:** If this service is planned, a detailed design document should be created.
    *   **Decision/Action:** _________________________________________________________

---

## General Suggestions for Review

*   **Response Consistency:** Adopt a consistent style for API response objects (e.g., nesting data under a key like `"user": {}`).
*   **Markdown Links:** Double-check that all markdown links within `micro-plan.md` point to the correct sections in the detailed service documents after changes.

---

**Reviewer Sign-off:**

*   [Reviewer 1 Name]: _________________________ Date: _______________
*   [Reviewer 2 Name]: _________________________ Date: _______________
*   ...

