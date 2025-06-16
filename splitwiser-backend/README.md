# Splitwiser Backend

This is the backend for the Splitwiser application. See docs for architecture and API details.

## Running Locally

1. Copy `.env.example` to `.env` and fill in your secrets.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Project Structure
See `docs/backend-project-structure.md` for details.
