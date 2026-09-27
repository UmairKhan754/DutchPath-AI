from typing import List, Dict

import chromadb

from config import CHROMA_DB_DIR


class VectorStore:
    """
    Handles the local ChromaDB vector database
    used by DutchPath AI.
    """

    COLLECTION_NAME = "dutchpath_knowledge"

    def __init__(self):
        """
        Initialize a persistent ChromaDB client
        and create/get the DutchPath knowledge collection.
        """

        print(
            f"Initializing ChromaDB at: "
            f"{CHROMA_DB_DIR}"
        )

        # Create a persistent local ChromaDB client.
        self.client = chromadb.PersistentClient(
            path=str(CHROMA_DB_DIR)
        )

        # Create the collection if it does not exist,
        # otherwise load the existing collection.
        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME
        )

        print(
            f"ChromaDB collection ready: "
            f"{self.COLLECTION_NAME}"
        )

        print(
            f"Existing vectors: "
            f"{self.collection.count()}"
        )

    def add_chunks(
        self,
        chunks: List[Dict],
        embeddings: List[List[float]]
    ):
        """
        Add knowledge-base chunks and their embeddings
        to ChromaDB.
        """

        if len(chunks) != len(embeddings):
            raise ValueError(
                "Number of chunks and embeddings must match."
            )

        ids = [
            chunk["id"]
            for chunk in chunks
        ]

        documents = [
            chunk["text"]
            for chunk in chunks
        ]

        metadatas = [
            {
                "document": chunk["document"],
                "document_number": chunk["document_number"],
                "chunk_number": chunk["chunk_number"],
            }
            for chunk in chunks
        ]

        self.collection.upsert(
            ids=ids,
            documents=documents,
            metadatas=metadatas,
            embeddings=embeddings
        )

        print(
            f"Successfully stored "
            f"{len(chunks)} chunks in ChromaDB."
        )

    def search(
        self,
        query_embedding: List[float],
        top_k: int = 5
    ) -> Dict:
        """
        Search ChromaDB using a query embedding.

        Returns the most relevant knowledge-base chunks.
        """

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )

        return results

    def count(self) -> int:
        """
        Return the total number of stored vectors.
        """

        return self.collection.count()