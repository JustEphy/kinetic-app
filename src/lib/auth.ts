/**
 * NextAuth.js Configuration
 * Supports Google OAuth and Guest sessions
 */

import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { generateId } from './db';

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    isGuest?: boolean;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isGuest?: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    isGuest?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    
    // Guest/Credentials Provider for anonymous users
    CredentialsProvider({
      id: 'guest',
      name: 'Guest',
      credentials: {},
      async authorize() {
        // Create a guest user
        const guestUser: NextAuthUser = {
          id: `guest_${generateId()}`,
          name: 'Guest User',
          email: undefined,
          image: undefined,
          isGuest: true,
        };
        return guestUser;
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isGuest = (user as NextAuthUser & { isGuest?: boolean }).isGuest || false;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isGuest = token.isGuest as boolean;
      }
      return session;
    },
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET || 'kinetic-secret-key-change-in-production',
};

export default NextAuth(authOptions);
