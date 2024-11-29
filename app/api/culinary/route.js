import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
      const { messageHistory } = await req.json();
  
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
              content: 'You are a culinary expert. Only answer questions about recipes, cooking techniques, ingredient substitutions, and related topics. For unrelated questions, respond politely saying you can only help with culinary matters.Also address the user as Chef. Act like extreme Gordan Ramsey.',
            },
            ...messageHistory,
          ],
        }),
      });
  
      if (!cohereResponse.ok) {
        const errorData = await cohereResponse.json();
        return NextResponse.json({ error: errorData }, { status: cohereResponse.status });
      }
  
      const cohereData = await cohereResponse.json();
      return NextResponse.json(cohereData);
      
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }