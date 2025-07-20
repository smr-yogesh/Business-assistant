def chunk_text(text: str, max_length: int = 500) -> list:
    chunks = []
    words = text.split()
    for i in range(0, len(words), max_length):
        chunks.append(" ".join(words[i : i + max_length]))
    return chunks
