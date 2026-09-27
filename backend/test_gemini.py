from services.gemini_service import GeminiService


def main():

    print("=" * 60)
    print("DutchPath AI - Gemini Test")
    print("=" * 60)

    gemini = GeminiService()

    prompt = """
You are testing the DutchPath AI backend.

Reply with exactly:

Gemini connection successful.
"""

    print("\nSending test request to Gemini...\n")

    answer = gemini.generate_response(
        prompt
    )

    print("=" * 60)
    print("GEMINI RESPONSE")
    print("=" * 60)

    print(answer)

    print("\n" + "=" * 60)
    print("GEMINI TEST COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()