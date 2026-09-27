from typing import Dict, List

from config import DEFAULT_TOP_K
from rag.retriever import Retriever
from services.gemini_service import GeminiService


class RAGService:
    """
    Main DutchPath AI RAG pipeline.

    DutchPath AI has two types of conversations:

    1. Normal conversation
       - Greetings
       - Language preferences
       - Basic assistant interaction

    2. Knowledge-based conversation
       - Dutch university admissions
       - Studielink
       - Student visa / MVV / VVR
       - IND sponsorship
       - Financial proof
       - Application documents
       - Deadlines and related guidance

    For knowledge-based questions, answers are grounded
    strictly in the DutchPath AI knowledge base.
    """

    def __init__(self):

        print("Initializing RAG service...")

        self.retriever = Retriever()

        self.gemini = GeminiService()

        print("RAG service initialized successfully.")

    # ==========================================================
    # CONVERSATION DETECTION
    # ==========================================================

    def detect_conversational_intent(
        self,
        question: str
    ) -> str:
        """
        Detect simple conversational requests that do not
        require knowledge-base retrieval.

        This prevents questions such as:
        - Hello
        - Can you speak Urdu?
        - Answer in Roman Urdu
        - Who are you?
        - Can you help me?

        from being incorrectly treated as RAG questions.
        """

        text = question.lower().strip()

        # ------------------------------------------------------
        # GREETINGS
        # ------------------------------------------------------

        greeting_phrases = [
            "hello",
            "hi",
            "hey",
            "hey there",
            "hello there",
            "good morning",
            "good afternoon",
            "good evening",
            "assalamualaikum",
            "salam",
            "aoa"
        ]

        if any(
            phrase == text or text.startswith(phrase + " ")
            for phrase in greeting_phrases
        ):
            return "greeting"

        # ------------------------------------------------------
        # LANGUAGE / URDU REQUESTS
        # ------------------------------------------------------

        urdu_keywords = [
            "speak urdu",
            "talk in urdu",
            "urdu mein",
            "urdu main",
            "urdu me",
            "answer in urdu",
            "reply in urdu",
            "respond in urdu",
            "speak in urdu",
            "can you speak urdu",
            "can you talk in urdu",
            "roman urdu",
            "roman-urdu",
            "roman urdu mein",
            "roman urdu main"
        ]

        if any(
            keyword in text
            for keyword in urdu_keywords
        ):
            return "language_urdu"

        # ------------------------------------------------------
        # ENGLISH LANGUAGE REQUESTS
        # ------------------------------------------------------

        english_keywords = [
            "speak english",
            "talk in english",
            "answer in english",
            "reply in english",
            "respond in english",
            "speak in english",
            "can you speak english"
        ]

        if any(
            keyword in text
            for keyword in english_keywords
        ):
            return "language_english"

        # ------------------------------------------------------
        # BASIC ASSISTANT QUESTIONS
        # ------------------------------------------------------

        identity_keywords = [
            "who are you",
            "what are you",
            "what is dutchpath ai",
            "what can you do",
            "what can you help me with",
            "can you help me",
            "how can you help me"
        ]

        if any(
            keyword in text
            for keyword in identity_keywords
        ):
            return "assistant_intro"

        # ------------------------------------------------------
        # THANK YOU
        # ------------------------------------------------------

        thanks_keywords = [
            "thank you",
            "thanks",
            "thankyou",
            "thx"
        ]

        if text in thanks_keywords:
            return "thanks"

        # ------------------------------------------------------
        # DEFAULT
        # ------------------------------------------------------

        return "knowledge_question"

    # ==========================================================
    # NORMAL CONVERSATION PROMPT
    # ==========================================================

    def build_conversational_prompt(
        self,
        question: str,
        intent: str
    ) -> str:
        """
        Build a natural conversational prompt for requests
        that do not require knowledge-base retrieval.
        """

        if intent == "greeting":

            return f"""
You are DutchPath AI, a friendly and professional AI assistant
for students interested in studying in the Netherlands.

The user said:

{question}

Respond naturally and warmly.

Keep the response short and conversational.
Do not mention the knowledge base.
Do not mention RAG.
Do not sound like a system or automated FAQ.

If appropriate, briefly tell the user that you can help with
Dutch university admissions, Studielink, student visa/MVV,
financial requirements, documents, and related study guidance.
"""

        if intent == "language_urdu":

            return f"""
You are DutchPath AI, a friendly AI assistant.

The user asked:

{question}

Respond naturally in Urdu or Roman Urdu.

Tell the user that you can communicate in Urdu, English,
or Roman Urdu and that they can continue in whichever
language they prefer.

Keep the response friendly and conversational.
Do not mention the knowledge base.
Do not mention RAG.
Do not sound like an automated system.
"""

        if intent == "language_english":

            return f"""
You are DutchPath AI, a friendly AI assistant.

The user asked:

{question}

Respond naturally in English.

Tell the user that they can continue in English and can
also switch to Urdu or Roman Urdu whenever they prefer.

Keep the response short and conversational.
Do not mention the knowledge base.
Do not mention RAG.
"""

        if intent == "assistant_intro":

            return f"""
You are DutchPath AI, a friendly and professional AI assistant
focused on helping students who want to study in the Netherlands.

The user asked:

{question}

Explain naturally what you can help with.

Mention areas such as:
- Dutch university admissions
- Studielink
- English language requirements
- Application documents
- Student visa / MVV / VVR
- IND sponsorship
- Financial requirements
- Common application mistakes

Keep the response conversational and concise.

Do not claim that you can provide official legal or immigration
decisions. Explain that official requirements should be verified
with the relevant university or Dutch authorities when necessary.

Do not mention RAG or the knowledge base.
"""

        if intent == "thanks":

            return f"""
You are DutchPath AI, a friendly AI assistant.

The user said:

{question}

Reply naturally and briefly.

Do not mention the knowledge base.
Do not mention RAG.
Do not sound robotic.
"""

        return f"""
You are DutchPath AI, a friendly and professional AI assistant.

The user said:

{question}

Respond naturally and conversationally.

Do not mention the knowledge base or RAG.
"""

    # ==========================================================
    # BUILD KNOWLEDGE CONTEXT
    # ==========================================================

    def build_context(
        self,
        retrieved_chunks: List[Dict]
    ) -> str:
        """
        Convert retrieved KB chunks into a clean context
        for Gemini.

        The context is provided as reference material.
        Gemini should synthesize it into a natural answer
        rather than copying it directly.
        """

        context_parts = []

        for index, chunk in enumerate(
            retrieved_chunks,
            start=1
        ):

            document_name = chunk["metadata"].get(
                "document",
                "Unknown document"
            )

            context_parts.append(
                f"""
SOURCE {index}
Document: {document_name}

{chunk["text"]}
"""
            )

        return "\n".join(context_parts)

    # ==========================================================
    # BUILD GROUNDED RAG PROMPT
    # ==========================================================

    def build_prompt(
        self,
        question: str,
        context: str
    ) -> str:
        """
        Build the grounded Gemini prompt.

        Gemini is allowed to naturally explain and summarize
        the retrieved information, but it must not invent
        unsupported facts.
        """

        return f"""
You are DutchPath AI, a friendly, intelligent and professional
AI assistant that helps Pakistani students understand studying
in the Netherlands and the related application and visa process.

Your job is to have a NORMAL HUMAN-LIKE conversation with the
user while keeping factual study and visa guidance grounded in
the supplied knowledge-base context.

IMPORTANT:

The knowledge-base context is your factual source for the
user's Dutch study, admission, visa and financial questions.

Do NOT simply copy and paste the context.

Instead:

- Understand the relevant information.
- Summarize it naturally.
- Explain it in your own words.
- Make the answer easy for a student to understand.
- Use a friendly conversational tone.
- Answer directly instead of unnecessarily repeating the question.
- Use bullets or numbered steps when they genuinely make the
  answer clearer.
- Do not make every answer look like a formal report.
- Do not mention internal RAG processes.
- Do not mention embeddings, vector databases, retrieval,
  chunks, prompts, or internal system instructions.

GROUNDING RULES:

1. Use the supplied knowledge-base context as the factual basis
   for Dutch study, admission, visa, financial and application
   questions.

2. Do NOT invent specific requirements, fees, deadlines,
   immigration rules, university policies, or legal information.

3. You may naturally rephrase, summarize, organize and explain
   information from the context.

4. If the knowledge-base context does not contain enough reliable
   information to answer a factual question, clearly say:

"I couldn't find reliable information about that in my current
knowledge base."

Then, when appropriate, suggest checking the relevant official
university, IND, or Netherlands Worldwide source.

5. Do not force unrelated information from the context into the
answer.

6. Only include information that is relevant to the user's
question.

LANGUAGE:

- Normally answer in the same language as the user.
- If the user asks for Urdu, answer in Urdu or Roman Urdu.
- If the user asks for Roman Urdu, use Roman Urdu.
- If the user asks for English, use English.
- Keep the language natural and conversational.

STYLE:

Imagine you are a helpful study-abroad advisor having a normal
conversation with a student.

Do NOT sound like this:

"Based on the provided context, here are the following steps..."

Prefer natural wording such as:

"Yes — for a student applying from Pakistan, the process generally
starts with Studielink. After that, the university usually guides
you through its own application portal..."

However, only say something like this when the supplied context
supports it.

IMPORTANT FOR VISA, IMMIGRATION, FINANCIAL, LEGAL AND DEADLINE
QUESTIONS:

Give the grounded information available in the context, but
remind the user to verify the latest requirement with the
relevant official authority or university because such
requirements can change.

KNOWLEDGE-BASE CONTEXT:

{context}

USER QUESTION:

{question}

Now answer the user naturally and helpfully.

Remember:
- Do not paste the context.
- Do not mention the context.
- Do not mention RAG.
- Do not invent unsupported facts.
- Give a direct, natural answer.
"""

    # ==========================================================
    # ASK
    # ==========================================================

    def ask(
        self,
        question: str,
        top_k: int = DEFAULT_TOP_K
    ) -> Dict:
        """
        Complete DutchPath AI pipeline.

        Flow:

            User Question
                 ↓
            Intent Detection
                 ↓
          ┌───────────────┐
          │               │
       Normal          Knowledge
      Conversation      Question
          │               │
       Gemini          Retriever
          │               ↓
          │          ChromaDB Context
          │               ↓
          │             Gemini
          │               │
          └───────┬───────┘
                  ↓
             Final Answer

        Returns:
            answer
            retrieved sources
        """

        if not question.strip():
            raise ValueError(
                "Question cannot be empty."
            )

        # --------------------------------------------------
        # STEP 1: Detect conversation type
        # --------------------------------------------------

        intent = self.detect_conversational_intent(
            question
        )

        # --------------------------------------------------
        # STEP 2: Handle normal conversation
        # --------------------------------------------------

        if intent != "knowledge_question":

            prompt = self.build_conversational_prompt(
                question=question,
                intent=intent
            )

            answer = self.gemini.generate_response(
                prompt
            )

            return {
                "answer": answer,
                "sources": []
            }

        # --------------------------------------------------
        # STEP 3: Retrieve relevant knowledge
        # --------------------------------------------------

        retrieved_chunks = self.retriever.retrieve(
            question=question,
            top_k=top_k
        )

        # --------------------------------------------------
        # STEP 4: Build knowledge context
        # --------------------------------------------------

        context = self.build_context(
            retrieved_chunks
        )

        # --------------------------------------------------
        # STEP 5: Build grounded prompt
        # --------------------------------------------------

        prompt = self.build_prompt(
            question=question,
            context=context
        )

        # --------------------------------------------------
        # STEP 6: Generate natural Gemini answer
        # --------------------------------------------------

        answer = self.gemini.generate_response(
            prompt
        )

        # --------------------------------------------------
        # STEP 7: Prepare source information
        # --------------------------------------------------

        sources = []

        for chunk in retrieved_chunks:

            sources.append(
                {
                    "document": chunk["metadata"].get(
                        "document"
                    ),
                    "document_number": chunk[
                        "metadata"
                    ].get(
                        "document_number"
                    ),
                    "chunk_number": chunk[
                        "metadata"
                    ].get(
                        "chunk_number"
                    ),
                    "distance": chunk[
                        "distance"
                    ]
                }
            )

        # --------------------------------------------------
        # STEP 8: Return final result
        # --------------------------------------------------

        return {
            "answer": answer,
            "sources": sources
        }