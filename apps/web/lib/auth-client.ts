/**
 * Better Auth client singleton for the Examinr web application.
 *
 * This module exposes the auth client and its convenience methods.
 * Import from this file — do not create additional auth client instances.
 *
 * The client communicates with the Hono API at NEXT_PUBLIC_API_URL.
 * All auth requests use credentials: "include" for cookie-based sessions.
 *
 * Usage:
 *   import { authClient, useSession } from "@/lib/auth-client";
 *
 *   // In a React component:
 *   const { data: session, isPending } = useSession();
 *
 *   // Sign in:
 *   await authClient.signIn.email({ email, password });
 *
 *   // Sign up:
 *   await authClient.signUp.email({ email, password, name });
 *
 *   // Sign out:
 *   await authClient.signOut();
 */
import { createAuthClient } from "better-auth/client";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

export const authClient = createAuthClient({
  baseURL: apiBaseUrl,
  fetchOptions: {
    credentials: "include",
  },
});

// Re-export convenience methods for clean import at call sites.
export const { signIn, signOut, signUp, useSession, getSession } = authClient;
