// app/sse-client.tsx
'use client';
import { useEffect, useState } from 'react';

interface SSEMessage {
  message: string;
  timestamp: number;
  [key: string]: any;
}

export default function SSEClient() {
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [status, setStatus] = useState<string>('Disconnected');

  useEffect(() => {
    const eventSource = new EventSource('/api/sse');
    
    eventSource.onopen = () => {
      setStatus('Connected');
    };

    eventSource.addEventListener('open', (e: MessageEvent) => {
      if (e.data) {
        const data = JSON.parse(e.data);
        setStatus(`Connected: ${data.message}`);
      }
    });

    eventSource.addEventListener('message', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setMessages((prev) => [...prev, data]);
    });

    eventSource.addEventListener('update', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setMessages((prev) => [...prev, data]);
    });

    eventSource.addEventListener('error', (e: MessageEvent) => {
      const data = e.data ? JSON.parse(e.data) : { error: 'Connection error' };
      setStatus(`Error: ${data.error}`);
      eventSource.close();
    });

    return () => {
      eventSource.close();
      setStatus('Disconnected');
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">SSE Updates</h1>
      <p className="mb-4">Status: <span className="font-semibold">{status}</span></p>
      <ul className="space-y-2 border p-4 rounded">
        {messages.map((msg, i) => (
          <li key={i} className="p-2 bg-gray-50 rounded">
            <span className="font-medium">{msg.message}</span>
            <span className="text-sm text-gray-500 ml-2">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
            <span>
              {Object.keys(msg).map((key) => (
                key !== 'message' && key !== 'timestamp' && (
                  <span key={key} className="text-xs text-gray-400 ml-2">
                    {key}: {msg[key]}
                  </span>
                )
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}