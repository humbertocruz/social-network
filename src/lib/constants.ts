// src/lib/constants.ts

// User Roles
export const ROLES = {
    ADMIN: 'ADMIN',
    FREE: 'FREE',
    TESTER: 'TESTER',
    PREMIUM: 'PREMIUM'
  } as const
  
  // Profile Types
  export const PROFILE_TYPES = {
    HE: 'HE',
    SHE: 'SHE'
  } as const
  
  // Time Constants (in milliseconds)
  export const TIME = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
    MONTH: 30 * 24 * 60 * 60 * 1000,
    
    // Session times
    FREE_USER_SESSION: 5 * 60 * 1000, // 5 minutes
    TESTER_DURATION: 15 * 24 * 60 * 60 * 1000, // 15 days
  } as const
  
  // Validation Rules
  export const VALIDATION = {
    USERNAME: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 20,
      PATTERN: /^[a-zA-Z0-9_]+$/,
      MESSAGE: "Username can only contain letters, numbers, and underscores"
    },
    PASSWORD: {
      MIN_LENGTH: 8,
      REQUIRE_NUMBER: true,
      REQUIRE_UPPERCASE: true,
      REQUIRE_SYMBOL: true,
      MESSAGE: "Password must be at least 8 characters long and include a number, uppercase letter, and symbol"
    },
    BIO: {
      MAX_LENGTH: 500
    },
    MEDIA: {
      MAX_CAPTION_LENGTH: 200
    }
  } as const
  
  // Upload Limits
  export const UPLOAD_LIMITS = {
    IMAGE: {
      MAX_SIZE: 5 * 1024 * 1024, // 5MB
      ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      MAX_WIDTH: 2048,
      MAX_HEIGHT: 2048,
      THUMB_SIZE: 300
    },
    VIDEO: {
      MAX_SIZE: 100 * 1024 * 1024, // 100MB
      ACCEPTED_TYPES: ['video/mp4', 'video/webm'],
      MAX_DURATION: 300, // 5 minutes
      THUMB_SIZE: 300
    },
    MAX_FILES_PER_UPLOAD: 10
  } as const
  
  // API Routes
  export const API_ROUTES = {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      VERIFY: '/api/auth/verify'
    },
    USERS: {
      PROFILE: '/api/users/profile',
      UPDATE: '/api/users/update',
      LOCATION: '/api/users/location'
    },
    MEDIA: {
      UPLOAD: '/api/upload',
      GALLERY: '/api/gallery',
      RATE: '/api/media/rate'
    },
    MESSAGES: '/api/messages',
    TOP: '/api/top',
    RADAR: '/api/radar'
  } as const
  
  // App Routes
  export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    PROFILE: '/profile',
    MESSAGES: '/messages',
    GALLERY: '/gallery',
    TOP: '/top',
    RADAR: '/radar'
  } as const
  
  // Role Features
  export const ROLE_FEATURES = {
    FREE: {
      canUploadImages: false,
      canSendMessages: false,
      canCreateEvents: false,
      maxSessionTime: TIME.FREE_USER_SESSION,
      maxProfiles: 1
    },
    TESTER: {
      canUploadImages: true,
      canSendMessages: true,
      canCreateEvents: true,
      maxSessionTime: Infinity,
      maxProfiles: 2,
      duration: TIME.TESTER_DURATION
    },
    PREMIUM: {
      canUploadImages: true,
      canSendMessages: true,
      canCreateEvents: true,
      maxSessionTime: Infinity,
      maxProfiles: 2,
      canSeeLocation: true
    },
    ADMIN: {
      canUploadImages: true,
      canSendMessages: true,
      canCreateEvents: true,
      maxSessionTime: Infinity,
      maxProfiles: 2,
      canSeeLocation: true,
      canManageUsers: true,
      canViewAnalytics: true
    }
  } as const
  
  // Error Messages
  export const ERRORS = {
    AUTH: {
      INVALID_CREDENTIALS: 'Invalid username or password',
      UNAUTHORIZED: 'You must be logged in to access this resource',
      SESSION_EXPIRED: 'Your session has expired',
      INVALID_TOKEN: 'Invalid or expired token'
    },
    VALIDATION: {
      INVALID_USERNAME: 'Invalid username format',
      INVALID_PASSWORD: 'Invalid password format',
      USERNAME_TAKEN: 'Username is already taken',
      EMAIL_TAKEN: 'Email is already registered'
    },
    UPLOAD: {
      FILE_TOO_LARGE: 'File size exceeds the allowed limit',
      INVALID_TYPE: 'Invalid file type',
      TOO_MANY_FILES: 'Too many files selected',
      UPLOAD_FAILED: 'Failed to upload file'
    },
    GENERAL: {
      NOT_FOUND: 'Resource not found',
      SERVER_ERROR: 'An unexpected error occurred',
      FORBIDDEN: 'You do not have permission to perform this action'
    }
  } as const
  
  // Location Constants
  export const LOCATION = {
    MAX_DISTANCE: 50, // kilometers
    UPDATE_INTERVAL: 5 * 60 * 1000, // 5 minutes
    EXPIRE_TIME: 60 * 60 * 1000 // 1 hour
  } as const
  
  // Rating Constants
  export const RATING = {
    MIN_VALUE: 1,
    MAX_VALUE: 5,
    PERIODS: {
      DAY: 'day',
      WEEK: 'week',
      MONTH: 'month',
      ALL: 'all'
    }
  } as const
  
  // Export types
  export type Role = keyof typeof ROLES
  export type ProfileType = keyof typeof PROFILE_TYPES
  export type RatingPeriod = keyof typeof RATING.PERIODS
  
  // Export all constants
  export default {
    ROLES,
    PROFILE_TYPES,
    TIME,
    VALIDATION,
    UPLOAD_LIMITS,
    API_ROUTES,
    ROUTES,
    ROLE_FEATURES,
    ERRORS,
    LOCATION,
    RATING
  } as const
  