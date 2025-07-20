from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))  # Use env variable safely


def get_embedding(text: str) -> list:
    response = client.embeddings.create(model="text-embedding-ada-002", input=text)
    return response.data[0].embedding
