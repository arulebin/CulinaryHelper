import { NextResponse } from 'next/server';
import { db } from "../../firebase/config"
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const { question , sessionId } = await req.json();

    const messagesRef = doc(db, 'messageHistories', sessionId);
    
    const docSnap = await getDoc(messagesRef);
    let messageHistory = [];
    
    if (docSnap.exists()) {
      messageHistory = docSnap.data().messages;
    }

    messageHistory.push({
      role: 'user',
      content: question,
    });

    console.log(messageHistory)

    await setDoc(messagesRef, { messages: messageHistory });

    const cohereResponse = await fetch('https://api.cohere.ai/v2/chat', {
      method: 'POST',
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
              'You are a culinary expert. Only answer questions about recipes, cooking techniques, ingredient substitutions, and related topics. For unrelated questions, respond politely saying you can only help with culinary matters.Also address the user as Chef. Act like Gordan Ramsey',
          },
          ...messageHistory, 
        ],
      }),
    });
    
    if (!cohereResponse.ok) {
      const errorDetails = await cohereResponse.json();
      return NextResponse.json(
        { message: 'Error from Cohere', details: errorDetails },
        { status: cohereResponse.status }
      );
    }

    const cohereData = await cohereResponse.json();
    return NextResponse.json(cohereData, { status: 200 });

  } catch (error) {
    console.error('Error during Cohere request:', error);
    return NextResponse.json(
      { message: 'Error processing the request' },
      { status: 500 }
    );
  }
}
