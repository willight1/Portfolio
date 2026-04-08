export function userLabel(displayName?: string | null, username?: string | null) {
  return displayName || username || '-';
}
