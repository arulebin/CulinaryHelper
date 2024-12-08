import { NextResponse } from 'next/server';
import { db } from "../../firebase/config";
import { doc, getDoc, setDoc,Timestamp } from "firebase/firestore";

export async function POST(req) {
  try {
    const { question, sessionId } = await req.json();
    
    const messagesRef = doc(db, 'messageHistories', sessionId);
    const docSnap = await getDoc(messagesRef);
    let messageHistory = docSnap.exists() ? docSnap.data().messages : [];

    messageHistory.push({
      role: 'user',
      content: question,
    });
    
    await setDoc(messagesRef, { messages: messageHistory,
      timestamp: Timestamp.now(),
     });
    
    return NextResponse.json({ 
      success: true, 
      messageHistory: messageHistory, 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
