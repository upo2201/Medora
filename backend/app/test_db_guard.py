"""
Medora Automated Test Database Safety Guard
Ensures automated tests run exclusively against isolated temporary SQLite databases.
Prevents any automated test from querying, modifying, or deleting records in the development database.
"""

import os
import shutil
import tempfile
from contextlib import contextmanager
from typing import Tuple, Optional
from app.config import Config

# Canonical development database path
DEVELOPMENT_DB_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "medora.db")
)

def assert_not_dev_db(db_path: Optional[str]):
    """
    Safety Guard: Immediately raises AssertionError if the given database path
    points to or matches the development database.
    """
    if not db_path:
        raise AssertionError("CRITICAL SAFETY VIOLATION: Database path is empty or unset in test.")
    
    norm_target = os.path.abspath(os.path.normcase(db_path))
    norm_dev = os.path.abspath(os.path.normcase(DEVELOPMENT_DB_PATH))
    
    if norm_target == norm_dev or norm_target.endswith(os.path.normcase("backend/medora.db")) or norm_target.endswith(os.path.normcase("backend\\medora.db")):
        raise AssertionError(
            f"CRITICAL SAFETY VIOLATION: Automated test attempted to connect to development database!\n"
            f"Target:      {norm_target}\n"
            f"Dev DB Path: {norm_dev}\n"
            f"Tests must use an isolated temporary database (e.g. test_medora.db or tempfile)."
        )

def setup_isolated_test_db(suite_name: str = "test") -> Tuple[str, str, str]:
    """
    Sets up an isolated temporary SQLite database for an automated test suite.
    1. Creates a dedicated temporary directory.
    2. Points Config.DATABASE_PATH and os.environ['DATABASE_PATH'] to the test DB.
    3. Runs safety check to guarantee it does not match DEVELOPMENT_DB_PATH.
    4. Initializes database tables via init_db().
    Returns: (test_db_path, temp_dir, original_db_path)
    """
    original_db_path = Config.DATABASE_PATH
    temp_dir = tempfile.mkdtemp(prefix=f"medora_test_{suite_name}_")
    test_db_path = os.path.abspath(os.path.join(temp_dir, f"test_medora_{suite_name}.db"))
    
    # Enforce safety guard
    assert_not_dev_db(test_db_path)
    
    # Configure application runtime
    os.environ["DATABASE_PATH"] = test_db_path
    Config.DATABASE_PATH = test_db_path
    
    # Initialize clean schema in the test database
    from app.database import init_db
    init_db()
    
    return test_db_path, temp_dir, original_db_path

def teardown_isolated_test_db(temp_dir: str, original_db_path: Optional[str] = None):
    """
    Cleans up the temporary test database directory and restores Config.DATABASE_PATH.
    """
    # Restore configuration
    restored = original_db_path or DEVELOPMENT_DB_PATH
    Config.DATABASE_PATH = restored
    os.environ["DATABASE_PATH"] = restored
    
    # Remove temporary test directory and its files
    if temp_dir and os.path.exists(temp_dir):
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception:
            pass

@contextmanager
def isolated_test_db(suite_name: str = "test"):
    """Context manager for running code inside an isolated temporary test database."""
    test_db_path, temp_dir, original = setup_isolated_test_db(suite_name)
    try:
        yield test_db_path
    finally:
        teardown_isolated_test_db(temp_dir, original)
