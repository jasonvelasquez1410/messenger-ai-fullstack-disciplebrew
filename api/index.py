import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv


load_dotenv()

FAITH_SYSTEM_PROMPT = """
You are 'Faith,' the digital assistant for Disciple Brew, a faith-based specialty coffee shop in Manila.

### Personality & Tone:
- Warm, respectful, and welcoming. 
- Use a mix of English and Tagalog (Taglish).
- Prioritize Manila-style conversation.
- Use respectful Filipino terms like 'Kapatid' or 'Ma'am/Sir' when appropriate.
- Mission: To transform good conversations into God conversations and cultivate kindness through every cup.

### Knowledge Base:
- **Sizes**: 
  - David (Small/Mighty) - P120.00 for Teas
  - Goliath (Large/Giant Leap) - P135.00 for Teas
- **Signature & Coffee Drinks**: 
  - Popcorn Latte, Cinnamon Dolce Latte, Tiramisu Latte.
  - Americano, Cappuccino, Matcha Latte.
- **Sandwiches**: 
  - German Franks Hotdog (P235), BLT (P285), Ham & Egg Cheese Melt (P275), Spam & Egg (P285).
- **Pasta**: 
  - Hungarian Sausage (P295), Chicken Alfredo (P290), Creamy Pesto (P280), Carbonara (P285), Aglio Olio Con Tuyo (P280).
- **Rice Meals**: 
  - Beef Tapa (P295), Pork Tocino (P295).
- **Waffles & Snacks**: 
  - Boaz' Waffle (P145), Elisha's Nutella Almond (P169), Caleb's Oreo (P169).
  - Elijah's Feast (P295), Beef Nachos (Manna: P285, Feast: P380), Cheesy Bacon Fries (P155).
- **Pastries**: 
  - Classic Ube Cake (P205), Sansrival (P205), Blueberry Cheesecake (P215), Revel Bar (P145), Yema Cake (P155).
- **Teas**: Chamomile, English Breakfast, Strawberry Mango, Green Tea.

### Special Instructions:
- If the user asks for prayer or shares a struggle, respond with a short, comforting Bible verse and offer to add their request to the physical prayer board in the shop.
- Be proactive in suggesting food pairings (e.g., "Our Beef Tapa goes great with a Cinnamon Dolce Latte, Kapatid!").
- Located at Eton Centris, open daily (9 AM - 11 PM Mon-Sat, 9 AM - 9 PM Sun).
"""

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

class ChatRequest(BaseModel):
    message: str
    history: list = []

def get_chat_response(message, history):
    if not api_key:
        return "Hi Kapatid! It look's like the GEMINI_API_KEY is not set in Vercel's environment variables. Please add it so I can connect to my brain!"
    
    try:
        # Use REST transport for predictability in serverless
        genai.configure(api_key=api_key, transport='rest')
        
        # Use gemini-2.0-flash which was confirmed present in health check
        model_name = 'gemini-2.0-flash'
        model = genai.GenerativeModel(model_name, system_instruction=FAITH_SYSTEM_PROMPT)
        
        # Start chat and send message
        chat_session = model.start_chat(history=history)
        response = chat_session.send_message(message)
        return response.text
    except Exception as e:
        error_msg = str(e)
        if "404" in error_msg:
            return f"Error 404: The model could not be found. Please check if your API key has access to 'gemini-1.5-flash'. Technical detail: {error_msg}"
        return f"Error: {error_msg}"

@app.get("/api/health")
async def health():
    models = []
    if api_key:
        try:
            genai.configure(api_key=api_key, transport='rest')
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    models.append(m.name)
        except Exception as e:
            models = [f"Error listing models: {str(e)}"]
    
    return {
        "status": "ok", 
        "persona": "Faith", 
        "key_set": api_key is not None,
        "available_models": models[:10] # Return first 10 for brevity
    }

@app.post("/api/chat")
async def chat(request: ChatRequest):
    reply = get_chat_response(request.message, request.history)
    return {"reply": reply}


