export function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export function nowIso() {
  return new Date(Date.now()).toISOString();
}
