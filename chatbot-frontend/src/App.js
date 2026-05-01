import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";
const API = "http://127.0.0.1:5000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSignup, setIsSignup] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [theme, setTheme] = useState(
  localStorage.getItem("theme") || "system"
);

  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(
  localStorage.getItem("conversationId") || null
);
 const chatEndRef = useRef(null);
 const [loading, setLoading] = useState(false);

 const [activeMenu, setActiveMenu] = useState(null);
 const [editingChatId, setEditingChatId] = useState(null);
 const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
  applyTheme(theme);
  localStorage.setItem("theme", theme);
}, [theme]);

  // eslint-disable-next-line
useEffect(() => {
  if (token) {
    loadConversations();
    setConversationId(null);
  }
}, [token]);

 // eslint-disable-next-line
useEffect(() => {
  if (token && conversationId) {
    openChat(conversationId);
  }
}, [token]);

  useEffect(() => {
  chatEndRef.current?.scrollIntoView({
    behavior: "smooth"
  });
}, [messages]);

  const applyTheme = (mode) => {
    if (mode === "dark") {
      document.body.className = "dark";
    } else if (mode === "light") {
      document.body.className = "light";
    } else {
      const darkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      document.body.className = darkMode ? "dark" : "light";
    }
  };

  // LOGIN
  const handleLogin = async () => {
  try {
    const response = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const data = await response.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } else {
      alert("Invalid Login");
    }

  } catch (error) {
    console.log(error);
    alert("Server Error");
  }
};
  // REGISTER
  const handleRegister = async () => {
  try {
    const response = await fetch("http://127.0.0.1:5000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password
      })
    });

    const data = await response.json();

    alert(data.message || data.error);

    if (data.message) {
      setIsSignup(false);
    }

  } catch (error) {
    console.log(error);
  }
  };


  // LOAD ALL CHATS
  const loadConversations = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/conversations", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log("CONVERSATIONS API RESPONSE:", data);
      if (Array.isArray(data)) {
       setConversations(data);
      } else if (Array.isArray(data.conversations)) {
        setConversations(data.conversations);
      } else {
        setConversations([]);
      }

    } catch (error) {
      console.log(error);
    }
  };

  // NEW CHAT
  const newChat = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/new-chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      setConversationId(data.conversation_id);
      localStorage.setItem(
      "conversationId",
      data.conversation_id
      );
      setMessages([]);

      loadConversations();

    } catch (error) {
      console.log(error);
    }
  };

  // LOAD OLD CHAT
  const openChat = async (id) => {
  setConversationId(id);
  localStorage.setItem("conversationId", id);

  try {
    const response = await fetch(
      `http://127.0.0.1:5000/messages/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    console.log("API RESPONSE:", data);

    const messagesArray = Array.isArray(data)
      ? data
      : Array.isArray(data.messages)
      ? data.messages
      : [];

    const formatted = messagesArray.map((msg) => ({
      id: msg.id,
      role: msg.role === "assistant" ? "bot" : "user",
      text: msg.message
    }));

    setMessages(formatted);

  } catch (error) {
    console.log(error);
  }
};
  //DELETE CHAT
  const deleteChat = async (id) => {
  try {
    if (!window.confirm("Delete this chat?")) return;

    await fetch(`${API}/delete-conversation/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setConversations((prev) =>
      prev.filter((chat) => chat.id !== id)
    );

    if (conversationId === id) {
      setMessages([]);
      setConversationId(null);
      localStorage.removeItem("conversationId");
    }

  } catch (error) {
    console.log(error);
  }
};


  // SEND MESSAGE
  const sendMessage = async () => {
  console.log("conversationId:", conversationId);
  console.log("token:", token);

  if (!input.trim() || !conversationId || loading) return;

  const userMsg = { role: "user", text: input };
  setMessages((prev) => [...prev, userMsg]);

  const question = input;
  setInput("");
  setLoading(true);

  try {
    const response = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        message: question
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Error: " + (data.error || "Something went wrong")
        }
      ]);
      setLoading(false);
      return;
    }

    const botMsg = {
      role: "bot",
      text: data.reply
    };

    setMessages((prev) => [...prev, botMsg]);

    loadConversations();
  } catch (error) {
    console.log(error);
    setMessages((prev) => [
      ...prev,
      { role: "bot", text: "Server error" }
    ]);
  }

  setLoading(false);
};
  // DELETE

  const deleteMessage = async (msgId) => {
  try {
    console.log("Deleting message:", msgId);
    if (!window.confirm("Delete this message?")) return;
    const res = await fetch(`${API}/delete-message/${msgId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Delete failed");

     setMessages((prev) =>
  prev.filter((msg) => String(msg._id) !== String(msgId))

    );

  } catch (error) {
    console.log(error);
  }
};

//RENAME CHAT
const renameChat = async (id) => {
  try {
    await fetch(`${API}/rename-conversation/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title: newTitle })
    });

    setConversations((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, title: newTitle } : chat
      )
    );

    setEditingChatId(null);

  } catch (error) {
    console.log(error);
  }
};

//PIN CHAT

const pinChat = (id) => {
  setConversations((prev) => {
    const selected = prev.find((c) => c.id === id);
    const rest = prev.filter((c) => c.id !== id);
    return [selected, ...rest]; // move to top
  });
};

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
     localStorage.removeItem("conversationId"); 
    setToken("");
    setMessages([]);
    setConversations([]);
  };

  // LOGIN PAGE
  if (!token) {
  return (
    <div className="login-page">
      <div className="login-box">

        <h1>{isSignup ? "Sign Up" : "Login"}</h1>

        {isSignup && (
          <>
            <input
              type="text"
              disabled = {loading}
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={isSignup ? handleRegister : handleLogin}>
          {isSignup ? "Create Account" : "Login"}
        </button>

        <p
          style={{ cursor: "pointer", marginTop: "10px" }}
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup
            ? "Already have account? Login"
            : "New user? Sign Up"}
        </p>

      </div>
    </div>
  );
}

  // CHAT UI
  return (
    <div className="app">

      <div className="sidebar">
        <h2>🤖 ChatBot</h2>

        <button onClick={newChat}>+ New Chat</button>

        <div className="chat-history">
          {Array.isArray(conversations) &&
          conversations.map((chat) => (
          <div
           key={chat.id}
           className={`chat-item ${chat.id == conversationId ? "active" : ""}`}
          >
    {/* CHAT TITLE / EDIT MODE */}
    {editingChatId === chat.id ? (
      <input
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            renameChat(chat.id);
          }
        }}
        autoFocus
      />
    ) : (
      <span onClick={() => openChat(chat.id)}>
        {chat.title}
      </span>
    )}

    {/* THREE DOT MENU */}
    <div className="menu-wrapper">
      <button
        className="menu-btn"
        onClick={(e) => {
          e.stopPropagation();
          setActiveMenu(activeMenu === chat.id ? null : chat.id);
        }}
      >
        ⋮
      </button>

      {activeMenu === chat.id && (
        <div className="dropdown">

          <div
            className="dropdown-item"
            onClick={() => {
              setEditingChatId(chat.id);
              setNewTitle(chat.title);
              setActiveMenu(null);
            }}
          >
            Rename
          </div>

          <div
            className="dropdown-item"
            onClick={() => deleteChat(chat.id)}
          >
            Delete
          </div>

          <div
            className="dropdown-item"
            onClick={() => pinChat(chat.id)}
          >
            Pin
          </div>

        </div>
      )}
    </div>
  </div>
))}
        </div>

        <div className="theme-box">
          <p>Theme</p>

          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="system">Default</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <button onClick={logout}>Logout</button>
      </div>

      <div className="chat-section">

        <div className="chat-header">
          AI Chatbot
        </div>

        <div className="chat-box">
           {messages.map((msg, index) => (
             <div
                key={index}
                className={msg.role === "user" ? "user-msg" : "bot-msg"}
                onClick={() => {
                  if (window.confirm("Delete this message?")) {
                    deleteMessage(msg.id);
                  }
                }}
             >
                {msg.role === "bot" ? (
                  <ReactMarkdown>
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
             </div>
            ))}

            {loading && (
              <div className="bot-msg typing-indicator">
               <span></span>
               <span></span>
               <span></span>
              </div>
            )}

            <div ref={chatEndRef}></div>
        </div>

        <div className="input-area">
          <div className="input-wrapper">

            <input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button onClick={sendMessage} disabled = {loading}>
              {loading ? "..." : ">"}
              &gt;
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default App;