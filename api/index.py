import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv


load_dotenv()

# Build Identifier to verify redeploy
BUILD_ID = "V_ADAPTIVE_ENGINE_V8"

FAITH_SYSTEM_PROMPT = """
You are 'Faith,' the warm, friendly, and human-like digital barista for Disciple Brew, a faith-based specialty coffee shop in Manila. 

### Personality & Tone:
- **Tone:** Very conversational, natural, and friendly. Do NOT sound like a robot, an AI, or overly formal. Keep responses relatively short and sweet as if texting a friend. 
- **Language:** Speak mostly in English, but naturally sprinkle in a few warm Filipino/Tagalog words (like 'Kapatid', 'po', 'opo'). Do NOT answer entirely in Tagalog.
- **Mission:** To transform good conversations into God conversations and cultivate kindness through every cup. Do this gently and naturally.

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
    
    # Normalize history to Gemini format {role, parts: [{text}]}
    normalized_history = []
    for h in (history or []):
        # Gemini history MUST have role 'user' and 'model'
        # Crucially, it must NOT start with a model message
        role = "model" if h.get("role") == "model" else "user"
        
        # Skip initial model message to avoid Gemini validation error
        if not normalized_history and role == "model":
            continue
            
        if "parts" in h:
            normalized_history.append({"role": role, "parts": h["parts"]})
        elif "content" in h:
            normalized_history.append({"role": role, "parts": [{"text": h["content"]}]})
        else:
            continue
    
    # Prioritize 2.0 models which were confirmed available in health check
    models_to_try = [
        'models/gemini-2.0-flash-lite',
        'models/gemini-2.0-flash',
        'models/gemini-1.5-flash',
        'models/gemini-1.5-flash-8b'
    ]
    
    last_error = ""
    try:
        genai.configure(api_key=api_key, transport='rest')
        
        # 1. Fetch available models dynamically from the key itself
        available_models = []
        try:
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    available_models.append(m.name)
        except Exception:
            available_models = ['models/gemini-1.5-flash', 'models/gemini-2.0-flash-lite']

        # 2. Set priority list
        priority = ['models/gemini-2.0-flash-lite', 'models/gemini-1.5-flash', 'models/gemini-2.0-flash']
        to_try = [m for m in priority if m in available_models]
        to_try += [m for m in available_models if m not in to_try]
        
        # 3. Try each model until one works
        last_err = ""
        for model_name in to_try:
            try:
                model = genai.GenerativeModel(model_name, system_instruction=FAITH_SYSTEM_PROMPT)
                chat_session = model.start_chat(history=normalized_history)
                response = chat_session.send_message(message)
                return response.text
            except Exception as e:
                last_err = str(e)
                if "429" in last_err or "404" in last_err:
                    continue
                return f"Error with {model_name}: {last_err}"
        
        return f"Error: No functional models found for this API key. List: {available_models}. Last error: {last_err}"
    except Exception as e:
        return f"Critical Connectivity Error: {str(e)}"

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
        "build_id": BUILD_ID,
        "persona": "Faith", 
        "key_set": api_key is not None,
        "available_models": models
    }

@app.post("/api/chat")
async def chat(request: ChatRequest):
    reply = get_chat_response(request.message, request.history)
    return {"reply": reply}


