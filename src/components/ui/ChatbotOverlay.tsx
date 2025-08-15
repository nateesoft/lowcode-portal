import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotOverlayProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatbotOverlay: React.FC<ChatbotOverlayProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'สวัสดีครับ! ผมคือผู้ช่วย AI ของ DEVLOOP มีอะไรให้ช่วยเหลือไหมครับ?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('สร้าง') || input.includes('create')) {
      return 'ผมสามารถช่วยคุณสร้างโปรเจกต์ใหม่ได้ครับ! คุณสามารถไปที่หน้า Dashboard แล้วคลิก "Create Project" หรือจะให้ผมแนะนำขั้นตอนการสร้างโปรเจกต์ไหมครับ?';
    }
    
    if (input.includes('วิธี') || input.includes('how')) {
      return 'ผมยินดีช่วยแนะนำวิธีการใช้งานครับ! คุณสามารถถามเกี่ยวกับการสร้างโปรเจกต์, การใช้ Builder, การจัดการ Components หรือคำถามอื่นๆ ได้เลยครับ';
    }
    
    if (input.includes('builder')) {
      return 'Builder เป็นเครื่องมือสำหรับสร้างและแก้ไขโปรเจกต์ครับ คุณสามารถลากวาง Components, กำหนดค่าต่างๆ และดูผลลัพธ์แบบ Real-time ได้เลยครับ';
    }
    
    if (input.includes('component')) {
      return 'Components คือส่วนประกอบต่างๆ ที่คุณสามารถนำมาใช้สร้างหน้าเว็บหรือแอปพลิเคชันครับ เช่น Header, Footer, Button, Form เป็นต้น';
    }
    
    if (input.includes('ขอบคุณ') || input.includes('thank')) {
      return 'ยินดีครับ! หากมีคำถามอื่นๆ สามารถถามผมได้ตลอดเวลานะครับ 😊';
    }
    
    return 'ขออภัยครับ ผมยังไม่เข้าใจคำถามของคุณ กรุณาลองอธิบายเพิ่มเติมหรือถามในรูปแบบอื่นดูครับ หรือคุณสามารถถามเกี่ยวกับการใช้งาน DEVLOOP Platform ได้เลยครับ';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <span className="font-medium">TON Assistant</span>
        </div>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-white/20 rounded-lg transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] p-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.sender === 'bot' && (
                  <Bot className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400" />
                )}
                <div className="text-sm">{message.content}</div>
                {message.sender === 'user' && (
                  <User className="h-4 w-4 mt-0.5" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[75%] p-3 rounded-2xl bg-slate-100 dark:bg-slate-700">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="พิมพ์ข้อความ..."
            className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotOverlay;