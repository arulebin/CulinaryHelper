import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();

    // Forward the POST request to the backend API
    const response = await fetch('https://cautious-fiesta-vwrw5wpqgw9h74-5000.app.github.dev/substitute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return NextResponse.json(
        { message: 'Error from backend' },
        { status: response.status }
      );
    }

    // Parse the backend response and return it to the client
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Error during fetch:', error);
    return NextResponse.json(
      { message: 'Error processing the request' },
      { status: 500 }
    );
  }
}
