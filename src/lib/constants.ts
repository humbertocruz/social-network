// src/lib/constants.ts

// Role settings
export const ROLES = {
    ADMIN: 'ADMIN',
    FREE: 'FREE',
    TESTER: 'TESTER',
    PREMIUM: 'PREMIUM'
  } as const
  
  // Time settings in milliseconds
  export const TIME = {
    FREE_USER_SESSION: 5 * 60 * 1000, // 5 minutes
    TESTER_DURATION: 15 * 24 * 60 * 60 * 1000, // 15 days
  } as const
  
  // Profile types
  export const PROFILE_TYPES = {
    HE: 'HE',
    SHE: 'SHE'
  } as const
  
  // Upload limits
  export const UPLOAD_LIMITS = {
    IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
    ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ACCEPTED_VIDEO_TYPES: ['video/mp4', 'video/webm']
  } as const
  
  // API Routes
  export const API_ROUTES = {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout'
    },
    MESSAGES: '/api/messages',
    UPLOAD: '/api/upload'
  } as const
  
  // Navigation routes
  export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    PROFILE: '/profile',
    MESSAGES: '/messages',
    GALLERY: '/gallery',
    EVENTS: '/events',
    ADMIN: '/admin'
  } as const
  
  // Error messages
  export const ERRORS = {
    AUTH: {
      UNAUTHORIZED: 'You must be logged in to access this resource',
      INVALID_CREDENTIALS: 'Invalid email or password',
      SESSION_EXPIRED: 'Your session has expired'
    },
    UPLOAD: {
      FILE_TOO_LARGE: 'File size exceeds the allowed limit',
      INVALID_TYPE: 'Invalid file type'
    }
  } as const
  
  // Role features
  export const ROLE_FEATURES = {
    FREE: {
      canUploadImages: false,
      canSendMessages: false,
      maxSessionTime: TIME.FREE_USER_SESSION
    },
    TESTER: {
      canUploadImages: true,
      canSendMessages: true,
      maxSessionTime: Infinity,
      duration: TIME.TESTER_DURATION
    },
    PREMIUM: {
      canUploadImages: true,
      canSendMessages: true,
      maxSessionTime: Infinity
    },
    ADMIN: {
      canUploadImages: true,
      canSendMessages: true,
      maxSessionTime: Infinity,
      canManageUsers: true
    }
  } as const
  
  export type Role = keyof typeof ROLES
  export type ProfileType = keyof typeof PROFILE_TYPES
  