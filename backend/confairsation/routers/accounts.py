from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel, EmailStr
from starlette.status import HTTP_401_UNAUTHORIZED

from confairsation.utilities.couch import (
    AlreadyExists,
    create_account_and_database,
    check_credentials,
    delete_account_and_database,
    mail_to_dbname,
)
from confairsation.utilities.token import check_token, create_token

router = APIRouter()

user_auth = HTTPBasic()


class RequestTokenRequest(BaseModel):
    email: EmailStr


@router.post("/token")
def post_token(request: RequestTokenRequest):
    """
    Request a registration token for an E-mail address.

    This will generate a token and send it to the requested address. The token can be used to call the `/register` method to properly set up the account.
    """

    token = create_token(request.email)

    return {"TODO_REMOVE_THIS": token.hex()}


class RegisterAccountRequest(BaseModel):
    email: EmailStr
    password: str
    token: str


@router.post("/register")
def post_register(request: RegisterAccountRequest):
    token = bytes.fromhex(request.token)

    if not check_token(request.email, token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid registration token",
        )

    try:
        create_account_and_database(request.email, request.password)
    except AlreadyExists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Already registered"
        )

    return {"ok": True, "database": mail_to_dbname(request.email)}


class GetAccountResponse(BaseModel):
    database: str


@router.get("/")
def get_account(
    credentials: Annotated[HTTPBasicCredentials, Depends(user_auth)],
) -> GetAccountResponse:
    if not check_credentials(credentials.username, credentials.password):
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Bad credentials")

    return GetAccountResponse(
        database=mail_to_dbname(credentials.username),
    )


@router.delete("/")
def delete_account(credentials: Annotated[HTTPBasicCredentials, Depends(user_auth)]):
    if not check_credentials(credentials.username, credentials.password):
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Bad credentials")

    delete_account_and_database(credentials.username)

    return {"ok": True}
