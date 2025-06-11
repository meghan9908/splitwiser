# Micro-Level API Specification for Expense Tracker
## 1. Authentication Service

| Method | Path                           | Description                             | Request Body                    | Response Body                           |
| :----: | ------------------------------ | --------------------------------------- | ------------------------------- | --------------------------------------- |
|  POST  | `/auth/signup/email`           | Register a new user with email+password | `{ email, password, name? }`    | `{ access_token, refresh_token, user }` |
|  POST  | `/auth/login/email`            | Login with email+password               | `{ email, password }`           | `{ access_token, refresh_token, user }` |
|  POST  | `/auth/login/google`           | Login / signup via Google OAuth token   | `{ id_token }`                  | `{ access_token, refresh_token, user }` |
|  POST  | `/auth/refresh`                | Refresh JWT when access token expires   | `{ refresh_token }`             | `{ access_token, refresh_token }`       |
|  POST  | `/auth/password/reset/request` | Send password-reset email link          | `{ email }`                     | `{ success: true }`                     |
|  POST  | `/auth/password/reset/confirm` | Set new password via reset token        | `{ reset_token, new_password }` | `{ success: true }`                     |

All “auth” endpoints return standard HTTP 4xx on error and 200 + JSON on success.

---

## 2. User Service

| Method | Path        | Description                  | Request Body                       | Response Body                                          |
| :----: | ----------- | ---------------------------- | ---------------------------------- | ------------------------------------------------------ |
|   GET  | `/users/me` | Get current user profile     | –                                  | `{ id, name, email, image_url, currency, created_at }` |
|  PATCH | `/users/me` | Update profile & preferences | `{ name?, image_url?, currency? }` | `{ user }`                                             |
| DELETE | `/users/me` | Delete own account           | –                                  | `{ success: true }`                                    |

*All user endpoints require a valid `Authorization: Bearer …` header.*

---

## 3. Group Service

| Method | Path                                     | Description                             | Request Body                       | Response Body                                   |
| :----: | ---------------------------------------- | --------------------------------------- | ---------------------------------- | ----------------------------------------------- |
|  POST  | `/groups`                                | Create a new group                      | `{ name, currency?, image_url? }`  | `{ group }`                                     |
|   GET  | `/groups`                                | List all groups current user belongs to | –                                  | `{ groups: [ … ] }`                             |
|   GET  | `/groups/{group_id}`                     | Get one group’s details                 | –                                  | `{ group, members: […], settings: {…} }`        |
|  PATCH | `/groups/{group_id}`                     | Update group metadata                   | `{ name?, currency?, image_url? }` | `{ group }`                                     |
| DELETE | `/groups/{group_id}`                     | Delete a group                          | –                                  | `{ success: true }`                             |
|  POST  | `/groups/{group_id}/invites`             | Invite a user by email                  | `{ email }`                        | `{ invite_token, invite_link }`                 |
|  POST  | `/groups/{group_id}/join`                | Join group via invite token             | `{ invite_token }`                 | `{ group, members }`                            |
|  POST  | `/groups/{group_id}/leave`               | Leave the group                         | –                                  | `{ success: true }`                             |
|   GET  | `/groups/{group_id}/members`             | List members & roles                    | –                                  | `{ members: [ { user_id, role, joined_at } ] }` |
|  PATCH | `/groups/{group_id}/members/{member_id}` | Change a member’s role (admin/member)   | `{ role }`                         | `{ member }`                                    |
| DELETE | `/groups/{group_id}/members/{member_id}` | Kick or remove a member                 | –                                  | `{ success: true }`                             |

*All group endpoints require `Bearer` auth and membership (role checks on PATCH/DELETE).*

---

## 4. Expense Management Service

| Method | Path                                                         | Description                                | Request Body                                                                                                          | Response Body                                           |
| :----: | ------------------------------------------------------------ | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
|  POST  | `/groups/{group_id}/expenses`                                | Create a new expense                       | `{ description, amount, paid_by: user_id, splits: [{ user_id, share_amount }], tags?:[], attachments?: [file_keys] }` | `{ expense }`                                           |
|   GET  | `/groups/{group_id}/expenses`                                | List all group expenses                    | Query params: `?from=ts&to=ts&page&limit`                                                                             | `{ expenses: […], meta: { total, page } }`              |
|   GET  | `/groups/{group_id}/expenses/{expense_id}`                   | Get one expense’s full details             | –                                                                                                                     | `{ expense, history?: […], comments?: […] }`            |
|  PATCH | `/groups/{group_id}/expenses/{expense_id}`                   | Update description, amount or splits       | `{ description?, amount?, splits?, tags? }`                                                                           | `{ expense }`                                           |
| DELETE | `/groups/{group_id}/expenses/{expense_id}`                   | Remove an expense                          | –                                                                                                                     | `{ success: true }`                                     |
|  POST  | `/groups/{group_id}/expenses/{expense_id}/simplify`          | Run simplification algorithm (graph-based) | –                                                                                                                     | `{ settlements_recommended: [ { from, to, amount } ] }` |
|  POST  | `/groups/{group_id}/expenses/{expense_id}/attachments`       | Upload receipts / attachment files         | `multipart/form-data` with file(s)                                                                                    | `{ file_keys: […] }`                                    |
|   GET  | `/groups/{group_id}/expenses/{expense_id}/attachments/{key}` | Download a receipt                         | –                                                                                                                     | *Binary file*                                           |

---

## 5. Settlement Service

| Method | Path                                             | Description                          | Request Body                                 | Response Body                     |
| :----: | ------------------------------------------------ | ------------------------------------ | -------------------------------------------- | --------------------------------- |
|  POST  | `/groups/{group_id}/settlements`                 | Manually record a payment settlement | `{ expense_id, payer_id, payee_id, amount }` | `{ settlement }`                  |
|   GET  | `/groups/{group_id}/settlements`                 | Get all settlements in the group     | Query params: `?from&to&page&limit`          | `{ settlements: […], meta: {…} }` |
|   GET  | `/groups/{group_id}/settlements/{settlement_id}` | Get a single settlement detail       | –                                            | `{ settlement }`                  |
|  PATCH | `/groups/{group_id}/settlements/{settlement_id}` | Update a settlement (e.g. mark paid) | `{ amount?, status? }`                       | `{ settlement }`                  |
| DELETE | `/groups/{group_id}/settlements/{settlement_id}` | Remove/undo a settlement             | –                                            | `{ success: true }`               |

---

## 6. Comments & History (Optional Phase)

| Method | Path                                | Description               | Request Body  | Response Body                |
| :----: | ----------------------------------- | ------------------------- | ------------- | ---------------------------- |
|  POST  | `/groups/{g}/expenses/{e}/comments` | Add comment to an expense | `{ content }` | `{ comment }`                |
|   GET  | `/groups/{g}/expenses/{e}/comments` | List comments             | –             | `{ comments: […] }`          |
|   GET  | `/groups/{g}/expenses/{e}/history`  | Get edit history          | –             | `{ history: [… snapshots] }` |

---

## 6. Friends Balance Aggregation Service

| Method | Path                        | Description                                    | Request Body | Response Body                                             |
| :----: | --------------------------- | ---------------------------------------------- | ------------ | --------------------------------------------------------- |
|   GET  | `/users/me/friends-balance` | Cross-group balance summary for all friends    | –            | `{ friendsBalance: […], summary: {…} }`                   |
|   GET  | `/users/me/balance-summary` | Current user's total balance across all groups | –            | `{ totalOwedToYou, totalYouOwe, netBalance, groups: […] }` |

---

## 7. Notifications (Nice-to-Have)

| Method | Path                        | Description            | Request Body        | Response Body            |
| :----: | --------------------------- | ---------------------- | ------------------- | ------------------------ |
|   GET  | `/notifications`            | List all notifications | `?unread_only=true` | `{ notifications: […] }` |
|  PATCH | `/notifications/{notif_id}` | Mark as read           | `{ read: true }`    | `{ notification }`       |
| DELETE | `/notifications/{notif_id}` | Dismiss notification   | –                   | `{ success: true }`      |

---

## 8. Enhanced Analytics Service  

| Method | Path                                | Description                        | Request Body | Response Body                                                |
| :----: | ----------------------------------- | ---------------------------------- | ------------ | ------------------------------------------------------------ |
|   GET  | `/groups/{group_id}/analytics`      | Group expense analytics & trends   | Query: `?period&year&month`      | `{ analytics: {…}, expenseTrends: […], memberContributions: […] }` |
|   GET  | `/users/me/analytics`               | Personal expense analytics         | Query: `?period&year&month`      | `{ personalStats: {…}, groupBreakdown: […] }`               |
|   GET  | `/groups/{group_id}/analytics/summary` | Total spent per user, per-category  | `?from&to`               | `{ per_user: […], per_category: […] }` |
|   GET  | `/groups/{group_id}/analytics/trends`  | Time-series of balances & spendings | `?interval=daily/weekly` | `{ timeline: […dates & values] }`      |

---

## 9. Real-Time Updates (WebSockets)

* **WS** `/ws/groups/{group_id}`
  Push real-time events: new expense, group member change, settlement, etc.

---

### Notes & Next Steps

* **Auth middleware** on every non-public route to decode JWT and load `current_user`.
* **Role checks** (group admin vs. member) enforced in Group & Expense PATCH/DELETE.
* **Payload schemas** defined via Pydantic for request validation & auto-docs.
* **File uploads**: use multipart/form-data + S3- or GridFS-backed storage.
* **Rate-limit** expensive ops (graph simplification) or offload to background worker (e.g. Celery/RQ).
* **Settlement Algorithm**: Implement directed graph optimization for debt minimization
* **Friends Balance**: Cross-group aggregation with real-time balance updates

