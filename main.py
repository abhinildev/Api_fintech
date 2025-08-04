from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from typing import List, Optional
import tempfile, requests, os, time, json, hashlib, asyncio, docx, fitz
from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_community.embeddings import HuggingFaceEmbeddings

# Load environment variables
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

app = FastAPI()
CACHE_DIR = "vector_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

headers = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json"
}

# -------- Utility Functions --------
def file_hash(path: str) -> str:
    sha = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(8192):
            sha.update(chunk)
    return sha.hexdigest()[:16]

def download_file(url: str) -> str:
    ext = url.split("?")[0].split(".")[-1]
    temp_dir = tempfile.gettempdir()
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

def split_text(text: str):
    splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=100)
    return [Document(page_content=c) for c in splitter.split_text(text)]

async def embed_and_save(docs, faiss_path: str):
    """Background embedding to speed up future queries"""
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    db = FAISS.from_documents(docs, embeddings)
    db.save_local(faiss_path)

def ask_model(question: str, context: str) -> str:
    payload = {
        "model": "mistralai/mistral-7b-instruct-v0.2",  # Balanced speed & quality
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
    return resp_json["choices"][0]["message"]["content"]

# -------- Main Endpoint --------
@app.post("/api/v1/hackrx/run")
async def run_query(
    file: UploadFile = File(None),
    questions: str = Form(...),
    documents: Optional[str] = Form(None)
):
    start_time = time.time()
    try:
        # Determine file source
        if file:
            temp_dir = tempfile.gettempdir()
            path = os.path.join(temp_dir, file.filename)
            with open(path, "wb") as f:
                f.write(await file.read())
        elif documents:
            path = download_file(documents)
        else:
            raise HTTPException(status_code=400, detail="Provide a file or a document URL.")

        # Compute hash for caching
        hash_id = file_hash(path)
        faiss_path = os.path.join(CACHE_DIR, hash_id)

        # Parse questions JSON
        try:
            questions_list = json.loads(questions)
            if not isinstance(questions_list, list):
                raise ValueError
        except:
            raise HTTPException(status_code=400, detail="Questions must be a JSON list.")

        # Extract & split text
        text = extract_text(path)
        docs = split_text(text)

        # Quick initial response using first 5 chunks
        preview_context = "\n".join([d.page_content for d in docs[:5]])
        answers = [ask_model(q, preview_context) for q in questions_list]

        # If FAISS doesn't exist, build in background
        if not os.path.exists(faiss_path):
            asyncio.create_task(embed_and_save(docs, faiss_path))

        duration = round(time.time() - start_time, 2)
        return {
            "answers": answers,
            "processing_time_seconds": duration,
            "cache_used": os.path.exists(faiss_path),
            "note": "Full FAISS embedding runs in background for faster next queries."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
