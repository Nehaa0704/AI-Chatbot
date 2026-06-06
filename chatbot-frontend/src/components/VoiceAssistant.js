import React, { useState } from "react";

const VoiceAssistant = ({ onVoiceInput }) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;

      onVoiceInput(text);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };
  };

  return (
    <button onClick={startListening}>
      {isListening ? "..." : "🎤"}
    </button>
  );
};

export default VoiceAssistant;