import React, { useState } from 'react';
import assets from '../../assets/assets';

export default function LeftSidebar({
  contacts,
  selectedContact,
  onSelectContact,
  onLogout,
  onOpenEditProfile,
  onOpenLightbox,
  currentUser
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const filteredContacts = contacts.filter((contact) =>
    contact.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-full md:w-[320px] lg:w-[350px] flex-shrink-0 flex flex-col h-full border-r border-white/[0.08] bg-[#0c091d]/60 backdrop-blur-xl relative z-10">

      {/* Top Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <img
            src={assets.logo_icon}
            alt="chit-Chat Logo"
            className="w-8 h-8 drop-shadow-[0_2px_10px_rgba(147,110,255,0.4)]"
          />
          <h1 className="text-xl font-bold tracking-tight text-white">
            chit-Chat
          </h1>
        </div>

        {/* Right side: User DP Avatar + 3-Dots Menu */}
        <div className="flex items-center gap-2.5">
          {/* User DP Avatar with Quick Edit click */}
          <button
            type="button"
            onClick={onOpenEditProfile}
            className="relative group p-0.5 rounded-full ring-2 ring-purple-500/40 hover:ring-purple-400 transition"
            title="Your Profile / Change DP"
            aria-label="Edit Profile & Change DP"
          >
            <img
              src={currentUser?.profilePic || assets.avatar_icon}
              alt="My Profile DP"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22c55e] border-2 border-[#0c091d] rounded-full" />
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <span className="text-[10px]">📷</span>
            </div>
          </button>

          {/* 3-Dots Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Options menu"
            >
              <img
                src={assets.menu_icon}
                alt="Menu"
                className="w-4 h-4 object-contain opacity-80 hover:opacity-100"
              />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2.5 w-64 md:w-72 rounded-2xl bg-[#181236]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 p-2 text-gray-200">
                  {/* User Profile Header Card - Click to edit DP */}
                  <div 
                    onClick={() => {
                      setShowMenu(false);
                      onOpenEditProfile();
                    }}
                    className="p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 flex items-center gap-3.5 mb-1.5 cursor-pointer transition group"
                    title="Click to edit profile & change DP"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={currentUser?.profilePic || assets.avatar_icon}
                        alt="Avatar"
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/40 shadow-md group-hover:ring-purple-300 transition"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22c55e] border-2 border-[#181236] rounded-full" />
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <span className="text-xs">📷</span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-purple-300 uppercase tracking-wider font-semibold block">
                          Signed in as
                        </span>
                        <span className="text-[10px] text-purple-400 group-hover:underline">Edit DP</span>
                      </div>
                      <h3 className="text-sm font-bold text-white truncate">
                        {currentUser?.fullName || 'User'}
                      </h3>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {currentUser?.description || currentUser?.bio || 'Click to change profile'}
                      </p>
                    </div>
                  </div>

                {/* Menu Action Buttons */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onOpenEditProfile();
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-purple-600/20 hover:text-white transition text-sm text-gray-200 font-medium flex items-center justify-between group"
                  >
                    <span>Edit Profile</span>
                    <span className="text-xs text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-red-950/40 text-sm text-red-300 hover:text-red-200 transition font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>

      {/* Search Input Bar */}
      <div className="px-5 mb-3">
        <div className="relative flex items-center">
          <img
            src={assets.search_icon}
            alt="Search"
            className="absolute left-3.5 w-3.5 h-3.5 object-contain opacity-60 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search User..."
            className="w-full bg-[#1b153b]/80 border border-white/5 rounded-full pl-9 pr-4 py-2 text-xs md:text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-xs text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">
            No contacts found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const isSelected = selectedContact?._id === contact._id;
            return (
              <div
                key={contact._id}
                onClick={() => onSelectContact(contact)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${isSelected
                    ? 'bg-[#322361]/85 shadow-lg shadow-purple-900/30 border border-purple-500/30'
                    : 'hover:bg-white/[0.04] border border-transparent'
                  }`}
              >
                {/* Left: Avatar + Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div 
                    className="relative flex-shrink-0 cursor-pointer group/avatar"
                    onClick={(e) => {
                      if (contact.profilePic && onOpenLightbox) {
                        e.stopPropagation();
                        onOpenLightbox(contact.profilePic, `${contact.fullName}'s Profile Photo`);
                      }
                    }}
                    title={contact.profilePic ? "Click to view full photo" : contact.fullName}
                  >
                    <img
                      src={contact.profilePic || assets.avatar_icon}
                      alt={contact.fullName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10 group-hover/avatar:ring-purple-400 group-hover/avatar:scale-105 transition"
                    />
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22c55e] border-2 border-[#0e0a24] rounded-full" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-medium truncate ${isSelected ? 'text-white font-semibold' : 'text-gray-200 group-hover:text-white'}`}>
                        {contact.fullName}
                      </h3>
                      {contact.lastMessageTime && (
                        <span className="text-[10px] text-gray-400 ml-1.5 flex-shrink-0">
                          {contact.lastMessageTime}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${Number(contact.unreadCount) > 0 ? 'text-purple-300 font-medium' : 'text-gray-400'}`}>
                      {contact.lastMessage ? (
                        <span>{contact.lastMessage}</span>
                      ) : (
                        <span className={contact.online ? 'text-[#22c55e]' : 'text-gray-400'}>
                          {contact.online ? 'Online' : 'Offline'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right: Notification Dot with number of unseen messages */}
                {Number(contact.unreadCount) > 0 && !isSelected && (
                  <div className="flex-shrink-0 ml-2 flex items-center">
                    <span className="min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full bg-[#8253fe] text-[11px] font-bold text-white shadow-lg shadow-purple-900/60 ring-2 ring-[#0c091d] animate-pulse">
                      {contact.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </aside>
  );
}
