from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import fitz  # PyMuPDF
import io

app = FastAPI()

# Allow frontend to call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory doc store
docs = {}

class Message(BaseModel):
    user_input: str

# Initialize OpenAI-compatible client
client = OpenAI(
    base_url="http://13.239.88.166:8000/v1",
    api_key="EMPTY"
)

# Start of chat context
chat_history = [
    {"role": "system", "content": "You are a corporate training assistant. Answer questions based on uploaded company documents like policies and onboarding material."}
]

@app.post("/upload-doc")
async def upload_doc(file: UploadFile = File(...)):
    content = await file.read()

    # Use PyMuPDF to read PDF and extract text
    try:
        pdf = fitz.open(stream=io.BytesIO(content), filetype="pdf")
        text = ""
        for page in pdf:
            text += page.get_text()
        docs[file.filename] = text
        return {"message": f"{file.filename} uploaded and parsed successfully."}
    except Exception as e:
        return {"error": f"Failed to read PDF: {str(e)}"}

@app.post("/chat")
async def chat_endpoint(msg: Message):
    # Combine all uploaded docs into one big context
    context = "\n\n".join([f"{k}:\n{v}" for k, v in docs.items()])
    user_query_with_context = f"Context:\n{context}\n\nUser: {msg.user_input}"

    chat_history.append({"role": "user", "content": user_query_with_context})

    response_text = ""
    try:
        stream = client.chat.completions.create(
            model="Joey",
            messages=chat_history,
            stream=True,
        )

        for chunk in stream:
            token = chunk.choices[0].delta.content
            if token:
                response_text += token

        chat_history.append({"role": "assistant", "content": response_text})
        return {"response": response_text}

    except Exception as e:
        return {"error": str(e)}
