"""FastAPI application factory.

Run locally:  uvicorn app.main:create_app --factory --reload

There is no module-level `app`, so importing this module (e.g. in tests) never reads the
environment or configures logging as a side effect.
"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.api.v1.router import API_V1_PREFIX, api_router
from app.core.config import Settings, get_settings
from app.core.logging import configure_logging
from app.core.middleware import REQUEST_ID_HEADER, RequestContextMiddleware
from app.db.session import create_engine, create_session_factory


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        # Engine creation does not connect; the first query does. Startup never blocks on DB.
        engine = create_engine(settings)
        app.state.db_engine = engine
        app.state.db_session_factory = create_session_factory(engine)
        try:
            yield
        finally:
            await engine.dispose()

    docs = settings.docs_enabled
    app = FastAPI(
        title="Konkan Discovery API",
        version=__version__,
        lifespan=lifespan,
        openapi_url=f"{API_V1_PREFIX}/openapi.json" if docs else None,
        docs_url=f"{API_V1_PREFIX}/docs" if docs else None,
        redoc_url=None,
    )

    if settings.cors_allowed_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_allowed_origins,
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allow_headers=["Authorization", "Content-Type", "Accept-Language", REQUEST_ID_HEADER],
            expose_headers=[REQUEST_ID_HEADER],
        )
    # Added last so it is the outermost middleware and sees every response.
    app.add_middleware(RequestContextMiddleware)

    app.include_router(api_router)
    return app
