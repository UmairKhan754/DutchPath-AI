import re
from pathlib import Path
from typing import List, Dict


def read_knowledge_base(file_path: Path) -> str:
    """
    Read the complete DutchPath AI knowledge base.

    Args:
        file_path: Path to the knowledge base TXT file.

    Returns:
        Complete knowledge base text.
    """

    if not file_path.exists():
        raise FileNotFoundError(
            f"Knowledge base file not found: {file_path}"
        )

    return file_path.read_text(
        encoding="utf-8"
    )


def split_documents(text: str) -> List[Dict]:
    """
    Split the knowledge base into DOCUMENT sections.

    The existing DutchPath AI KB uses headings such as:

        DOCUMENT 1: ...
        DOCUMENT 2: ...

    Returns:
        A list containing document number, title and content.
    """

    pattern = r"DOCUMENT\s+(\d+):\s*([^\n]+)"

    matches = list(re.finditer(pattern, text, re.IGNORECASE))

    if not matches:
        raise ValueError(
            "No DOCUMENT headings were found in the knowledge base."
        )

    documents = []

    for index, match in enumerate(matches):

        document_number = int(match.group(1))
        document_title = match.group(2).strip()

        start = match.end()

        if index + 1 < len(matches):
            end = matches[index + 1].start()
        else:
            end = len(text)

        content = text[start:end].strip()

        documents.append(
            {
                "document_number": document_number,
                "document_title": document_title,
                "content": content,
            }
        )

    return documents


def split_into_chunks(
    document: Dict,
    max_words: int = 800
) -> List[Dict]:
    """
    Split one document into paragraph-based chunks.

    The original Colab prototype used a maximum
    size of approximately 800 words per chunk.
    """

    paragraphs = [
        paragraph.strip()
        for paragraph in document["content"].split("\n\n")
        if paragraph.strip()
    ]

    chunks = []

    current_paragraphs = []
    current_word_count = 0
    chunk_number = 1

    for paragraph in paragraphs:

        paragraph_word_count = len(
            paragraph.split()
        )

        # If adding this paragraph would exceed
        # the maximum chunk size, save the current chunk.
        if (
            current_paragraphs
            and current_word_count + paragraph_word_count > max_words
        ):

            chunk_text = "\n\n".join(
                current_paragraphs
            )

            chunks.append(
                {
                    "id": (
                        f"doc{document['document_number']}"
                        f"_chunk{chunk_number}"
                    ),
                    "document": document["document_title"],
                    "document_number": document["document_number"],
                    "chunk_number": chunk_number,
                    "text": chunk_text,
                }
            )

            chunk_number += 1
            current_paragraphs = []
            current_word_count = 0

        current_paragraphs.append(paragraph)
        current_word_count += paragraph_word_count

    # Add remaining paragraphs.
    if current_paragraphs:

        chunk_text = "\n\n".join(
            current_paragraphs
        )

        chunks.append(
            {
                "id": (
                    f"doc{document['document_number']}"
                    f"_chunk{chunk_number}"
                ),
                "document": document["document_title"],
                "document_number": document["document_number"],
                "chunk_number": chunk_number,
                "text": chunk_text,
            }
        )

    return chunks


def create_chunks(
    file_path: Path,
    max_words: int = 800
) -> List[Dict]:
    """
    Complete KB processing pipeline:

        TXT file
          ↓
        Documents
          ↓
        Paragraph chunks
          ↓
        Metadata

    Returns:
        List of all chunks.
    """

    text = read_knowledge_base(file_path)

    documents = split_documents(text)

    all_chunks = []

    for document in documents:

        document_chunks = split_into_chunks(
            document,
            max_words=max_words
        )

        all_chunks.extend(
            document_chunks
        )

    return all_chunks