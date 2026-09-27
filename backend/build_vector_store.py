from config import (
    KNOWLEDGE_BASE_FILE,
    CHUNK_SIZE_WORDS
)

from rag.chunking import create_chunks
from rag.embeddings import EmbeddingService
from rag.vector_store import VectorStore


def main():
    print("=" * 60)
    print("DutchPath AI - Building Vector Store")
    print("=" * 60)

    # --------------------------------------------------------
    # STEP 1: Create chunks from the knowledge base
    # --------------------------------------------------------

    print("\n[1/3] Creating knowledge-base chunks...")

    chunks = create_chunks(
        KNOWLEDGE_BASE_FILE,
        max_words=CHUNK_SIZE_WORDS
    )

    print(
        f"Total chunks created: {len(chunks)}"
    )

    # --------------------------------------------------------
    # STEP 2: Generate embeddings
    # --------------------------------------------------------

    print("\n[2/3] Generating embeddings...")

    embedding_service = EmbeddingService()

    texts = [
        chunk["text"]
        for chunk in chunks
    ]

    embeddings = embedding_service.encode_texts(
        texts
    )

    print(
        f"Total embeddings generated: "
        f"{len(embeddings)}"
    )

    print(
        f"Embedding dimension: "
        f"{len(embeddings[0])}"
    )

    # --------------------------------------------------------
    # STEP 3: Store everything in ChromaDB
    # --------------------------------------------------------

    print("\n[3/3] Storing vectors in ChromaDB...")

    vector_store = VectorStore()

    vector_store.add_chunks(
        chunks,
        embeddings
    )

    print("\n" + "=" * 60)
    print("VECTOR STORE BUILD COMPLETE")
    print("=" * 60)

    print(
        f"Total vectors in database: "
        f"{vector_store.count()}"
    )


if __name__ == "__main__":
    main()