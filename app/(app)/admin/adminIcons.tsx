// Small marks shared by the admin screens: the Google "G" for accounts that
// signed in with Google, and one symbol per role.

import { Crown, ShieldCheck, BadgeCheck, User as UserIcon, Mail } from "lucide-react";

export const ROLE_META: Record<string, { label: string; color: string; Icon: typeof Crown }> = {
  superadmin: { label: "Super admin", color: "#b3261e", Icon: Crown },
  admin: { label: "Admin", color: "#b8860b", Icon: ShieldCheck },
  member: { label: "Member", color: "#6d4ad1", Icon: BadgeCheck },
  normal: { label: "Normal", color: "#8a7070", Icon: UserIcon },
};

export function RoleIcon({ role, size = 12 }: { role: string; size?: number }) {
  const m = ROLE_META[role] || ROLE_META.normal;
  return <m.Icon size={size} color={m.color} aria-label={m.label} />;
}

export function GoogleG({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-label="Google">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

/** Google "G" for Google sign-ins, an envelope for email + password. */
export function ProviderIcon({ provider, size = 12 }: { provider: string; size?: number }) {
  return provider === "google" ? <GoogleG size={size} /> : <Mail size={size} color="#8b5a2b" aria-label="Email sign-in" />;
}
