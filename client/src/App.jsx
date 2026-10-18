import React, { useState, useEffect } from 'react';
import AuthPage from './components/Auth/AuthPage';
import ChatLayout from './components/Chat/ChatLayout';
import EditProfileModal from './components/Chat/EditProfileModal';
import { logoutUser, fetchCurrentUser, getStoredUser, updateUserProfile } from './logic';
import { SocketProvider } from './context/SocketContext';
import api from './logic/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser() || null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  // Default to null so user can experience the "Chat anytime, anywhere" empty state as requested!
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState({});

  // Validate authenticated session on mount with backend
  useEffect(() => {
    let isMounted = true;

    // Load non-sensitive cached user details for display, but do NOT treat as authenticated
    const cachedUser = getStoredUser();
    if (cachedUser) {
      setCurrentUser((prev) => ({
        ...prev,
        ...cachedUser,
      }));
    }

    // Actively validate current session with backend endpoint /user/me
    fetchCurrentUser()
      .then((res) => {
        if (isMounted && res?.user) {
          setCurrentUser((prev) => ({
            ...prev,
            ...res.user,
          }));
          setIsAuthenticated(true);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setIsAuthenticated(false);
          // Only 401/403 clears cache; transient network or 500 errors preserve display cache
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Format current time as "h:mm A"
  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...userData,
    }));
    setIsAuthenticated(true);
    // Land on empty chat state by default
    setSelectedContact(null);
  };

  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      if (!result.serverInvalidated) {
        console.warn('[Logout Warning] Server-side invalidation failed:', result.error);
      }
    } catch (e) {
      console.warn('[Logout Exception]:', e);
    } finally {
      // Ensure the UI transitions to logged-out state even when the logout request fails
      setIsAuthenticated(false);
      setSelectedContact(null);
      setCurrentUser(null);
      setContacts([]);
      setMessages({});
    }
  };

  const handleUpdateProfile = async ({ fullName, description, bio, profilePic, password }) => {
    const response = await updateUserProfile({
      fullName,
      description: description || bio,
      profilePic,
      password: password || undefined,
    });

    if (response?.user) {
      setCurrentUser((prev) => ({
        ...prev,
        ...response.user,
      }));
    }
    return response;
  };

  const handleUserUpdated = (updatedUser) => {
    if (!updatedUser?._id) return;
    const updatedId = String(updatedUser._id);

    // If current logged-in user was updated
    if (currentUser && String(currentUser._id) === updatedId) {
      setCurrentUser((prev) => ({ ...prev, ...updatedUser }));
    }

    // Update in contacts list
    setContacts((prev) =>
      prev.map((c) =>
        String(c._id) === updatedId ? { ...c, ...updatedUser } : c
      )
    );

    // Update in active contact view
    setSelectedContact((prev) =>
      prev && String(prev._id) === updatedId ? { ...prev, ...updatedUser } : prev
    );
  };

  // Fetch sidebar contacts from backend once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/user')
        .then((res) => {
          if (res?.users) {
            setContacts(res.users);
          }
        })
        .catch((err) => {
          console.warn('[Fetch Contacts] Failed:', err);
        });
    }
  }, [isAuthenticated]);

  // Fetch real messages for currently selected contact
  useEffect(() => {
    if (selectedContact?._id && isAuthenticated) {
      api.get(`/messages/${selectedContact._id}`)
        .then((res) => {
          if (res?.messages) {
            setMessages((prev) => ({
              ...prev,
              [selectedContact._id]: res.messages,
            }));
          }
        })
        .catch((err) => {
          console.warn('[Fetch Messages] Failed:', err);
        });
    }
  }, [selectedContact?._id, isAuthenticated]);

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    if (contact) {
      // Clear unread count when opening a contact
      setContacts((prev) =>
        prev.map((c) =>
          String(c._id) === String(contact._id) ? { ...c, unreadCount: 0 } : c
        )
      );
    }
  };

  const handleSendMessage = async ({ text, image, senderId }) => {
    if (!selectedContact || (!text?.trim() && !image)) return;

    const contactId = String(selectedContact._id);
    const trimmedText = text ? text.trim() : '';

    try {
      const response = await api.post(`/messages/send/${contactId}`, {
        message: trimmedText,
        image: image || null,
      });

      const newMsg = response?.newMsg || {
        _id: `msg_${Date.now()}`,
        senderId: senderId || currentUser?._id,
        receiverId: contactId,
        message: trimmedText,
        image: image || null,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => ({
        ...prev,
        [contactId]: [...(prev[contactId] || []), newMsg],
      }));

      // Update sidebar preview for sender
      setContacts((prev) =>
        prev.map((c) => {
          if (String(c._id) === contactId) {
            return {
              ...c,
              lastMessage: trimmedText ? `You: ${trimmedText}` : 'You: 📷 Photo',
              lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error('[Send Message] Failed:', err);
    }
  };

  const handleReceiveMessage = (incomingMsg) => {
    if (!incomingMsg) return;
    console.log("📬 Real-time message received:", incomingMsg);

    const senderKey = String(incomingMsg.senderId?._id || incomingMsg.senderId);
    const myKey = String(currentUser?._id);
    const contactId = senderKey === myKey
      ? String(incomingMsg.receiverId?._id || incomingMsg.receiverId)
      : senderKey;

    const messageText =
      incomingMsg.message ||
      (incomingMsg.image ? '📷 Photo' : '') ||
      incomingMsg.text ||
      '';

    // 1. Append message to chat thread
    setMessages((prev) => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), incomingMsg],
    }));

    // 2. Update contact in sidebar:
    // If not currently looking at this contact, increment unreadCount so notification dot shows!
    setContacts((prev) =>
      prev.map((c) => {
        if (String(c._id) === contactId) {
          const isCurrentlyOpen = selectedContact && String(selectedContact._id) === contactId;
          return {
            ...c,
            unreadCount: isCurrentlyOpen ? 0 : (Number(c.unreadCount) || 0) + 1,
            lastMessage: messageText,
            lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#05040a] relative">
      {/* Main Screens */}
      {!isAuthenticated ? (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <SocketProvider currentUser={currentUser}>
          <ChatLayout
            contacts={contacts}
            selectedContact={selectedContact}
            onSelectContact={handleSelectContact}
            messages={messages}
            onSendMessage={handleSendMessage}
            onReceiveMessage={handleReceiveMessage}
            onLogout={handleLogout}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
            onUserUpdated={handleUserUpdated}
            currentUser={currentUser}
          />
        </SocketProvider>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        currentUser={currentUser}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSaveProfile={handleUpdateProfile}
      />
    </div>
  );
}
