from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv
from db import get_db_connection
import jwt
import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

SECRET_KEY = "mysecretkey"

# OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)
# =====================================
# REGISTER API
# =====================================
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json

        first_name = data.get("first_name")
        last_name = data.get("last_name")
        email = data.get("email")
        password = data.get("password")

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check existing email
        cursor.execute(
            "SELECT * FROM users WHERE email=%s",
            (email,)
        )

        old_user = cursor.fetchone()

        if old_user:
            return jsonify({"error": "Email already exists"})

        # Insert user
        cursor.execute(
            """
            INSERT INTO users
            (first_name, last_name, email, password)
            VALUES (%s, %s, %s, %s)
            """,
            (first_name, last_name, email, password)
        )

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            "message": "Registration successful"
        })

    except Exception as e:
        return jsonify({"error": str(e)})

# =====================================
# LOGIN API
# =====================================
@app.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM users WHERE email=%s AND password=%s",
            (email, password)
        )

        user = cursor.fetchone()

        cursor.close()
        conn.close()

        if user:
            token = jwt.encode(
                {
                    "user_id": user["id"],
                    "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
                },
                SECRET_KEY,
                algorithm="HS256"
            )

            return jsonify({
                "message": "Login successful",
                "token": token
            })

        return jsonify({
            "message": "Invalid email or password"
        }), 401

    except Exception as e:
        return jsonify({"error": str(e)})


# =====================================
# CREATE NEW CHAT
# =====================================
@app.route("/new-chat", methods=["POST"])
def new_chat():
    try:
        token = request.headers.get("Authorization").split(" ")[1]

        decoded = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = decoded["user_id"]

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO conversations (user_id, title) VALUES (%s, %s)",
            (user_id, "New Chat")
        )

        conn.commit()

        conversation_id = cursor.lastrowid

        cursor.close()
        conn.close()

        return jsonify({
            "conversation_id": conversation_id
        })

    except Exception as e:
        return jsonify({"error": str(e)})
    
# =====================================
# RENAME CHAT
# =====================================   

@app.route("/rename-conversation/<int:chat_id>", methods=["PUT"])
def rename_conversation(chat_id):
    try:
        token = request.headers.get("Authorization").split(" ")[1]
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = decoded["user_id"]

        data = request.json
        new_title = data.get("title")

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "UPDATE conversations SET title=%s WHERE id=%s AND user_id=%s",
            (new_title, chat_id, user_id)
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Renamed successfully"})

    except Exception as e:
        return jsonify({"error": str(e)})


# =====================================
# GET ALL CONVERSATIONS
# =====================================
@app.route("/conversations", methods=["GET"])
def get_conversations():
    try:
        token = request.headers.get("Authorization").split(" ")[1]

        decoded = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = decoded["user_id"]

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT * FROM conversations
            WHERE user_id=%s
            ORDER BY id DESC
            """,
            (user_id,)
        )

        data = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)})

# =====================================
# DELETE CONVERSATION
# =====================================    

@app.route("/delete-message/<int:msg_id>", methods=["DELETE"])
def delete_message(msg_id):
    try:
        token = request.headers.get("Authorization").split(" ")[1]

        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = decoded["user_id"]

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # verify message belongs to user
        cursor.execute("""
            SELECT ch.id
            FROM chat_history ch
            JOIN conversations c ON ch.conversation_id = c.id
            WHERE ch.id=%s AND c.user_id=%s
        """, (msg_id, user_id))

        msg = cursor.fetchone()

        if not msg:
            return jsonify({"error": "Unauthorized"}), 403

        # delete message
        cursor.execute(
            "DELETE FROM chat_history WHERE id=%s",
            (msg_id,)
        )

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"message": "Message deleted"})

    except Exception as e:
        return jsonify({"error": str(e)})



# =====================================
# GET CHAT HISTORY
# =====================================
@app.route("/messages/<int:conversation_id>", methods=["GET"])
def get_messages(conversation_id):
    try:
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"error": "Token missing"}), 401

        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Invalid token format"}), 401

        token = auth_header.replace("Bearer ", "").strip()

        decoded = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = decoded["user_id"]

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT ch.*
            FROM chat_history ch
            JOIN conversations c
            ON ch.conversation_id = c.id
            WHERE ch.conversation_id=%s
            AND c.user_id=%s
            ORDER BY ch.id ASC
            """,
            (conversation_id, user_id)
        )

        data = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)})

# =====================================
# CHAT API
# =====================================
@app.route("/chat", methods=["POST"])
def chat():
    try:
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token missing or invalid"}), 401

        token = auth_header.split(" ")[1]

        decoded = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = decoded["user_id"]

        data = request.json

        user_message = data.get("message")
        conversation_id = data.get("conversation_id")

        if not conversation_id:
            return jsonify({"error": "conversation_id required"}), 400
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check conversation belongs to user
        cursor.execute(
            """
            SELECT * FROM conversations
            WHERE id=%s AND user_id=%s
            """,
            (conversation_id, user_id)
        )

        check_chat = cursor.fetchone()

        if not check_chat:
            return jsonify({"error": "Unauthorized chat access"})
        
        cursor.execute(
           """
           SELECT title FROM conversations
           WHERE id=%s
           """,
           (conversation_id,)
        )

        chat_data = cursor.fetchone()

        if chat_data["title"] == "New Chat":
           cursor.execute(
            """
            UPDATE conversations
            SET title=%s
            WHERE id=%s
            """,
           (user_message[:30], conversation_id)
           )

        # Get old chat history
        cursor.execute(
            """
            SELECT role, message FROM chat_history
            WHERE conversation_id=%s
            ORDER BY id ASC
            """,
            (conversation_id,)
        )

        old_messages = cursor.fetchall()

        messages = []

        # Add previous messages
        for msg in old_messages:
            messages.append({
                "role": msg["role"],
                "content": msg["message"]
            })

        # Add latest user message
        messages.append({
            "role": "user",
            "content": user_message
        })

        # Get AI reply
        response = client.chat.completions.create(
            model="openai/gpt-3.5-turbo",
            messages= [
                {
                    "role" : "system",
                    "content" : "Format responses clearly using headings, bullet points, numbered steps, and short readable paragraphs."
                }
            ] +messages
        )

        bot_reply = response.choices[0].message.content
        print("BOT REPLY:", bot_reply) 

        # Save user message
        cursor.execute(
            """
            INSERT INTO chat_history
            (conversation_id, message, role)
            VALUES (%s, %s, %s)
            """,
            (conversation_id, user_message, "user")
        )

        # Save AI reply
        cursor.execute(
            """
            INSERT INTO chat_history
            (conversation_id, message, role)
            VALUES (%s, %s, %s)
            """,
            (conversation_id, bot_reply, "assistant")
        )

        conn.commit()

        cursor.close()
        conn.close()

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