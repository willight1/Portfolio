export function userLabel(accountLabel?: string | null, username?: string | null) {
  return accountLabel || username || '-';
}
