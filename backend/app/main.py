from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth
from app.routes import profile

from app.core.config import settings

# 🔥 Import all your routers
from app.routes.generate import router as generate_router
from app.routes.flow import router as flow_router
from app.routes.run_code import router as run_code_router
from app.routes.parse import router as parse_router
# (later: answers_router)
from app.routes.routes_evaluation import router as evaluation_router


def get_application() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="AI-powered coding assessment backend"
    )

    # 🔥 CORS (important for frontend)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # change later
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 🔥 Prefix all routes with /api
    app.include_router(generate_router, prefix="/api")
    app.include_router(flow_router, prefix="/api")
    app.include_router(run_code_router, prefix="/api")
    app.include_router(parse_router, prefix="/api")
    app.include_router(auth.router, prefix="/api")
    app.include_router(evaluation_router, prefix="/api")
    app.include_router(profile.router, prefix="/api")

    return app


app = get_application()


@app.get("/")
def health_check():
    return {"status": "Skill Mirror backend is live 🚀"}