from rag.retriever import Retriever


def main():

    print("=" * 60)
    print("DutchPath AI - Retrieval Test")
    print("=" * 60)

    retriever = Retriever()

    question = (
        "How do I apply to a Dutch university "
        "from Pakistan?"
    )

    print("\nQUESTION:")
    print(question)

    print("\nSearching knowledge base...\n")

    results = retriever.retrieve(
        question=question,
        top_k=5
    )

    print("=" * 60)
    print(f"RETRIEVED CHUNKS: {len(results)}")
    print("=" * 60)

    for index, result in enumerate(results, start=1):

        print("\n" + "-" * 60)
        print(f"RESULT {index}")
        print("-" * 60)

        print(
            f"ID: {result['id']}"
        )

        print(
            f"Document: "
            f"{result['metadata']['document']}"
        )

        print(
            f"Document Number: "
            f"{result['metadata']['document_number']}"
        )

        print(
            f"Chunk Number: "
            f"{result['metadata']['chunk_number']}"
        )

        print(
            f"Distance: "
            f"{result['distance']}"
        )

        print("\nCONTENT PREVIEW:")

        print(
            result["text"][:1000]
        )


if __name__ == "__main__":
    main()