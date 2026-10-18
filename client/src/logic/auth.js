import api from './api';

const USER_STORAGE_KEY = 'chitchat_user';

/**
 * Safely parse and retrieve cached user profile from localStorage.
 * Note: localStorage is strictly used as a display cache for non-sensitive profile info,
 * NEVER as proof of an authenticated session.
 * @returns {Object|null}
 */
export function getStoredUser() {
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === 'object') {
      // Ensure no sensitive credentials or tokens reside in cache
      const { password, token, otpToken, ...safeProfile } = parsed;
      return safeProfile;
    }
    return null;
  } catch (err) {
    // Malformed JSON: safely clear corrupted entry
    clearStoredUser();
    return null;
  }
}

/**
 * Save non-sensitive user profile to localStorage cache.
 * Strips any sensitive fields before persisting.
 * @param {Object} user
 */
export function saveStoredUser(user) {
  if (!user || typeof user !== 'object') return;
  try {
    const { password, token, otpToken, ...safeProfile } = user;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(safeProfile));
  } catch (err) {
    console.warn('[Auth Storage] Failed to cache user profile:', err);
  }
}

/**
 * Clear cached user profile from localStorage.
 */
export function clearStoredUser() {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (err) {
    console.warn('[Auth Storage] Failed to clear user cache:', err);
  }
}

/**
 * Authenticate user with email and password.
 * Backend sets an httpOnly 'token' cookie upon success.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ success: boolean, message: string, user: Object }>}
 */
export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // 1. Submit login credentials to backend
  const response = await api.post('/auth/login', {
    email: email.trim().toLowerCase(),
    password,
  });

  let user = response?.user;

  // 2. If the login response did not bundle the user object, fetch through /user/me
  if (!user || typeof user !== 'object' || !user._id) {
    try {
      const meResponse = await fetchCurrentUser();
      user = meResponse?.user;
    } catch (fetchError) {
      // Distinguish successful authentication (cookie issued) from profile-fetch failure.
      // Do not fabricate a user object.
      const profileError = new Error(
        'Login credentials accepted, but failed to retrieve user profile: ' +
          (fetchError.message || 'Profile fetch error')
      );
      profileError.authenticated = true;
      profileError.status = fetchError.status;
      profileError.cause = fetchError;
      throw profileError;
    }
  }

  // Validate that a real user object was retrieved
  if (!user || typeof user !== 'object') {
    const invalidError = new Error('Authentication succeeded, but invalid user profile format received.');
    invalidError.authenticated = true;
    throw invalidError;
  }

  // 3. Cache valid non-sensitive profile
  saveStoredUser(user);

  return {
    success: true,
    message: response?.message || 'Login successful',
    user,
  };
}

/**
 * Register a new user account.
 * @param {{ fullName: string, email: string, password: string, description?: string }} data
 * @returns {Promise<{ success: boolean, message: string, user?: Object }>}
 */
export async function registerUser({ fullName, email, password, description = '' }) {
  if (!fullName || !email || !password) {
    throw new Error('Full name, email, and password are required');
  }

  const response = await api.post('/auth/register', {
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    password,
    description: typeof description === 'string' ? description.trim() : '',
  });

  return {
    success: true,
    message: response?.message || 'Registration successful',
    user: response?.user || null,
  };
}

/**
 * Invalidate server-side session cookie and clear local cache.
 * Explicitly distinguishes server-side session invalidation success from server failures.
 * @returns {Promise<{ success: boolean, serverInvalidated: boolean, message?: string, error?: string }>}
 */
export async function logoutUser() {
  let serverInvalidated = false;
  let serverError = null;

  try {
    const response = await api.post('/auth/logout');
    serverInvalidated = true;
    return {
      success: true,
      serverInvalidated: true,
      message: response?.message || 'Logout successful',
    };
  } catch (error) {
    serverError = error;
    console.error('[Logout Server Error] Failed to invalidate session on server:', error.message);
    return {
      success: false,
      serverInvalidated: false,
      error: error.message || 'Server-side logout request failed',
    };
  } finally {
    // Always clear cached profile data
    clearStoredUser();
  }
}

/**
 * Fetch authenticated user profile from backend (/user/me).
 * Distinguishes 401 Unauthorized from transient network or 5xx server errors:
 * only clears cached user data when explicitly unauthorized.
 * @returns {Promise<{ user: Object }>}
 */
export async function fetchCurrentUser() {
  try {
    const response = await api.get('/user/me');
    if (response?.user && typeof response.user === 'object' && response.user._id) {
      saveStoredUser(response.user);
    }
    return response;
  } catch (error) {
    // Only clear local cache if server definitively states session is invalid/unauthorized
    if (error.status === 401 || error.status === 403) {
      clearStoredUser();
    }
    // Do not clear cache on network errors, timeouts, or 500 errors
    throw error;
  }
}

/**
 * Update authenticated user profile.
 * Note: The backend requires current password to verify and authorize updates.
 * Sensitive password changes are protected and must use the dedicated OTP flow.
 * @param {{ fullName?: string, email?: string, description?: string, password: string }} data
 * @returns {Promise<{ success: boolean, message: string, user: Object }>}
 */
export async function updateUserProfile(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Update payload must be an object');
  }

  const payload = {
    ...(data.password ? { password: data.password } : {}),
    ...(data.fullName ? { fullName: data.fullName.trim() } : {}),
    ...(data.email ? { email: data.email.trim().toLowerCase() } : {}),
    ...(data.description !== undefined ? { description: String(data.description).trim() } : {}),
    ...(data.profilePic !== undefined ? { profilePic: data.profilePic } : {}),
  };

  const response = await api.put('/user/update-user', payload);

  // Update cached profile ONLY when a valid updated user object is returned
  if (response?.user && typeof response.user === 'object' && response.user._id) {
    saveStoredUser(response.user);
  }

  return {
    success: Boolean(response?.success ?? true),
    message: response?.message || 'Profile updated successfully',
    user: response?.user,
  };
}

/**
 * Update authenticated user display picture (DP).
 * Sends image data (base64 or URL) to /user/update-dp.
 * @param {string} profilePic
 * @returns {Promise<{ success: boolean, message: string, user: Object }>}
 */
export async function updateDisplayPicture(profilePic) {
  if (!profilePic) {
    throw new Error('Image data is required');
  }

  const response = await api.put('/user/update-dp', { profilePic });

  if (response?.user && typeof response.user === 'object' && response.user._id) {
    saveStoredUser(response.user);
  }

  return {
    success: Boolean(response?.success ?? true),
    message: response?.message || 'Display picture updated successfully',
    user: response?.user,
  };
}

/**
 * Request an OTP for password recovery sent to user email.
 * @param {string} email
 * @returns {Promise<{ message: string }>}
 */
export async function sendPasswordResetOTP(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('A valid email address is required');
  }
  return await api.post('/auth/send-otp', {
    email: email.trim().toLowerCase(),
  });
}

/**
 * Verify OTP received via email.
 * Backend verifies attempt limits and issues an httpOnly otpToken cookie on success.
 * @param {{ email: string, otp: string }} data
 * @returns {Promise<{ message: string }>}
 */
export async function verifyOTP({ email, otp }) {
  if (!email || !otp) {
    throw new Error('Email and OTP code are required');
  }
  return await api.post('/auth/verify-otp', {
    email: email.trim().toLowerCase(),
    otp: String(otp).trim(),
  });
}

/**
 * Reset password using the validated OTP session.
 * The backend securely binds this request to the email in the verified otpToken cookie.
 * @param {{ password: string }} data
 * @returns {Promise<{ message: string }>}
 */
export async function resetPassword({ password }) {
  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  return await api.post('/auth/reset-password', { password });
}
