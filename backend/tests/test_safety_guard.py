"""
Unit tests for the Medora Test Database Safety Guard.
Verifies that tests are strictly prevented from accessing or modifying backend/medora.db.
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.config import Config
from app.database import get_db
from app.test_db_guard import (
    assert_not_dev_db,
    setup_isolated_test_db,
    teardown_isolated_test_db,
    DEVELOPMENT_DB_PATH
)

class TestDatabaseSafetyGuard(unittest.TestCase):
    def test_guard_rejects_development_database_path(self):
        """Verify safety guard raises AssertionError if dev DB path is supplied."""
        with self.assertRaises(AssertionError):
            assert_not_dev_db(DEVELOPMENT_DB_PATH)

        with self.assertRaises(AssertionError):
            assert_not_dev_db("backend/medora.db")

        with self.assertRaises(AssertionError):
            assert_not_dev_db("backend\\medora.db")

        with self.assertRaises(AssertionError):
            assert_not_dev_db(None)

        with self.assertRaises(AssertionError):
            assert_not_dev_db("")

    def test_guard_allows_isolated_test_database(self):
        """Verify safety guard permits valid isolated test databases."""
        test_db, temp_dir, orig = setup_isolated_test_db("safety_verify")
        try:
            # Must succeed without error
            assert_not_dev_db(test_db)
            self.assertTrue(os.path.exists(test_db))
            self.assertIn("test_medora", test_db)
            self.assertNotEqual(
                os.path.abspath(os.path.normcase(test_db)),
                os.path.abspath(os.path.normcase(DEVELOPMENT_DB_PATH))
            )
        finally:
            teardown_isolated_test_db(temp_dir, orig)

    def test_get_db_blocks_dev_db_in_testing_mode(self):
        """Verify get_db() raises AssertionError in testing mode if pointing to dev DB."""
        app = create_app()
        app.config["TESTING"] = True
        app.config["DATABASE_PATH"] = DEVELOPMENT_DB_PATH

        with app.app_context():
            with self.assertRaises(AssertionError):
                get_db()

if __name__ == "__main__":
    unittest.main()
