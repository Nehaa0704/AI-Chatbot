from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message")

    try:
        response = client.chat.completions.create(
            model="openai/gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": user_message}
            ]
        )

        bot_reply = response.choices[0].message.content

        return jsonify({
            "reply": bot_reply
        })

    except Exception as e:
        return jsonify({
            "reply": "Error occurred",
            "error": str(e)
        })

if __name__ == "__main__":
    app.run(debug=True)