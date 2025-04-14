import { agentFetch } from "agents/client";
import { useAgent } from "agents/react";
import type React from "react";
import { useRef, useState } from "react";

import { DevSearchInput } from "./home/DevSearchInput";

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  type: "incoming" | "outgoing";
}


export function Homepage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const agent = useAgent({
    agent: "my-agent",
    // probably will need to modify this based on stage
    host: "http://localhost:4141",
    onMessage: (message) => {
      const newMessage: Message = {
        id: Math.random().toString(36).substring(7),
        text: message.data as string,
        timestamp: new Date(),
        type: "incoming",
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    onOpen: () => setIsConnected(true),
    onClose: () => setIsConnected(false),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputRef.current || !inputRef.current.value.trim()) return;

    const text = inputRef.current.value;
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      text,
      timestamp: new Date(),
      type: "outgoing",
    };

    agent.send(text);
    setMessages((prev) => [...prev, newMessage]);
    inputRef.current.value = "";
  };

  const handleFetchRequest = async () => {
    try {
      const response = await agentFetch({
        agent: "my-agent",
        // probably will need to modify this based on stage
        host: "http://localhost:4141",
      });
      const data = await response.text();
      const newMessage: Message = {
        id: Math.random().toString(36).substring(7),
        text: `Server Response: ${data}`,
        timestamp: new Date(),
        type: "incoming",
      };
      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.error("Error fetching from server:", error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  return (
    <div className="relative flex w-full justify-center pt-28">
      <div className="w-full max-w-screen-xl px-4 text-center">
        <h1 className="mb-8 font-mono text-5xl tracking-tight">
          Know Your Dev
        </h1>
        <div className="mx-auto mb-8 max-w-md">
          <DevSearchInput />
        </div>
      </div>
      <div className="mx-auto mt-8 w-full max-w-md overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        {/* Status indicator */}
        <div className="flex items-center border-b border-gray-200 bg-gray-50 p-3">
          <div
            className={`mr-2 size-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? "Connected to server" : "Disconnected"}
          </span>
        </div>

        {/* Messages section */}
        <div className="h-64 overflow-y-auto bg-gray-50 p-4">
          <h2 className="mb-3 text-lg font-medium text-gray-700">Messages</h2>
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === "incoming"
                    ? "bg-gray-200 text-gray-800"
                    : "ml-auto bg-blue-500 text-white"
                }`}
              >
                <div className="break-words">{message.text}</div>
                <div
                  className={`mt-1 text-xs ${message.type === "incoming" ? "text-gray-500" : "text-blue-100"}`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message form */}
        <form
          className="flex border-t border-gray-200 p-3"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            ref={inputRef}
            className="flex-1 rounded-l-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="rounded-r-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Send
          </button>
        </form>

        {/* HTTP Request button */}
        <div className="border-t border-gray-200 p-3">
          <button
            type="button"
            onClick={handleFetchRequest}
            className="w-full rounded bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
          >
            Send HTTP Request
          </button>
        </div>
      </div>
    </div>
  );
}
