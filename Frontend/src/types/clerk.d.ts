/**
 * Type declarations for the Clerk global object on window.
 * ngx-clerk loads Clerk via a script tag and exposes it on window.Clerk.
 */
interface ClerkSession {
  getToken(options?: { template?: string }): Promise<string | null>;
}

interface ClerkUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  primaryEmailAddress?: {
    emailAddress: string;
  } | null;
}

interface ClerkInstance {
  user: ClerkUser | null | undefined;
  session: ClerkSession | null | undefined;
  signOut: () => Promise<void>;
}

interface Window {
  Clerk?: ClerkInstance;
}
