# Micro-Level API Specification for Expense Tracker

## 1. Authentication Service

**Detailed Design:** [Auth Service API](./auth-service.md)

| Method | Path                           | Description                             | Request Body                    | Response Body                           |
| :----: | ------------------------------ | --------------------------------------- | ------------------------------- | --------------------------------------- |
|  POST  | [`/auth/signup/email`](./auth-service.md#create-user-with-email--password)           | Register a new user with email+password | `{ email, password, name? }`    | `{ access_token, refresh_token, user }` |
|  POST  | [`/auth/login/email`](./auth-service.md#login-with-email--password)            | Login with email+password               | `{ email, password }`           | `{ access_token, refresh_token, user }` |
|  POST  | [`/auth/login/google`](./auth-service.md#login--signup-with-google)           | Login / signup via Google OAuth token   | `{ id_token }`                  | `{ access_token, refresh_token, user }` |
|  POST  | [`/auth/refresh`](./auth-service.md#refresh-jwt-access-token)                | Refresh JWT when access token expires   | `{ refresh_token }`             | `{ access_token, refresh_token }`       |
|  POST  | [`/auth/password/reset/request`](./auth-service.md#request-password-reset) | Send password-reset email link          | `{ email }`                     | `{ success: true }`                     |
|  POST  | [`/auth/password/reset/confirm`](./auth-service.md#confirm-password-reset) | Set new password via reset token        | `{ reset_token, new_password }` | `{ success: true }`                     |

All “auth” endpoints return standard HTTP 4xx on error and 200 + JSON on success.

---

## 2. User Service

**Detailed Design:** [User Service API](./user-service.md)

| Method | Path        | Description                  | Request Body                       | Response Body                                          |
| :----: | ----------- | ---------------------------- | ---------------------------------- | ------------------------------------------------------ |
|   GET  | [`/users/me`](./user-service.md#get-current-user-profile) | Get current user profile     | –                                  | `{ id, name, email, image_url, currency, created_at }` |
|  PATCH | [`/users/me`](./user-service.md#update-user-profile) | Update profile & preferences | `{ name?, image_url?, currency? }` | `{ user }`                                             |
| DELETE | [`/users/me`](./user-service.md#delete-user-account) | Delete own account           | –                                  | `{ success: true }`                                    |

*All user endpoints require a valid `Authorization: Bearer …` header.*

---

## 3. Group Service

**Detailed Design:** [Group Service API](./group-service.md)

| Method | Path                                     | Description                             | Request Body                       | Response Body                                   |
| :----: | ---------------------------------------- | --------------------------------------- | ---------------------------------- | ----------------------------------------------- |
|  POST  | [`/groups`](./group-service.md#create-group)                                | Create a new group                      | `{ name, currency?, image_url? }`  | `{ group }`                                     |
|   GET  | [`/groups`](./group-service.md#list-user-groups)                                | List all groups current user belongs to | –                                  | `{ groups: [ … ] }`                             |
|   GET  | [`/groups/{group_id}`](./group-service.md#get-group-details)                     | Get one group’s details                 | –                                  | `{ group, members: […], settings: {…} }`        |
|  PATCH | [`/groups/{group_id}`](./group-service.md#update-group-details)                     | Update group metadata                   | `{ name?, currency?, image_url? }` | `{ group }`                                     |
| DELETE | [`/groups/{group_id}`](./group-service.md#delete-group)                     | Delete a group                          | –                                  | `{ success: true }`                             |
|  POST  | [`/groups/{group_id}/invites`](./group-service.md#invite-user-to-group)             | Invite a user by email                  | `{ email }`                        | `{ invite_token, invite_link }`                 |
|  POST  | [`/groups/{group_id}/join`](./group-service.md#join-group-via-invite)                | Join group via invite token             | `{ invite_token }`                 | `{ group, members }`                            |
|  POST  | [`/groups/{group_id}/leave`](./group-service.md#leave-group)               | Leave the group                         | –                                  | `{ success: true }`                             |
|   GET  | [`/groups/{group_id}/members`](./group-service.md#list-group-members)             | List members & roles                    | –                                  | `{ members: [ { user_id, role, joined_at } ] }` |
|  PATCH | [`/groups/{group_id}/members/{member_id}`](./group-service.md#update-member-role) | Change a member’s role (admin/member)   | `{ role }`                         | `{ member }`                                    |
| DELETE | [`/groups/{group_id}/members/{member_id}`](./group-service.md#remove-group-member) | Kick or remove a member                 | –                                  | `{ success: true }`                             |

*All group endpoints require `Bearer` auth and membership (role checks on PATCH/DELETE).*

---

## 4. Expense Management Service

**Detailed Design:** [Expense Service API](./expense-service.md#1-expense-crud-operations)

| Method | Path                                                         | Description                                | Request Body                                                                                                          | Response Body                                           |
| :----: | ------------------------------------------------------------ | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
|  POST  | [`/groups/{group_id}/expenses`](./expense-service.md#create-expense)                                | Create a new expense                       | `{ description, amount, paid_by: user_id, splits: [{ user_id, share_amount }], tags?:[], attachments?: [file_keys] }` | `{ expense }`                                           |
|   GET  | [`/groups/{group_id}/expenses`](./expense-service.md#list-group-expenses)                                | List all group expenses                    | Query params: `?from=ts&to=ts&page&limit`                                                                             | `{ expenses: […], meta: { total, page } }`              |
|   GET  | [`/groups/{group_id}/expenses/{expense_id}`](./expense-service.md#get-single-expense)                   | Get one expense’s full details             | –                                                                                                                     | `{ expense, history?: […], comments?: […] }`            |
|  PATCH | [`/groups/{group_id}/expenses/{expense_id}`](./expense-service.md#update-expense)                   | Update description, amount or splits       | `{ description?, amount?, splits?, tags? }`                                                                           | `{ expense }`                                           |
| DELETE | [`/groups/{group_id}/expenses/{expense_id}`](./expense-service.md#delete-expense)                   | Remove an expense                          | –                                                                                                                     | `{ success: true }`                                     |
|  POST  | [`/groups/{group_id}/expenses/{expense_id}/simplify`](./expense-service.md#calculate-optimized-settlements)          | Run simplification algorithm (graph-based) | –                                                                                                                     | `{ settlements_recommended: [ { from, to, amount } ] }` |
|  POST  | `/groups/{group_id}/expenses/{expense_id}/attachments`       | Upload receipts / attachment files         | `multipart/form-data` with file(s)                                                                                    | `{ file_keys: […] }`                                    |
|   GET  | `/groups/{group_id}/expenses/{expense_id}/attachments/{key}` | Download a receipt                         | –                                                                                                                     | *Binary file*                                           |

---

## 5. Settlement Service

**Detailed Design:** [Expense Service API (Settlement Management)](./expense-service.md#2-settlement-management)

| Method | Path                                             | Description                          | Request Body                                 | Response Body                     |
| :----: | ------------------------------------------------ | ------------------------------------ | -------------------------------------------- | --------------------------------- |
|  POST  | [`/groups/{group_id}/settlements`](./expense-service.md#calculate-optimized-settlements)                 | Manually record a payment settlement | `{ expense_id, payer_id, payee_id, amount }` | `{ settlement }`                  |
|   GET  | [`/groups/{group_id}/settlements`](./expense-service.md#get-group-settlements)                 | Get all settlements in the group     | Query params: `?from&to&page&limit`          | `{ settlements: […], meta: {…} }` |
|   GET  | `/groups/{group_id}/settlements/{settlement_id}` | Get a single settlement detail       | –                                            | `{ settlement }`                  |
|  PATCH | [`/groups/{group_id}/settlements/{settlement_id}`](./expense-service.md#mark-settlement-as-paid) | Update a settlement (e.g. mark paid) | `{ amount?, status? }`                       | `{ settlement }`                  |
| DELETE | `/groups/{group_id}/settlements/{settlement_id}` | Remove/undo a settlement             | –                                            | `{ success: true }`               |

---

## 6. Comments & History (Optional Phase)

**Detailed Design:** [Expense Service API (Comments & History)](./expense-service.md#get-single-expense) (Comments and History are part of the Get Single Expense response)

| Method | Path                                | Description               | Request Body  | Response Body                |
| :----: | ----------------------------------- | ------------------------- | ------------- | ---------------------------- |
|  POST  | `/groups/{g}/expenses/{e}/comments` | Add comment to an expense | `{ content }` | `{ comment }`                |
|   GET  | `/groups/{g}/expenses/{e}/comments` | List comments             | –             | `{ comments: […] }`          |
|   GET  | `/groups/{g}/expenses/{e}/history`  | Get edit history          | –             | `{ history: [… snapshots] }` |

---

## 6. Friends Balance Aggregation Service

**Detailed Design:** [Expense Service API (Friends Balance Aggregation)](./expense-service.md#3-friends-balance-aggregation)

| Method | Path                        | Description                                    | Request Body | Response Body                                             |
| :----: | --------------------------- | ---------------------------------------------- | ------------ | --------------------------------------------------------- |
|   GET  | [`/users/me/friends-balance`](./expense-service.md#get-cross-group-friend-balances) | Cross-group balance summary for all friends    | –            | `{ friendsBalance: […], summary: {…} }`                   |
|   GET  | [`/users/me/balance-summary`](./expense-service.md#get-user-balance-in-specific-group) | Current user\'s total balance across all groups | –            | `{ totalOwedToYou, totalYouOwe, netBalance, groups: […] }` |

---

## 7. Notifications (Nice-to-Have)

| Method | Path                        | Description            | Request Body        | Response Body            |
| :----: | --------------------------- | ---------------------- | ------------------- | ------------------------ |
|   GET  | `/notifications`            | List all notifications | `?unread_only=true` | `{ notifications: […] }` |
|  PATCH | `/notifications/{notif_id}` | Mark as read           | `{ read: true }`    | `{ notification }`       |
| DELETE | `/notifications/{notif_id}` | Dismiss notification   | –                   | `{ success: true }`      |

---

## 8. Enhanced Analytics Service

**Detailed Design:** [Expense Service API (Analytics)](./expense-service.md#4-analytics-and-reporting)

| Method | Path                                | Description                        | Request Body | Response Body                                                |
| :----: | ----------------------------------- | ---------------------------------- | ------------ | ------------------------------------------------------------ |
|   GET  | [`/groups/{group_id}/analytics`](./expense-service.md#group-expense-analytics)      | Group expense analytics & trends   | Query: `?period&year&month`      | `{ analytics: {…}, expenseTrends: […], memberContributions: […] }` |
|   GET  | `/users/me/analytics`               | Personal expense analytics         | Query: `?period&year&month`      | `{ personalStats: {…}, groupBreakdown: […] }`               |
|   GET  | `/groups/{group_id}/analytics/summary` | Total spent per user, per-category  | `?from&to`               | `{ per_user: […], per_category: […] }` |
|   GET  | `/groups/{group_id}/analytics/trends`  | Time-series of balances & spendings | `?interval=daily/weekly` | `{ timeline: […dates & values] }`      |

---

## 9. Real-Time Updates (WebSockets)

* **WS** `/ws/groups/{group_id}`
  Push real-time events: new expense, group member change, settlement, etc.

---

### Notes & Next Steps

* **Auth middleware** on every non-public route to decode JWT and load `current_user`. ([Auth Service](./auth-service.md))
* **Role checks** (group admin vs. member) enforced in Group & Expense PATCH/DELETE. ([Group Service](./group-service.md), [Expense Service](./expense-service.md))
* **Payload schemas** defined via Pydantic for request validation & auto-docs.
* **File uploads**: use multipart/form-data + S3- or GridFS-backed storage.
* **Rate-limit** expensive ops (graph simplification) or offload to background worker (e.g. Celery/RQ). ([Expense Service](./expense-service.md#rate-limiting))
* **Settlement Algorithm**: Implement directed graph optimization for debt minimization ([Expense Service](./expense-service.md#core-algorithm-settlement-simplification))
* **Friends Balance**: Cross-group aggregation with real-time balance updates ([Expense Service](./expense-service.md#3-friends-balance-aggregation))
* **Database Schema**: All services interact with the [Non-Relational Database Schema](./nonrelational-database-schema.md).

