"use client";

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

const ChatBubble = ({ message }: { message: Message }) => {
  const { text, sender } = message;
  const isUser = sender === 'user';

  // Base classes for all bubbles
  const bubbleClasses = "max-w-md md:max-w-2xl break-words rounded-xl px-4 py-2.5 shadow-md";
  
  // Conditional classes for alignment and color
  const alignmentClasses = isUser ? "self-end bg-blue-600 text-white" : "self-start bg-gray-700 text-gray-100";

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
      <div className={`${bubbleClasses} ${alignmentClasses}`}>
        <p className="text-sm md:text-base whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
};


const ChatInput = ({
  value,
  onChange,
  onSend,
  isLoading,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  isLoading: boolean;
}) => {
  
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading && value.trim()) {
        onSend();
      }
    }
  };
  
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isLoading && value.trim()) {
        onSend();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-2 md:p-4">
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={isLoading}
        className="flex-grow rounded-lg bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="ml-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white transition-colors duration-200 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-send">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        )}
      </button>
    </form>
  );
};


export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const threadIdRef = useRef<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          thread_id: threadIdRef.current,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.response) {
        const aiMessage: Message = { text: data.response, sender: 'ai' };
        setMessages(prev => [...prev, aiMessage]);
        threadIdRef.current = data.thread_id; // Persist the thread_id
      } else {
         throw new Error('Invalid response from server');
      }

    } catch (error) {
      console.error("Failed to get response:", error);
      const errorMessage: Message = { text: "Sorry, I couldn't connect to the server. Please try again later.", sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen bg-black text-white font-sans">
      <header className="p-4">
          <h1 className="text-xl font-bold text-center">SentraAI Demo</h1>
      </header>

      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 md:p-6 w-full max-w-4xl mx-auto">
        <div className="flex flex-col space-y-4">
          {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-8">
                  <p>Start the conversation by sending a message.</p>
              </div>
          )}
          {messages.map((msg, index) => (
            <ChatBubble key={index} message={msg} />
          ))}
          {isLoading && <ChatBubble message={{text: "Thinking...", sender: "ai"}} />}
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto">
        <ChatInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
};