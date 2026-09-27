from services.rag_service import RAGService


def main():

    print("=" * 70)
    print("DutchPath AI - Complete RAG Test")
    print("=" * 70)

    # --------------------------------------------------------
    # Initialize RAG service
    # --------------------------------------------------------

    rag = RAGService()

    # --------------------------------------------------------
    # Test question
    # --------------------------------------------------------

    question = (
        "What are the main steps for a Pakistani student "
        "to apply to a Dutch university?"
    )

    print("\nQUESTION:")
    print(question)

    print("\nGenerating RAG answer...\n")

    # --------------------------------------------------------
    # Run complete RAG pipeline
    # --------------------------------------------------------

    result = rag.ask(
        question=question,
        top_k=5
    )

    # --------------------------------------------------------
    # Display answer
    # --------------------------------------------------------

    print("=" * 70)
    print("GENERATED ANSWER")
    print("=" * 70)

    print(result["answer"])

    # --------------------------------------------------------
    # Display retrieved sources
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("RETRIEVED SOURCES")
    print("=" * 70)

    for index, source in enumerate(
        result["sources"],
        start=1
    ):

        print(
            f"\nSOURCE {index}"
        )

        print(
            f"Document: "
            f"{source['document']}"
        )

        print(
            f"Document Number: "
            f"{source['document_number']}"
        )

        print(
            f"Chunk Number: "
            f"{source['chunk_number']}"
        )

        print(
            f"Distance: "
            f"{source['distance']}"
        )

    print("\n" + "=" * 70)
    print("RAG TEST COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()