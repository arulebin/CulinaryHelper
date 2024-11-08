"use client"
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Welcome! I'm here to help you with your recipes.", sender: 'bot' },
  ]);
  const [userMessage, setUserMessage] = useState('');

  const handleSendMessage = () => {
    if (userMessage.trim()) {
      setMessages([...messages, { text: userMessage, sender: 'user' }]);
      setUserMessage('');
      // Simulate a bot response
      setTimeout(() => {
        setMessages((prev) => [...prev, { text: "Let me convert that for you!", sender: 'bot' }]);
      }, 1000);
    }
  };

  return (
    <div className="bg-background h-screen flex items-center justify-center p-5">
      <div className="bg-white w-full max-w-lg p-4 rounded-lg shadow-lg relative">
        <div className="flex items-center space-x-2 mb-4">
            <Image src="/chefhat.svg" width={24} height={24} alt="ChefHat Icon" />
          <h1 className="text-2xl font-semibold text-dark">Culinary Chatbot</h1>
        </div>

        {/* Chat Messages */}
        <div className="space-y-4 overflow-y-auto max-h-64 p-2">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: message.sender === 'user' ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`${
                  message.sender === 'user' ? 'bg-primary' : 'bg-secondary'
                } text-white p-3 rounded-lg shadow-lg max-w-xs`}
              >
                {message.text}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input Box */}
        <div className="flex items-center mt-4">
          <input
            type="text"
            className="w-full p-3 rounded-l-lg focus:outline-none bg-gray-100 text-dark"
            placeholder="Ask me to convert..."
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="bg-primary text-white p-3 rounded-r-lg shadow-lg hover:bg-orange-600 transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;