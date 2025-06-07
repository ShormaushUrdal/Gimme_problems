'use client';

import { useState } from 'react';
import { FiSend, FiCode, FiFileText, FiList, FiUser, FiCpu } from 'react-icons/fi';

type ChatMode = 'chat' | 'summarize' | 'explain-code' | 'generate-quiz' | 'resume-helper' | 'cp-helper';

export default function Chat() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'bot', content: string }>>([]);
  const [mode, setMode] = useState<ChatMode>('chat');
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      let promptData = userMessage;
      if (mode === 'resume-helper') {
        promptData = JSON.stringify({ name, skills });
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptData, type: mode }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: 'bot', content: data.result }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        <ModeButton icon={<FiSend />} mode="chat" currentMode={mode} setMode={setMode} label="Chat" />
        <ModeButton icon={<FiFileText />} mode="summarize" currentMode={mode} setMode={setMode} label="Summarize" />
        <ModeButton icon={<FiCode />} mode="explain-code" currentMode={mode} setMode={setMode} label="Explain Code" />
        <ModeButton icon={<FiList />} mode="generate-quiz" currentMode={mode} setMode={setMode} label="Generate Quiz" />
        <ModeButton icon={<FiUser />} mode="resume-helper" currentMode={mode} setMode={setMode} label="Resume Helper" />
        <ModeButton icon={<FiCpu />} mode="cp-helper" currentMode={mode} setMode={setMode} label="CP Helper" />
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 rounded-lg p-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-4 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 shadow'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans">
                {message.content}
              </pre>
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-center text-gray-500">
            Thinking...
          </div>
        )}
      </div>

      {mode === 'resume-helper' && (
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="flex-1 p-2 border rounded bg-gray-800 text-white placeholder-gray-400 border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none"
          />
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Your skills (comma separated)"
            className="flex-1 p-2 border rounded bg-gray-800 text-white placeholder-gray-400 border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none"
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={getPlaceholder(mode)}
          className="flex-1 p-4 border rounded-lg bg-gray-800 text-white placeholder-gray-400 border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function ModeButton({ 
  icon, 
  mode, 
  currentMode, 
  setMode, 
  label 
}: { 
  icon: React.ReactNode;
  mode: ChatMode; 
  currentMode: ChatMode; 
  setMode: (mode: ChatMode) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => setMode(mode)}
      className={`flex items-center space-x-2 px-4 py-2 rounded ${
        mode === currentMode
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function getPlaceholder(mode: ChatMode): string {
  switch (mode) {
    case 'summarize':
      return 'Enter text to summarize...';
    case 'explain-code':
      return 'Paste code to explain...';
    case 'generate-quiz':
      return 'Enter a topic for quiz generation...';
    case 'resume-helper':
      return 'Enter additional details (optional)...';
    case 'cp-helper':
      return 'Enter your competitive programming problem...';
    default:
      return 'Type your message...';
  }
} 