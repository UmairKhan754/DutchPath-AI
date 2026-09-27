from typing import List, Dict

from config import DEFAULT_TOP_K
from rag.embeddings import EmbeddingService
from rag.vector_store import VectorStore


class Retriever:
    """
    Handles knowledge retrieval for DutchPath AI.

    Flow:

        User Question
             ↓
        Query Embedding
             ↓
        ChromaDB Search
             ↓
        Relevant KB Chunks
    """

    def __init__(self):
        """
        Initialize the embedding service
        and vector store.
        """

        print("Initializing Retriever...")

        self.embedding_service = EmbeddingService()

        self.vector_store = VectorStore()

        print("Retriever initialized successfully.")

    def retrieve(
        self,
        question: str,
        top_k: int = DEFAULT_TOP_K
    ) -> List[Dict]:
        """
        Retrieve the most relevant knowledge-base
        chunks for a user question.

        Args:
            question: User's question.
            top_k: Number of relevant chunks to retrieve.

        Returns:
            List of retrieved chunks with metadata
            and similarity distance.
        """

        if not question.strip():
            raise ValueError(
                "Question cannot be empty."
            )

        # ----------------------------------------------------
        # STEP 1: Convert user question into embedding
        # ----------------------------------------------------

        query_embedding = (
            self.embedding_service.encode_query(
                question
            )
        )

        # ----------------------------------------------------
        # STEP 2: Search ChromaDB
        # ----------------------------------------------------

        results = self.vector_store.search(
            query_embedding=query_embedding,
            top_k=top_k
        )

        # ----------------------------------------------------
        # STEP 3: Convert ChromaDB response into
        # a cleaner structure
        # ----------------------------------------------------

        retrieved_chunks = []

        documents = results.get("documents", [[]])[0]

        metadatas = results.get("metadatas", [[]])[0]

        distances = results.get("distances", [[]])[0]

        ids = results.get("ids", [[]])[0]

        for index in range(len(documents)):

            retrieved_chunks.append(
                {
                    "id": ids[index],
                    "text": documents[index],
                    "metadata": metadatas[index],
                    "distance": distances[index],
                }
            )

        return retrieved_chunks