"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import Loader from "./Loader";

const Chatbot = () => {
  const formatMessage = (messageText) => {
    return messageText
      .replace(/(\*\*([^\*]+)\*\*)/g, "<strong>$2</strong>")
      .replace(/(\*([^\*]+)\*)/g, "<em>$2</em>")
      .replace(/(\n|\r\n)/g, "<br />")
      .replace(/(\- (.+))/g, "<ul><li>$2</li></ul>")
      .replace(
        /(<ul>.*<\/ul>)/g,
        (match) => `<div class="list">${match}</div>`
      );
  };
  const textareaRef = useRef(null);
  const [sessionId, setSessionId] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Welcome Chef! I'm here to help you with your recipes.",
      sender: "bot",
    },
  ]);
  const [userMessage, setUserMessage] = useState("");

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const maxHeight = 150;
      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, 56),
        maxHeight
      );
      textarea.style.height = `${newHeight}px`;
    }
  };
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const newUserMessage = { text: userMessage, sender: "user" };
    const updatedMessages = [...messages, newUserMessage];

    setMessages(updatedMessages);
    setUserMessage("");
    setIsLoading(true);

    try {
      const saveResponse = await fetch("/api/firestore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage, sessionId }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save message");
      }

      const { messageHistory } = await saveResponse.json();

      const cohereResponse = await fetch("/api/culinary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageHistory }),
      });

      if (!cohereResponse.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await cohereResponse.json();
      const botMsg =
        data.message?.content?.[0]?.text || "Sorry, I couldn't find an answer.";
      const formattedBotMsg = formatMessage(botMsg);

      const updatedMessagesWithBot = [
        ...updatedMessages,
        { text: formattedBotMsg, sender: "bot" },
      ];

      setMessages(updatedMessagesWithBot);
      sessionStorage.setItem(
        "chatMessages",
        JSON.stringify(updatedMessagesWithBot)
      );
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "An error occurred. Please try again.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const savedMessages = sessionStorage.getItem("chatMessages");
    const savedSessionId = JSON.parse(sessionStorage.getItem("sessionId"));
    if (savedSessionId) {
      setSessionId(savedSessionId);
    } else {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      sessionStorage.setItem("sessionId", JSON.stringify(newSessionId));
    }

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [userMessage]);

  useEffect(() => {
    if (sessionId) {
      sessionStorage.setItem("sessionId", JSON.stringify(sessionId));
    }
  }, [sessionId]);

  return (
    <div className="bg-background h-screen flex items-center justify-center p-3 max-h-[80%]">
      <div className="bg-white w-full max-w-2xl p-4 rounded-lg shadow-xl relative flex flex-col  md:flex h-[90%]">
        <div className="flex items-center space-x-3 mb-3">
          <Image src="/chefhat.svg" width={30} height={30} alt="ChefHat Icon" />
          <h1 className="text-3xl font-semibold text-dark tracking-wide">
            Culinary Chatbot
          </h1>
        </div>
        {/* Chat Messages */}
        <div className="flex-1.5 space-y-5 overflow-y-auto h-[80%] p-4 bg-gray-50 rounded-lg shadow-inner mb-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: message.sender === "user" ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`${
                  message.sender === "user" ? "bg-primary" : "bg-secondary"
                } text-white p-3 rounded-lg shadow-lg max-w-xs break-words`}
                dangerouslySetInnerHTML={{ __html: message.text }}
              ></div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex justify-start"
            >
              <div className="bg-secondary text-white p-3 rounded-lg shadow-lg max-w-xs break-words">
                <Loader />
              </div>
            </motion.div>
          )}
        </div>
        {/* Input Box */}
        <div className="flex items-end mt-4 space-x-2 sm:space-x-4 w-full">
          <textarea
            className="w-full p-4 rounded-l-lg focus:outline-none bg-gray-100 text-dark placeholder:text-gray-500 transition-all duration-300 hover:bg-gray-200 resize-none overflow-y-auto"
            placeholder="Message Culinary Helper"
            value={userMessage}
            ref={textareaRef}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            style={{
              minHeight: "56px",
              maxHeight: "150px",
            }}
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            className="bg-primary text-white p-4 rounded-r-lg shadow-lg hover:bg-orange-600 transition-all duration-300 ease-in-out transform hover:scale-105 "
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
