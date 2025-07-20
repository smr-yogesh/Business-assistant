import chromadb
from uuid import uuid4

client = chromadb.PersistentClient(path="./chroma_db")


def get_or_create_collection(name: str):
    return client.get_or_create_collection(name)


def add_chunks(chunks: list, embeddings: list, collection):
    ids = [str(uuid4()) for _ in chunks]
    collection.add(documents=chunks, embeddings=embeddings, ids=ids)


def query_chunks(query_embedding, k=5, collection=None):
    if not collection:
        raise ValueError("Collection must be provided to query_chunks.")

    results = collection.query(query_embeddings=[query_embedding], n_results=k)
    return results["documents"][0]
