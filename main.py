from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import tempfile
import requests, fitz, docx, os
from dotenv import load_dotenv

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings  # ✅ New import
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_community.embeddings import HuggingFaceEmbeddings
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

app = FastAPI()
vector_index = None

class QueryInput(BaseModel):
    documents: str
    questions: List[str]

class QueryOutput(BaseModel):
    answers: List[str]

headers = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json"
}
#print("API KEY:", OPENROUTER_API_KEY)

def download_file(url: str) -> str:
    ext = url.split("?")[0].split(".")[-1]
    temp_dir = tempfile.gettempdir()  # Cross-platform temp dir
    path = os.path.join(temp_dir, f"temp.{ext}")
    response = requests.get(url)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to download document.")
    with open(path, "wb") as f:
        f.write(response.content)
    return path

def extract_text(path: str) -> str:
    if path.endswith(".pdf"):
        doc = fitz.open(path)
        return "\n".join([page.get_text() for page in doc])
    elif path.endswith(".docx"):
        doc = docx.Document(path)
        return "\n".join([p.text for p in doc.paragraphs])
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type.")

def embed_text(text: str):
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = [Document(page_content=c) for c in splitter.split_text(text)]

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"  # lightweight and fast
    )
    return FAISS.from_documents(docs, embeddings)

def retrieve_chunks(index, query: str, k: int = 4) -> List[str]:
    return [doc.page_content for doc in index.similarity_search(query, k=k)]

def ask_model(question: str, context: str) -> str:
    payload = {
        "model": "openrouter/horizon-beta",
        "messages": [
            {"role": "system", "content": "You're an expert on policy and legal document questions."},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"}
        ]
    }
    response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
    if response.status_code != 200:
        print("OpenRouter Error:", response.status_code, response.text)
        return "Model failed. Try again."
    resp_json = response.json()
    #print("OpenRouter full response:", resp_json)  # <== add this
    return resp_json["choices"][0]["message"]["content"]


@app.post("/api/v1/hackrx/run", response_model=QueryOutput)
def run_query(data: QueryInput):
    global vector_index
    try:
        path = download_file(data.documents)
        text = extract_text(path)
        vector_index = embed_text(text)

        answers = []
        for q in data.questions:
            chunks = retrieve_chunks(vector_index, q)
            context = "\n".join(chunks)
            answer = ask_model(q, context)
            answers.append(answer)

        return {"answers": answers}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
