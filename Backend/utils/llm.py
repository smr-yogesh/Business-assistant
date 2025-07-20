from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def get_answer(query: str, context_chunks: list) -> str:
    context = "\n".join(context_chunks)

    messages = [
        {
            "role": "system",
            "content": "You are a helpful assistant that answers based only on the given context.",
        },
        {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"},
    ]

    response = client.chat.completions.create(
        model="gpt-3.5-turbo", messages=messages, temperature=0.2
    )

    return response.choices[0].message.content.strip()
