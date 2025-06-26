import pytest
import pytest_asyncio
from unittest.mock import patch, MagicMock
import firebase_admin # Added
import os # Added
import sys # Added
from pathlib import Path # Added

# Add project root to sys.path to allow imports from app and main
# This assumes conftest.py is in backend/tests/
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from mongomock_motor import AsyncMongoMockClient

@pytest.fixture(scope="session", autouse=True)
def mock_firebase_admin(request):
    # Check if we're in a test session that might use firebase,
    # otherwise this mock might be too broad.
    # For now, apply session-wide for simplicity as auth_service imports firebase_admin.

    # Mock firebase_admin.credentials.Certificate
    # Create a mock object that can be called and returns another mock
    mock_certificate = MagicMock()
    # When firebase_admin.credentials.Certificate(path) is called, it returns a dummy object
    mock_certificate.return_value = MagicMock()

    # Mock firebase_admin.initialize_app
    mock_initialize_app = MagicMock()

    # Mock firebase_admin.auth for verify_id_token if Google login tests were being added
    mock_firebase_auth = MagicMock()
    mock_firebase_auth.verify_id_token.return_value = {
        "uid": "test_firebase_uid",
        "email": "firebaseuser@example.com",
        "name": "Firebase User",
        "picture": None
    } # Dummy decoded token

    # Ensure firebase_admin.auth is available to be patched
    try:
        import firebase_admin.auth
    except ImportError:
        # If it's not directly importable, the structure might be different or initialization needed.
        # For now, we assume it should be available or this mock needs adjustment based on library structure.
        pass

    patches_to_apply = [
        ("firebase_admin.credentials.Certificate", mock_certificate),
        ("firebase_admin.initialize_app", mock_initialize_app)
    ]

    # Conditionally add patch for firebase_admin.auth if it seems available
    if hasattr(firebase_admin, 'auth'):
        patches_to_apply.append(("firebase_admin.auth", mock_firebase_auth))
    else:
        # If firebase_admin.auth is not an attribute, try patching where it might be used,
        # e.g., if auth_service imports it as `from firebase_admin import auth`.
        # This is a fallback, direct attribute patching is preferred if possible.
        # For now, we'll rely on the hasattr check.
        print("Warning: firebase_admin.auth not found as a direct attribute, auth mocking might be incomplete.")


    active_patches = []
    for target_path, mock_object in patches_to_apply:
        try:
            p = patch(target_path, mock_object)
            p.start()
            active_patches.append(p)
        except AttributeError:
            print(f"Warning: Could not patch {target_path}, attribute not found.")

    request.addfinalizer(lambda: [p.stop() for p in active_patches])
    yield

@pytest_asyncio.fixture(scope="function", autouse=True)
async def mock_db(monkeypatch):
    """
    Mocks the database for all service tests by patching app.database.get_database.
    Uses mongomock_motor for an in-memory MongoDB mock.
    """
    mock_mongo_client = AsyncMongoMockClient()
    mock_database_instance = mock_mongo_client["test_db_mock"]

    # Patch get_database at its definition site to affect all imports
    monkeypatch.setattr("app.database.get_database", lambda: mock_database_instance)

    # Also patch it where it might be directly imported by services if they use `from app.database import get_database`
    # This ensures all services (auth, user, group) get the mocked DB.
    # Note: If services import get_database as `from app.some_module import get_database`, that path also needs patching.
    # Assuming services do `from app.database import get_database` or `app.database.get_database()`

    # The following specific patches might be redundant if all services correctly use app.database.get_database
    # but are kept for safety, assuming services might have `from app.database import get_database`.
    # If a service does `import app.database` and then `app.database.get_database()`, the above patch is sufficient.

    # monkeypatch.setattr("app.auth.service.get_database", lambda: mock_database_instance)
    # monkeypatch.setattr("app.user.service.get_database", lambda: mock_database_instance)
    # monkeypatch.setattr("app.group.service.get_database", lambda: mock_database_instance) # For group service

    yield mock_database_instance

    # Cleanup: mongomock client does not need explicit closing for function scope.
    # Collections will be fresh for each test due to new client.
