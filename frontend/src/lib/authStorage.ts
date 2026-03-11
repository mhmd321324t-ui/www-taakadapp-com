export function clearLovableAuthStorage() {
  // supabase-js stores session under a key like: sb-<project-ref>-auth-token
  // We clear any such keys to recover from broken/expired refresh tokens.
  try {
    const keys = Object.keys(localStorage);
    for (const k of keys) {
      if (k.startsWith('sb-') && k.endsWith('-auth-token')) {
        localStorage.removeItem(k);
      }
    }
  } catch {
    // ignore (e.g. storage blocked)
  }
}

export function isRefreshTokenNotFoundError(err: unknown): boolean {
  const anyErr = err as any;
  const code = anyErr?.code ?? anyErr?.error_code;
  const msg = String(anyErr?.message ?? anyErr?.error_description ?? '');
  return (
    code === 'refresh_token_not_found' ||
    msg.toLowerCase().includes('refresh token not found') ||
    msg.toLowerCase().includes('invalid refresh token')
  );
}
