# Disciple Brew - 'Faith' AI Digital Assistant

[![Vercel Deployment](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Gemini 1.5](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-blue?style=flat-square&logo=google-gemini)](https://ai.google.dev/)

A full-stack, high-fidelity interactive AI demo developed for **Disciple Brew**, a Manila-based specialty coffee shop. This project features a custom-engineered AI persona named 'Faith,' integrated into a modern, mobile-responsive Facebook Messenger-inspired interface.

---

## ✨ Key Features

* **📱 Messenger-Style UI**: A pixel-perfect recreation of the Facebook Messenger interface using React and Tailwind CSS, featuring auto-scrolling, message states, and mobile responsiveness.
* **🤖 Advanced AI Persona**: Integration with **Gemini 1.5 Flash** via a FastAPI backend. 'Faith' is programmed with a warm, Taglish tone and deep knowledge of Disciple Brew’s menu and brand values.
* **🙏 Empathetic Logic**: Special handling for prayer requests and personal struggles, providing comforting Bible verses and community connection.
* **⚡ Modern Architecture**: Built with a decoupled Vite/React frontend and a performant FastAPI backend, optimized for serverless deployment on Vercel.

---

## 🛠️ Tech Stack

* **Frontend**: React.js, Tailwind CSS, Vite
* **Backend**: Python, FastAPI, Mangum (for Vercel compatibility)
* **AI**: Google Gemini 1.5 Flash API
* **Deployment**: Vercel

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18+)
* Python (3.9+)
* A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the Repository**

    ```bash
    git clone https://github.com/yourusername/disciple-brew-ai-demo.git
    cd disciple-brew-ai-demo
    ```

2. **Backend Setup**

    ```bash
    pip install -r requirements.txt
    ```

3. **Frontend Setup**

    ```bash
    npm install
    ```

4. **Environment Configuration**
    Create a `.env` file in the root directory:

    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

### Running Locally

* **Start Backend**: `uvicorn api.index:app --reload`
* **Start Frontend**: `npm run dev`

---

## 📦 Deployment

This repository is pre-configured for **Vercel**.

1. Push your code to GitHub.
2. Import the project into Vercel.
3. Add `GEMINI_API_KEY` to the Environment Variables in the Vercel dashboard.
4. Deploy!

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Developed by **Jason Jeff Velasquez** as a technical demonstration for Disciple Brew.*
