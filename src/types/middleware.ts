// src/types/middleware.ts
declare module 'http' {
    interface IncomingHttpHeaders {
      'x-user-id'?: string
      'x-user-role'?: string
    }
  }
  