import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  CheckCheck,
  Image as ImageIcon,
  Paperclip,
  Phone,
  Send,
  Sparkles,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { store } from '../data/store';
import { Booking, Message } from '../types';
import { TradeAvatar } from './TradeAvatar';

interface ChatDrawerProps {
  initialBookingId?: string;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ initialBookingId, onClose }) => {
  const currentUser = store.currentUser;
  const bookings = store.bookings;

  // Find active booking to chat regarding
  const activeBooking =
    (initialBookingId ? bookings.find((b) => b.id === initialBookingId) : null) ||
    bookings[0];

  const [bookingId, setBookingId] = useState<string>(activeBooking ? activeBooking.id : '');
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentBooking = bookings.find((b) => b.id === bookingId) || activeBooking;
  const chatMessages = store.messages.filter((m) => m.bookingId === currentBooking?.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim() || !currentBooking) return;

    store.sendMessage({
      bookingId: currentBooking.id,
      senderId: currentUser.id,
      senderRole: currentUser.role,
      senderName: currentUser.name,
      text: inputText.trim(),
    });

    setInputText('');

    // Simulate pro typing indicator
    if (currentUser.role === 'customer') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 1400);
    }
  };

  const handleQuickChip = (chip: string) => {
    setInputText(chip);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] glass-panel border-l border-slate-800 bg-slate-950/95 backdrop-blur-2xl shadow-2xl flex flex-col text-left">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <TradeAvatar
              name={
                currentUser.role === 'customer'
                  ? currentBooking?.professionalName || 'Service Pro'
                  : currentBooking?.customerName || 'Customer'
              }
              category={currentBooking?.professionalCategory || ''}
              size="md"
              className="rounded-full ring-2 ring-emerald-500/40"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          </div>

          <div>
            <h3 className="text-xs font-bold text-white truncate max-w-[200px]">
              {currentUser.role === 'customer'
                ? currentBooking?.professionalName || 'Service Professional'
                : currentBooking?.customerName || 'Customer'}
            </h3>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span>● Online</span>
              <span className="text-slate-400">· Co-op Direct</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Booking Context Pill */}
      {currentBooking && (
        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="truncate">
            <span className="text-slate-400">Order #{currentBooking.id.slice(-5)}:</span>{' '}
            <span className="font-semibold text-slate-200">{currentBooking.serviceName}</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 shrink-0">
            {currentBooking.status.replace('_', ' ')}
          </span>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-2">
            <Wrench className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs">No messages yet. Send a note to discuss your job details.</p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-slate-400 mb-1 px-1">
                  {msg.senderName} · {msg.timestamp}
                </span>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-900/20'
                      : 'bg-slate-800/90 text-slate-100 rounded-bl-none border border-slate-700/60'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 px-1">
                  <CheckCheck className="w-3 h-3 text-emerald-400" />
                </div>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 text-slate-400 text-xs w-fit">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-200" />
            </div>
            <span>Typing reply...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Replies */}
      <div className="px-3 py-1.5 bg-slate-900/40 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto text-[11px] scrollbar-thin">
        {[
          'What is your estimated arrival time?',
          'Do you need me to turn off the main switch/valve?',
          'The parking is inside gate 2.',
          'Please bring extra replacement washers.',
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickChip(chip)}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
