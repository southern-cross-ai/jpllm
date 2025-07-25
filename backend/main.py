from fastapi import FastAPI, Request
from pydantic import BaseModel
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware

client = OpenAI(
    base_url="http://13.239.88.166:8000/v1",
    api_key="EMPTY"
)

app = FastAPI()

# Enable CORS so frontend can call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or your frontend's actual domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chat_history = [
    {"role": "system", "content": "You are JoeyLLM, an assistant developed by Southern Cross AI."}
]

class Message(BaseModel):
    user_input: str

@app.post("/chat")
async def chat_endpoint(msg: Message):
    global chat_history

    user_input = msg.user_input
    chat_history.append({"role": "user", "content": user_input})

    response_text = ""
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
