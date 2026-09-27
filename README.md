# DutchPath AI 🇳🇱

**DutchPath AI** is an AI-powered **Retrieval-Augmented Generation (RAG) chatbot** designed to help international students understand the process of studying in the Netherlands.

The system combines a curated knowledge base, semantic search, vector embeddings, ChromaDB, FastAPI, and Google Gemini to provide contextual answers about Dutch university admissions, Studielink, financial requirements, MVV/VVR visa procedures, documentation, and common application mistakes.

The project was developed as a full-stack AI application with a custom frontend and a Python-based RAG backend.

---

##  Project Overview

International students often need to search across multiple websites to understand:

- University admission requirements
- English language requirements
- Studielink application procedures
- Required documents
- Financial proof requirements
- Student visa procedures
- MVV and VVR processes
- Common application mistakes

DutchPath AI attempts to simplify this process by providing a conversational interface where students can ask questions and receive answers generated from a dedicated Netherlands study and visa knowledge base.

Instead of relying only on the language model's general knowledge, the system retrieves relevant information from the project's knowledge base before generating a response.

This approach helps make the chatbot more focused, contextual, and suitable for a specific domain.

---

##  Project Objectives

The main objectives of DutchPath AI are:

- Build a domain-specific chatbot for Netherlands study guidance
- Implement a complete Retrieval-Augmented Generation pipeline
- Retrieve relevant information using semantic similarity
- Generate answers using Google Gemini
- Store and search document embeddings using ChromaDB
- Provide a clean and responsive frontend interface
- Connect the frontend with a FastAPI backend
- Reduce unsupported or unrelated AI responses
- Demonstrate a complete AI application suitable for a technical portfolio

---

##  Key Features

###  AI-Powered Chatbot

DutchPath AI uses the Google Gemini API to generate natural-language responses based on retrieved information.

###  Retrieval-Augmented Generation

The chatbot does not rely only on the LLM. Relevant information is first retrieved from the project's knowledge base and then provided to Gemini as context.

###  Semantic Search

User questions are converted into embeddings and compared against stored knowledge-base embeddings to retrieve the most relevant document chunks.

###  Sentence Transformer Embeddings

The project uses:

```text
sentence-transformers/all-MiniLM-L6-v2