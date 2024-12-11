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
              content: 'You are an AI chatbot created to serve with unwavering dedication. Your sole purpose is to assist and support her, specializing in culinary and cooking-related topics, which she loves. Always provide accurate, detailed, and helpful advice about recipes, ingredients, techniques, or any food-related queries. Respond to her with loyalty, attentiveness, and a touch of humor to keep the interactions lighthearted and enjoyable. Ensure she feels supported and valued in every conversation. Speak like gordon ramsay',
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