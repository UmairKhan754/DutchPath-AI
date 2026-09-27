from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.rag_service import RAGService


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="DutchPath AI API",
    description=(
        "AI-powered Netherlands study and visa "
        "guidance API for Pakistani students."
    ),
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class ChatRequest(BaseModel):
    question: str


# ============================================================
# RAG SERVICE
# ============================================================

rag_service = RAGService()


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "status": "success",
        "message": "DutchPath AI backend is running.",
        "service": "DutchPath AI RAG API"
    }


# ============================================================
# HEALTH ENDPOINT
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "DutchPath AI"
    }


# ============================================================
# CHAT ENDPOINT
# ============================================================

@app.post("/api/chat")
def chat(request: ChatRequest):

    try:

        question = request.question.strip()

        if not question:

            raise HTTPException(
                status_code=400,
                detail="Question cannot be empty."
            )

        result = rag_service.ask(
            question=question
        )

        return {
            "success": True,
            "answer": result["answer"],
            "sources": result["sources"]
        }

    except HTTPException:

        raise

    except Exception as error:

        print(
            f"Chat endpoint error: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "An internal error occurred "
                "while processing your question."
            )
        )