import React, { useState, useEffect } from 'react';
import LeftSidebar from './LeftSidebar';
import ChatArea from './ChatArea';
import RightSidebar from './RightSidebar';
import Lightbox from '../Common/Lightbox';
import { useSocket } from '../../context/SocketContext';

export default function ChatLayout({
  contacts,
  selectedContact,
  onSelectContact,
  messages,
  onSendMessage,
  onReceiveMessage,
  onLogout,
  onOpenEditProfile,
  onUserUpdated,
  currentUser
}) {
  const [lightboxData, setLightboxData] = useState({ isOpen: false, src: '', alt: '' });
  const [isProfileOpenMobile, setIsProfileOpenMobile] = useState(false);
  const { socket, onlineUsers } = useSocket();

  // Listen for incoming real-time messages and user updates from socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (incomingMsg) => {
      if (onReceiveMessage) {
        onReceiveMessage(incomingMsg);
      }
    };

    const handleUserUpdated = (updatedUser) => {
      if (onUserUpdated) {
        onUserUpdated(updatedUser);
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("user_updated", handleUserUpdated);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_updated", handleUserUpdated);
    };
  }, [socket, onReceiveMessage, onUserUpdated]);

  // Dynamically attach real-time online status to contacts
  const enrichedContacts = (contacts || []).map((contact) => ({
    ...contact,
    online: Array.isArray(onlineUsers) && onlineUsers.includes(contact._id),
  }));

  // Dynamically attach real-time online status to selected contact
  const enrichedSelectedContact = selectedContact
    ? {
        ...selectedContact,
        online: Array.isArray(onlineUsers) && onlineUsers.includes(selectedContact._id),
      }
    : null;

  const openLightbox = (src, alt = '') => {
    setLightboxData({ isOpen: true, src, alt });
  };

  const closeLightbox = () => {
    setLightboxData({ isOpen: false, src: '', alt: '' });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#05040a] bg-chitchat flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 overflow-hidden select-none">
      
      {/* Ambient background blur circles */}
      <div className="absolute top-1/6 left-1/5 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/6 right-1/5 w-[550px] h-[550px] bg-indigo-700/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Glassmorphic Container matching Figure 3 & 4 */}
      <div className="relative z-10 w-full max-w-[1400px] h-[95vh] md:h-[90vh] glass-panel rounded-2xl md:rounded-3xl border border-white/10 shadow-glass flex overflow-hidden">
        
        {/* 1. Left Contacts Sidebar */}
        {/* On small mobile: hide if contact is selected, show if no contact selected */}
        <div className={`h-full ${enrichedSelectedContact ? 'hidden md:flex' : 'flex'} w-full md:w-auto`}>
          <LeftSidebar
            contacts={enrichedContacts}
            selectedContact={enrichedSelectedContact}
            onSelectContact={(contact) => {
              onSelectContact(contact);
              setIsProfileOpenMobile(false);
            }}
            onLogout={onLogout}
            onOpenEditProfile={onOpenEditProfile}
            onOpenLightbox={openLightbox}
            currentUser={currentUser}
          />
        </div>

        {/* 2. Middle Chat Area (Empty or Active) */}
        {/* On mobile: only show if contact selected OR if explicitly desired */}
        <div className={`h-full flex-1 flex flex-col ${!enrichedSelectedContact ? 'hidden md:flex' : 'flex'}`}>
          <ChatArea
            selectedContact={enrichedSelectedContact}
            messages={enrichedSelectedContact ? (messages[enrichedSelectedContact._id] || []) : []}
            onSendMessage={onSendMessage}
            onBackToList={() => onSelectContact(null)}
            onToggleProfile={() => setIsProfileOpenMobile((prev) => !prev)}
            onOpenLightbox={openLightbox}
            currentUser={currentUser}
          />
        </div>

        {/* 3. Right Profile & Media Sidebar */}
        {/* Only rendered if a contact is selected (as in Figure 3 vs Figure 4) */}
        {enrichedSelectedContact && (
          <RightSidebar
            selectedContact={enrichedSelectedContact}
            messages={enrichedSelectedContact ? (messages[enrichedSelectedContact._id] || []) : []}
            onLogout={onLogout}
            onOpenLightbox={openLightbox}
            isOpen={isProfileOpenMobile}
            onClose={() => setIsProfileOpenMobile(false)}
          />
        )}

      </div>

      {/* Lightbox Modal */}
      {lightboxData.isOpen && (
        <Lightbox
          src={lightboxData.src}
          alt={lightboxData.alt}
          onClose={closeLightbox}
        />
      )}

    </div>
  );
}
