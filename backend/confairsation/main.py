from fastapi import FastAPI

from confairsation.routers.accounts import router as accounts_router

app = FastAPI(title="Confairsation API")

app.include_router(accounts_router, prefix="/accounts", tags=["Accounts"])


@app.get("/")
def get_index():
    return {"ok": True}
