"use client";
import Conversion from "@/components/Conversion";
import Substitute from "@/components/Substitute";
import { useState } from "react";

const Home = () => {
  const [ActiveTab, setActiveTab] = useState("conversion");
  const [conversionMessages, setConversionMessages] = useState([
    {
      text: "Welcome! I'm here to help you with Ingredient Conversions.",
      sender: "bot",
    },
  ]);
  const [substituteMessages, setSubstituteMessages] = useState([
    { text: "Welcome! I'm here to help you with your recipes.", sender: "bot" },
  ]);

  return (
    <div className="bg-background h-screen flex items-center justify-center p-5 max-h-[80%]">
      <div className="bg-white w-full max-w-4xl md:flex h-[90%] p-4 rounded-lg shadow-lg relative">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-gray-100 rounded-lg shadow-md p-4 flex flex-col space-y-4">
          <h2 className="text-lg font-semibold text-dark">Options</h2>
          <button
            className={`text-white py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 transition-all w-full text-left ${
              ActiveTab === "conversion" ? "bg-primary" : "bg-secondary"
            }`}
            onClick={() => setActiveTab("conversion")}
          >
            Ingredient Conversion
          </button>
          <button
            className={`text-white py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 transition-all w-full text-left ${
              ActiveTab === "substitute" ? "bg-primary" : "bg-secondary"
            }`}
            onClick={() => setActiveTab("substitute")}
          >
            Ingredient Substitute
          </button>
        </div>

        {ActiveTab === "conversion" ? (
          <Conversion
            messages={conversionMessages}
            setMessages={setConversionMessages}
          />
        ) : (
          <Substitute
            messages={substituteMessages}
            setMessages={setSubstituteMessages}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
