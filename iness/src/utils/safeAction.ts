const DEFAULT_ACTION_LOCK_MS = 750;

const activeActions = new Set<string>();
const cooldowns = new Map<string, number>();

function startCooldown(key: string, lockMs: number) {
  activeActions.delete(key);

  const cooldownUntil = Date.now() + lockMs;
  cooldowns.set(key, cooldownUntil);

  setTimeout(() => {
    if (cooldowns.get(key) === cooldownUntil) {
      cooldowns.delete(key);
    }
  }, lockMs);
}

/**
 * Runs a press action at most once while it is in flight and briefly after it
 * settles. Use a stable, feature-specific key for actions that can open native
 * UI, show alerts, submit forms, or otherwise run before React can apply a
 * disabled/loading state.
 */
export function runSingleAction(
  key: string,
  action: () => void | Promise<unknown>,
  lockMs = DEFAULT_ACTION_LOCK_MS
): boolean {
  const now = Date.now();
  if (activeActions.has(key) || (cooldowns.get(key) ?? 0) > now) {
    return false;
  }

  activeActions.add(key);

  try {
    const result = action();

    if (result && typeof (result as Promise<unknown>).then === "function") {
      void Promise.resolve(result).then(
        () => startCooldown(key, lockMs),
        () => startCooldown(key, lockMs)
      );
    } else {
      startCooldown(key, lockMs);
    }

    return true;
  } catch (error) {
    activeActions.delete(key);
    cooldowns.delete(key);
    throw error;
  }
}
