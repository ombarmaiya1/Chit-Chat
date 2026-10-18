import React from 'react';
import assets from '../../assets/assets';

export default function RightSidebar({
  selectedContact,
  messages = [],
  onLogout,
  onOpenLightbox,
  isOpen,
  onClose
}) {
  if (!selectedContact) return null;

  const sharedMedia = [
    ...messages.filter((m) => m.image).map((m) => m.image),
    ...(selectedContact.media || []),
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static top-0 right-0 h-full w-[290px] lg:w-[310px] xl:w-[330px] flex flex-col justify-between border-l border-white/[0.08] bg-[#0c091f]/85 backdrop-blur-xl z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top & Profile Details */}
        <div className="p-6 overflow-y-auto">
          {/* Close button on mobile */}
          <div className="flex justify-end lg:hidden mb-2">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-md"
              aria-label="Close details"
            >
              ✕
            </button>
          </div>

          {/* Large Avatar */}
          <div className="flex flex-col items-center text-center">
            <div 
              className="relative mb-3 cursor-pointer group/avatar"
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
                className="w-24 h-24 rounded-full object-cover ring-2 ring-purple-500/30 shadow-xl shadow-purple-950/50 group-hover/avatar:ring-purple-400 group-hover/avatar:scale-105 transition"
              />
              {selectedContact.online && (
                <span className="absolute bottom-1 right-2 w-3.5 h-3.5 bg-[#22c55e] border-2 border-[#0e0a24] rounded-full" />
              )}
            </div>

            <div className="flex items-center gap-1.5 justify-center">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
              <h2 className="text-base font-semibold text-white tracking-wide">
                {selectedContact.fullName}
              </h2>
            </div>

            <p className="mt-2 text-xs text-gray-300 leading-relaxed max-w-[240px]">
              {selectedContact.description || selectedContact.bio || 'Lorem ipsum is placeholder text commonly used in ..'}
            </p>
          </div>

          {/* Divider */}
          <hr className="my-6 border-white/10" />

          {/* Media Section */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3">
              Media
            </h3>

            {sharedMedia.length === 0 ? (
              <p className="text-[11px] text-gray-500 italic">No media shared yet</p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {sharedMedia.slice(0, 6).map((photo, index) => (
                  <div
                    key={index}
                    onClick={() => onOpenLightbox(photo, `Shared media ${index + 1}`)}
                    className="aspect-video rounded-xl overflow-hidden cursor-pointer group relative border border-white/5 bg-purple-950/20"
                  >
                    <img
                      src={photo}
                      alt={`Media ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-purple-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] text-white font-medium bg-black/40 px-2 py-0.5 rounded-full">
                        View
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Logout CTA */}
        <div className="p-6 pt-2 border-t border-white/[0.06] bg-[#0c091f]/50">
          <button
            onClick={onLogout}
            className="w-full py-2.5 rounded-full btn-primary-purple text-white text-xs font-semibold tracking-wide shadow-lg shadow-purple-900/40 transition active:scale-[0.98]"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
