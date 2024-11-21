import { NextResponse } from 'next/server';

let messageHistory = [];

export async function POST(req) {
  try {
    const userInput = await req.json();
    if (!userInput) {
      return NextResponse.json(
        { message: 'Input is required' },
        { status: 400 }
      );
    }

    messageHistory.push({
      role: 'user',
      content: JSON.stringify(userInput),
    });

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
              'You are a culinary expert. Only answer questions about recipes, cooking techniques, ingredient substitutions, and related topics. For unrelated questions, respond politely saying you can only help with culinary matters.Also address the user as Chef.',
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
