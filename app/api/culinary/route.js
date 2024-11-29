import { NextResponse } from 'next/server';
import { db } from "../../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    // Add request timeout
    const TIMEOUT = 10000; // 25 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const { question, sessionId } = await req.json();

    // Firebase operations
    const messagesRef = doc(db, 'messageHistories', sessionId);
    const docSnap = await getDoc(messagesRef);
    let messageHistory = docSnap.exists() ? docSnap.data().messages : [];

    // Add new message to history
    const newMessage = {
      role: 'user',
      content: question,
    };
    messageHistory.push(newMessage);

    // Limit message history to prevent token overflow
    const limitedHistory = messageHistory.slice(-10); // Keep last 10 messages

    // Update Firebase first
    await setDoc(messagesRef, { messages: messageHistory });

    // Make Cohere API call with timeout
    try {
      const cohereResponse = await fetch('https://api.cohere.ai/v2/chat', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'command-r-plus',
          messages: [
            {
              role: 'system',
              content:
                'You are a culinary expert. Only answer questions about recipes, cooking techniques, ingredient substitutions, and related topics. For unrelated questions, respond politely saying you can only help with culinary matters.Also address the user as Chef. Act like extreme Gordan Ramsey.',
            },
            ...limitedHistory,
          ],
        }),
      });

      clearTimeout(timeoutId);

      if (!cohereResponse.ok) {
        const errorData = await cohereResponse.json();
        console.error('Cohere API error:', errorData);
        return NextResponse.json(
          { 
            message: 'Error from Cohere API', 
            details: errorData 
          },
          { status: cohereResponse.status }
        );
      }

      const cohereData = await cohereResponse.json();
      return NextResponse.json(cohereData, { status: 200 });

    } catch (error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { message: 'Request timeout' },
          { status: 408 }
        );
      }
      throw error; // Let the outer catch handle other errors
    }

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// Configure API route options
export const config = {
  api: {
    bodyParser: true,
    responseLimit: false,
    externalResolver: true,
  },
};