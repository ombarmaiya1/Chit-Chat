import React, { useState, useRef, useEffect } from 'react';
import assets from '../../assets/assets';

export default function ChatArea({
  selectedContact,
  messages,
  onSendMessage,
  onBackToList,
  onToggleProfile,
  onOpenLightbox,
  currentUser
}) {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedContact]);

  // Handle image attachment from local machine
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() && !attachedImage) return;

    onSendMessage({
      text: inputText.trim(),
      image: attachedImage,
      senderId: currentUser?._id || 'current_user_id',
    });

    setInputText('');
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 1. EMPTY / WELCOME STATE (Figure 4)
  if (!selectedContact) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 h-full text-center relative z-10 select-none bg-black/20">
        <div className="flex flex-col items-center animate-soft-pulse">
          <img
            src={assets.logo_icon}
            alt="chit-Chat Logo"
            className="w-20 h-20 md:w-24 md:h-24 mb-4 drop-shadow-[0_8px_30px_rgba(147,110,255,0.45)]"
          />
          <h2 className="text-xl md:text-2xl font-medium tracking-wide text-white/90">
            Chat anytime, anywhere
          </h2>
          <p className="mt-2 text-xs md:text-sm text-gray-400 max-w-sm">
            Select a contact from the list on the left to start a conversation.
          </p>
        </div>
      </main>
    );
  }

  // 2. ACTIVE CHAT STATE (Figure 3)
  return (
    <main className="flex-1 flex flex-col h-full bg-[#0a0718]/40 backdrop-blur-md relative z-10 overflow-hidden">
      
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#0f0b24]/60">
        <div className="flex items-center gap-3">
          {/* Mobile Back Button */}
          <button
            onClick={onBackToList}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Back to contacts"
          >
            <img src={assets.arrow_icon} alt="Back" className="w-4 h-4 object-contain invert opacity-80" />
          </button>

          {/* Active Contact Avatar & Name */}
          <div 
            className="relative cursor-pointer group/avatar"
            onClick={() => {
              if (selectedContact.profilePic && onOpenLightbox) {
                onOpenLightbox(selectedContact.profilePic, `${selectedContact.fullName}'s Profile Photo`);
              }
            }}
            title={selectedContact.profilePic ? "Click to view full photo" : selectedContact.fullName}
          >
            <img
              src={selectedContact.profilePic || assets.avatar_icon}
              alt={selectedContact.fullName}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10 group-hover/avatar:ring-purple-400 group-hover/avatar:scale-105 transition"
            />
            {selectedContact.online && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22c55e] border-2 border-[#0e0a24] rounded-full" />
            )}
          </div>
          <div>
            <h2 className="text-sm md:text-base font-semibold text-white tracking-wide">
              {selectedContact.fullName}
            </h2>
            <p className="text-[11px] text-[#22c55e] font-medium flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
              {selectedContact.online ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        {/* Right Info Button (toggles right sidebar) */}
        <button
          onClick={onToggleProfile}
          className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-gray-300 hover:text-white hover:border-purple-400/50 hover:bg-purple-900/20 transition text-xs font-semibold"
          title="Contact details & media"
          aria-label="Contact info"
        >
          i
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-xs">
            No messages yet. Say hello to {selectedContact.fullName}!
          </div>
        ) : (
          messages.map((msg, index) => {
            const senderKey = msg.senderId?._id || msg.senderId;
            const myKey = currentUser?._id || 'current_user_id';
            const isMe = String(senderKey) === String(myKey);
            const avatar = isMe
              ? currentUser?.profilePic || assets.avatar_icon
              : selectedContact?.profilePic || assets.avatar_icon;
            const messageBody = msg.text || msg.message;
            const messageTime =
              msg.time ||
              (msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '');

            return (
              <div
                key={msg._id || msg.id || index}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Message Bubble Container */}
                <div
                  className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm tracking-wide shadow-lg ${
                    isMe
                      ? 'bg-[#432782]/85 text-white border border-purple-400/25 rounded-br-none shadow-purple-950/40'
                      : 'bg-[#1e173e]/85 text-gray-200 border border-white/5 rounded-bl-none shadow-black/30'
                  }`}
                >
                  {/* Optional Image */}
                  {msg.image && (
                    <div 
                      className="mb-2 cursor-pointer overflow-hidden rounded-xl group relative"
                      onClick={() => onOpenLightbox(msg.image, `Shared image from ${isMe ? 'you' : selectedContact.fullName}`)}
                    >
                      <img
                        src={msg.image}
                        alt="Shared media"
                        className="max-h-60 w-auto rounded-xl object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs text-white">
                        Click to enlarge
                      </div>
                    </div>
                  )}

                  {messageBody && (
                    <p className="leading-relaxed select-text whitespace-pre-wrap">{messageBody}</p>
                  )}
                </div>

                {/* Avatar & Timestamp below message bubble */}
                <div className={`flex items-center gap-2 mt-1.5 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <img
                    src={avatar}
                    alt="User"
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-white/10"
                  />
                  <span className="text-[11px] text-gray-400 font-medium">
                    {messageTime}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Footer */}
      <div className="p-3 md:p-5 pt-0">
        
        {/* Attached image preview banner if user selected a file */}
        {attachedImage && (
          <div className="mb-2 px-3 py-2 bg-[#1b153b]/90 border border-purple-500/30 rounded-xl flex items-center justify-between max-w-xs">
            <div className="flex items-center gap-2">
              <img src={attachedImage} alt="Attachment" className="w-9 h-9 object-cover rounded-lg border border-white/10" />
              <span className="text-xs text-gray-200 truncate">Image ready to send</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setAttachedImage(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded-md hover:bg-white/10 cursor-pointer transition"
              title="Remove image"
            >
              ✕
            </button>
          </div>
        )}

        <form
          onSubmit={handleSend}
          className="flex items-center gap-3 bg-[#171233]/90 border border-white/10 rounded-full px-4 py-2 shadow-2xl backdrop-blur-xl focus-within:border-purple-500/40 focus-within:ring-1 focus-within:ring-purple-500/20 transition"
        >
          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message"
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none"
          />

          {/* Hidden File Picker */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          {/* Gallery Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1 text-gray-400 hover:text-white transition opacity-70 hover:opacity-100"
            title="Attach image"
            aria-label="Attach media"
          >
            <img src={assets.gallery_icon} alt="Attach" className="w-5 h-5 object-contain" />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition transform active:scale-95 shadow-md shadow-purple-900/40 hover:opacity-90"
            aria-label="Send message"
          >
            <img src={assets.send_button} alt="Send" className="w-8 h-8 object-contain" />
          </button>
        </form>
      </div>

    </main>
  );
}
