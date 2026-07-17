from typing import Any
from fastapi import APIRouter
from app.api.v1.endpoints import bi

BI_ROUTERS: list[tuple[APIRouter, str, list[str]]] = [
    (bi.router, "/bi", ["Business Intelligence"])
]
