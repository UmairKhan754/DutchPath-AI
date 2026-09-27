from typing import List

from sentence_transformers import SentenceTransformer

from config import EMBEDDING_MODEL_NAME


class EmbeddingService:
    """
    Handles loading the embedding model
    and converting text into vector embeddings.
    """

    def __init__(self):
        print(
            f"Loading embedding model: "
            f"{EMBEDDING_MODEL_NAME}"
        )

        self.model = SentenceTransformer(
            EMBEDDING_MODEL_NAME
        )

        print("Embedding model loaded successfully.")

    def encode_texts(
        self,
        texts: List[str]
    ) -> List[List[float]]:
        """
        Convert multiple text chunks into embeddings.

        normalize_embeddings=True keeps the vectors
        normalized, matching the original Colab RAG.
        """

        embeddings = self.model.encode(
            texts,
            normalize_embeddings=True,
            show_progress_bar=True
        )

        return embeddings.tolist()

    def encode_query(
        self,
        query: str
    ) -> List[float]:
        """
        Convert a user question into a single
        normalized embedding vector.
        """

        embedding = self.model.encode(
            [query],
            normalize_embeddings=True
        )[0]

        return embedding.tolist()