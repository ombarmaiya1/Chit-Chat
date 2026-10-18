import React, { useState, useRef, useEffect } from 'react';
import assets from '../../assets/assets';

export default function EditProfileModal({
  currentUser,
  isOpen,
  onClose,
  onSaveProfile
}) {
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [description, setDescription] = useState(currentUser?.description || currentUser?.bio || '');
  const [profilePic, setProfilePic] = useState(currentUser?.profilePic || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Sync state when modal opens or currentUser updates
  useEffect(() => {
    if (isOpen && currentUser) {
      setFullName(currentUser.fullName || '');
      setDescription(currentUser.description || currentUser.bio || '');
      setProfilePic(currentUser.profilePic || '');
      setPassword('');
      setError('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file is too large (max 10MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePic('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setSaving(true);
    try {
      await onSaveProfile({
        fullName: fullName.trim() || currentUser?.fullName || 'User',
        description: description.trim(),
        bio: description.trim(),
        profilePic: profilePic,
        password: password.trim() ? password.trim() : undefined,
      });
      setPassword('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md glass-card rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">📷</span>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Edit Profile & DP
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Display Picture (DP) Upload Preview */}
          <div className="flex flex-col items-center">
            <div 
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              title="Click to choose a new Display Picture (DP)"
            >
              <img
                src={profilePic || assets.avatar_icon}
                alt="Profile avatar"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-500/40 shadow-xl group-hover:opacity-80 transition duration-200"
              />
              <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                <span className="text-white text-xs font-semibold">Change DP</span>
                <span className="text-base">📸</span>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <div className="flex items-center gap-2.5 mt-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-purple-300 hover:text-purple-200 font-medium bg-purple-950/40 hover:bg-purple-900/50 px-3 py-1 rounded-full border border-purple-500/30 transition cursor-pointer"
              >
                Upload New Photo
              </button>
              {profilePic && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-xs text-red-300 hover:text-red-200 font-medium bg-red-950/40 hover:bg-red-900/50 px-3 py-1 rounded-full border border-red-500/30 transition cursor-pointer"
                >
                  Remove DP
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Supports JPG, PNG, WEBP (saved to Cloudinary)
            </p>
          </div>

          {/* Full Name Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Your full name"
              className="w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white placeholder-gray-400 focus:outline-none transition"
            />
          </div>

          {/* Description / Bio Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300">
                Description / Status
              </label>
              <span className="text-[11px] text-gray-400">
                {description.length}/150
              </span>
            </div>
            <textarea
              rows="3"
              maxLength="150"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell others about yourself, your status or what you're working on..."
              className="w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white placeholder-gray-400 focus:outline-none resize-none transition"
            />
          </div>

          {/* Email (Read-only display) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={currentUser?.email || 'user@chit-chat.dev'}
              disabled
              className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-white/5 text-sm text-gray-400 cursor-not-allowed select-none"
            />
          </div>

          {/* Current Password Field (Optional for DP/Bio update) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300">
                Current Password <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password if changing sensitive account details"
              className="w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white placeholder-gray-400 focus:outline-none transition"
            />
          </div>

          {error && (
            <div className="text-xs text-red-200 bg-red-950/60 border border-red-500/40 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg btn-primary-purple text-white text-xs font-semibold tracking-wide shadow-lg shadow-purple-900/40 transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {saving ? 'Uploading & Saving...' : 'Save Profile & DP'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
