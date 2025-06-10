# Auth Service Design for Splitwiser App

## 1. Email/Password Sign-Up & Sign-In

1. **Sign-Up**

   * **Request**:

     ```json
     POST /auth/signup/email
     {
       "email": "...",
       "password": "...",
       "name": "..."
     }
     ```
   * **Server**:

     1. Hash the password (e.g. using bcrypt).
     2. Create a new User document in MongoDB with `hashed_password`, email, name, etc.
     3. (Optionally) create & store a **refresh token** record in a `refresh_tokens` collection, tied to the user and device/browser.
     4. Generate a short-lived **Access Token** (JWT, e.g. 15 min) and a longer-lived **Refresh Token** (e.g. 30 days).
   * **Response**:

     ```json
     200 OK
     {
       "access_token": "...jwt...",
       "refresh_token": "...opaque-or-jwt...",
       "user": { "id": "...", "email": "...", "name": "..." }
     }
     ```

2. **Sign-In**

   * **Request**:

     ```json
     POST /auth/login/email
     {
       "email": "...",
       "password": "..."
     }
     ```
   * **Server**:

     1. Look up the user by email.
     2. Compare submitted password with the stored hash.
     3. If OK, issue new Access + Refresh tokens (and store/rotate the refresh token in DB).
   * **Response**: same shape as Sign-Up.

---

## 2. Token Storage & Rotation

* **Access Token (JWT)**

  * **Lifespan**: short (e.g. 15 min)
  * **Usage**: attached to every protected request as

    ```
    Authorization: Bearer <access_token>
    ```
  * **Storage (Client)**: in memory (e.g. React state / Redux store).

    * Why not localStorage? To reduce XSS risk.

* **Refresh Token**

  * **Lifespan**: long (e.g. 30 days)
  * **Usage**: call

    ```
    POST /auth/refresh
    { "refresh_token": "..." }
    ```

    to get a new Access Token.
  * **Storage (Client)**: in a secure persistent store:
  * **Web**: `httpOnly`, `Secure` cookie (preferred), or if you must use localStorage, encrypt it.
  * **React Native / Expo**: use `SecureStore` (or `AsyncStorage` with encryption).

* **Server-Side Tracking**

  * Keep a collection `refresh_tokens` with fields

    ```js
    { token, user_id, device_info, created_at, expires_at, revoked: bool }
    ```
  * On every `refresh` call, you can rotate the token (issue a brand-new refresh token and mark the old one revoked). That way, you can:

    * Immediately revoke sessions (e.g. on password change).
    * Detect token reuse attacks.

---

## 3. Google Sign-In via Firebase

1. **In Your Expo App UI**

   * Use `expo-auth-session` or `firebase/auth` to do Google OAuth and get back a Firebase **ID Token** (JWT) on the client.
   * Example (pseudo):

     ```js
     const result = await Google.logInAsync({ … });
     const idToken = result.idToken;
     ```

2. **Backend Endpoint**

   * **Request**:

     ```json
     POST /auth/login/google
     { "id_token": "<firebase-id-token>" }
     ```
   * **Server** (FastAPI):

     1. Verify `id_token` with the Firebase Admin SDK (or by calling Google’s tokeninfo endpoint).
     2. Extract `uid`, email, name, picture.
     3. Look up or **auto-provision** a User in your MongoDB.
     4. Issue your own Access + Refresh tokens (just like email/password flow), and store the Refresh token record.
   * **Response**:

     ```json
     {
       "access_token": "...",
       "refresh_token": "...",
       "user": { "id": "...", "email": "...", "name": "...", "avatar": "..." }
     }
     ```

3. **Client Side**

   * Receive your own tokens in the response.
   * Store them exactly the same way as in the email/password flow (Access in memory, Refresh in SecureStore/cookie).
   * All subsequent API calls (to `/groups`, `/expenses`, etc.) use your own Access token.

---

## 4. Client-Side Persistence & UX

* **On App Launch**

  1. Check SecureStore (or cookies) for a stored Refresh Token.
  2. If found, call `/auth/refresh` to get a fresh Access token (and possibly a rotated Refresh token).
  3. If no valid tokens, show the Login/Sign-Up screen.

* **On Login / Sign-Up**

  1. Save the returned Access token in React state.
  2. Save the Refresh token in SecureStore or an HttpOnly cookie.
  3. Redirect into your logged-in UI.

* **On API Calls**

  * Automatically inject the `Authorization: Bearer <access_token>` header via an Axios or Fetch interceptor.
  * If you get a 401 (Access token expired), automatically call `/auth/refresh` once and retry the original request.

* **On Logout**

  1. Call `/auth/logout` (if you implement a logout endpoint that revokes the refresh token).
  2. Clear tokens from SecureStore and in-memory state.
  3. Redirect back to the Login screen.

---

### Why This Feels Smooth

* **Token Rotation & Auto-Refresh** means users rarely see login screens once they’ve signed in.
* **SecureStore / HttpOnly Cookies** keep tokens safe from attackers.
* **Centralized Refresh-Token Store** on the server lets you revoke stolen tokens instantly (e.g. via an “Active Sessions” screen).
* **Single Codepath** for both Email/Password and Google Sign-In after the initial identity check (you end up issuing your own tokens in both cases).


