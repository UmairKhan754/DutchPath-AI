from google import genai

from config import (
    GEMINI_API_KEY,
    GEMINI_MODEL_NAME
)


class GeminiService:
    """
    Handles communication with Google's Gemini API.

    This service is responsible only for generating
    responses from Gemini.

    RAG retrieval will be connected later.
    """

    def __init__(self):
        """
        Initialize the Gemini API client.
        """

        print("Initializing Gemini service...")

        self.client = genai.Client(
            api_key=GEMINI_API_KEY
        )

        self.model_name = GEMINI_MODEL_NAME

        print(
            f"Gemini service initialized successfully."
        )

        print(
            f"Gemini model: {self.model_name}"
        )

    def generate_response(
        self,
        prompt: str
    ) -> str:
        """
        Send a prompt to Gemini and return
        the generated response.
        """

        if not prompt.strip():
            raise ValueError(
                "Prompt cannot be empty."
            )

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt
        )

        if not response.text:
            raise RuntimeError(
                "Gemini returned an empty response."
            )

        return response.text.strip()