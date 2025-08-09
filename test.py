import chromadb

client = chromadb.PersistentClient(path=".chroma")

for collection in client.list_collections():
    print("Collection:", collection.name)
    data = collection.get()
    print(data)  # shows ids, embeddings, and metadata
