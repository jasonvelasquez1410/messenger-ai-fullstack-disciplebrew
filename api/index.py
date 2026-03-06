import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
from .persona import FAITH_SYSTEM_PROMPT
from mangum import Mangum

load_dotenv()

app = FastAPI()

# Configure CORS for local development and Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=FAITH_SYSTEM_PROMPT)

class ChatRequest(BaseModel):
    message: str
    history: list = []

@app.get("/api/health")
async def health():
    return {"status": "ok", "persona": "Faith"}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not api_key:
        return {"reply": "Welcome to Disciple Brew! I'm Faith. My brain (API Key) isn't connected yet, but I'm ready to serve you coffee! God bless!"}
    
    try:
        chat_session = model.start_chat(history=request.history)
        response = chat_session.send_message(request.message)
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# For Vercel deployment
handler = Mangum(app)
