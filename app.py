from flask import Flask, render_template, request, jsonify, session
import requests
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "supersecret")  # for Flask sessions

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")

def openrouter_chat(memory):
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "FlaskChatbotDemo"
    }
    data = {
        "model": "openai/gpt-3.5-turbo",
        "messages": memory  # full memory
    }
    response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
    result = response.json()
    return result["choices"][0]["message"]["content"]

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")

    # initialize memory in session
    if "memory" not in session:
        session["memory"] = [{"role": "system", "content": "You are a helpful assistant."}]

    # Add user's message
    session["memory"].append({"role": "user", "content": user_message})

    # Get AI reply based on entire memory
    bot_response = openrouter_chat(session["memory"])
    session["memory"].append({"role": "assistant", "content": bot_response})
    session.modified = True

    return jsonify({"reply": bot_response})

@app.route("/new_chat", methods=["POST"])
def new_chat():
    session.pop("memory", None)
    return jsonify({"success": True})

if __name__ == "__main__":
    app.run(debug=True)
