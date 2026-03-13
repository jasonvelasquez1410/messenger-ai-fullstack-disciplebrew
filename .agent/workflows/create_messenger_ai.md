---
description: Create a full-stack Messenger-style AI Assistant with Gemini 1.5/2.0
---

# 🤖 Messenger AI Assistant Workflow

This workflow automates the creation of a high-fidelity AI chat assistant modeled after the Disciple Brew architecture.

## 🛠 Prerequisites

- Node.js & npm
- Python 3.9+
- Gemini API Key (GEMINI_API_KEY)

## 🚀 Step-by-Step Implementation

### 1. Initialize Project Structure

Run these commands to set up the dual-environment structure:

```bash
npx -y create-vite-app@latest ./ --template react
pip install fastapi uvicorn google-generativeai python-dotenv mangum
mkdir api
```

### 2. Configure Backend

Create `api/index.py` (or `api/server.py`) and use the **Backend Template**.
// turbo
Use the template found in: `.agent/workflows/templates/backend_template.py.txt`

### 3. Configure Frontend

Replace `src/App.jsx` with the **Frontend Template**.
// turbo
Use the template found in: `.agent/workflows/templates/frontend_template.jsx.txt`

### 4. Setup Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_key_here
```

### 5. Deployment (Vercel)

Ensure `vercel.json` is configured for dual routing:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.py" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 🧩 Modular Extensions (Optional)

Look for these additional workflows in the `.agent/workflows/` directory:

- `add_voice_to_ai.md`: For voice/audio capabilities.
- `ingest_client_knowledge.md`: For automated web/Facebook scraping.
- `deploy_to_messenger_or_web.md`: For full Facebook Page integration.
