from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router

from app.core.config import APP_NAME, VERSION

app = FastAPI(
    title=APP_NAME,
    version=VERSION,
    description="The World's AI Workforce Platform",
)

app.include_router(
    api_router,
    prefix="/api/v1"
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    del request
    if isinstance(exc.detail, dict) and "success" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content=exc.detail, headers=exc.headers)
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": str(exc.detail), "errors": None},
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(request: Request, exc: RequestValidationError):
    del request
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": "Validation error", "errors": exc.errors()},
    )


@app.get("/")
async def root():
    return {
        "project": APP_NAME,
        "status": "Running",
        "version": VERSION,
    }


@app.get("/health")
async def health():
    return {
        "status": "Healthy",
    }
