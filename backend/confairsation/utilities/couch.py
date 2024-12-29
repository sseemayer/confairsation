import os
import base64

import requests

from pathlib import Path

from loguru import logger

from requests.auth import HTTPBasicAuth


COUCHDB_URL = os.getenv("COUCHDB_URL")
COUCHDB_USER = os.getenv("COUCHDB_USER")
COUCHDB_PASSWORD = os.getenv("COUCHDB_PASSWORD")

if not COUCHDB_URL:
    raise Exception("No COUCHDB_URL set -- please point me to the CouchDB instance")

if not COUCHDB_USER:
    raise Exception("No COUCHDB_USER set")

if not COUCHDB_PASSWORD:
    raise Exception("No COUCHDB_PASSWORD set")


COUCHDB_AUTH = HTTPBasicAuth(COUCHDB_USER, COUCHDB_PASSWORD)

with (Path(__file__).parent / "couch_templates" / "validation.js").open() as f:
    VALIDATION_SCRIPT = f.read().lstrip("const validate = ")


def mail_to_dbname(email: str) -> str:
    return base64.b32encode(email.lower().encode()).decode().rstrip("=").lower()


class AlreadyExists(Exception):
    pass


def ensure_users_exists():
    requests.put(f"{COUCHDB_URL}/_users", auth=COUCHDB_AUTH)


def create_account_and_database(email: str, password: str):
    ensure_users_exists()
    db_name = mail_to_dbname(email)

    logger.debug(f"Create db {db_name}")
    res = requests.put(f"{COUCHDB_URL}/{db_name}", auth=COUCHDB_AUTH)
    data = res.json()

    if "error" in data and data["error"] == "file_exists":
        raise AlreadyExists("database already exists")

    res.raise_for_status()

    logger.debug(f"Inject validation script into {db_name}")
    res = requests.put(
        f"{COUCHDB_URL}/{db_name}/_design/validation",
        json={
            "validate_doc_update": VALIDATION_SCRIPT,
        },
        auth=COUCHDB_AUTH,
    )

    logger.debug(f"create user {email}")
    res = requests.put(
        f"{COUCHDB_URL}/_users/org.couchdb.user:{email}",
        json={
            "name": email,
            "password": password,
            "roles": [],
            "type": "user",
        },
        auth=COUCHDB_AUTH,
    )
    data = res.json()

    if "error" in data and data["error"] == "conflict":
        raise AlreadyExists("user already exists")

    res.raise_for_status()

    logger.debug(f"authorizing user {email} for db {db_name}")
    res = requests.put(
        f"{COUCHDB_URL}/{db_name}/_security",
        json={
            "admins": {
                "names": [],
                "roles": [],
            },
            "members": {
                "names": [email],
                "roles": [],
            },
        },
        auth=COUCHDB_AUTH,
    )
    data = res.json()

    logger.info(data)
    res.raise_for_status()


def delete_account_and_database(email: str):
    db_name = mail_to_dbname(email)

    user_url = f"{COUCHDB_URL}/_users/org.couchdb.user:{email}"

    data = {}

    try:
        res = requests.delete(f"{COUCHDB_URL}/{db_name}", auth=COUCHDB_AUTH)
        data = res.json()
        res.raise_for_status()

    except requests.HTTPError as e:
        logger.warning(
            f"Errors while deleting database for '{email}': error='{e}' response='{data}' -- ignoring"
        )

    try:
        res = requests.get(user_url, auth=COUCHDB_AUTH)
        data = res.json()
        res.raise_for_status()

        res = requests.delete(user_url, params={"rev": data["_rev"]}, auth=COUCHDB_AUTH)
        data = res.json()
        res.raise_for_status()

    except requests.HTTPError as e:
        logger.warning(
            f"Errors while deleting user '{email}': error='{e}' response='{data}' -- ignoring"
        )


def check_credentials(email: str, password: str) -> bool:
    db_name = mail_to_dbname(email)
    res = requests.get(f"{COUCHDB_URL}/{db_name}", auth=HTTPBasicAuth(email, password))
    return res.status_code == 200
