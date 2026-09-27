import os
from pathlib import Path

from dotenv import load_dotenv


# ============================================================
# PROJECT PATHS
# ============================================================

# backend/
BASE_DIR = Path(__file__).resolve().parent

# backend/data/
DATA_DIR = BASE_DIR / "data"

# backend/data/raw/
RAW_DATA_DIR = DATA_DIR / "raw"

# backend/data/chroma_db/
CHROMA_DB_DIR = DATA_DIR / "chroma_db"

# Knowledge Base file
KNOWLEDGE_BASE_FILE = RAW_DATA_DIR / "DutchPath_AI_Complete_Knowledge_Base.txt"


# ============================================================
# ENVIRONMENT VARIABLES
# ============================================================

# Load variables from backend/.env
load_dotenv(BASE_DIR / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


# ============================================================
# AI SETTINGS
# ============================================================

# Same embedding model used in your Colab RAG prototype
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Gemini model used in your existing prototype
GEMINI_MODEL_NAME = "gemini-3.6-flash"


# ============================================================
# RAG SETTINGS
# ============================================================

DEFAULT_TOP_K = 5

CHUNK_SIZE_WORDS = 800


# ============================================================
# VALIDATION
# ============================================================

if not GEMINI_API_KEY:
    raise ValueError(
        "GEMINI_API_KEY is missing. "
        "Please add your Gemini API key to the .env file."
    )