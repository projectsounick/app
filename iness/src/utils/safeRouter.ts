import {
  router as nativeRouter,
  type ImperativeRouter,
} from "expo-router";

const NAVIGATION_LOCK_MS = 750;

let nextAllowedNavigationAt = 0;

function runGuarded(action: () => void): boolean {
  const now = Date.now();
  if (now < nextAllowedNavigationAt) {
    return false;
  }

  nextAllowedNavigationAt = now + NAVIGATION_LOCK_MS;
  try {
    action();
    return true;
  } catch (error) {
    nextAllowedNavigationAt = 0;
    throw error;
  }
}

type NavigateArgs = Parameters<ImperativeRouter["navigate"]>;
type PushArgs = Parameters<ImperativeRouter["push"]>;
type ReplaceArgs = Parameters<ImperativeRouter["replace"]>;

/**
 * Shared navigation gate for all press-driven navigation.
 *
 * Normal screen changes should use `navigate`, which reuses the currently
 * focused route. `push` remains available only for flows that intentionally
 * need another instance of a route. Both paths, plus back/replace, ignore
 * rapid follow-up actions while the current transition starts.
 */
export const safeRouter = {
  navigate: (...args: NavigateArgs) =>
    runGuarded(() => nativeRouter.navigate(...args)),

  push: (...args: PushArgs) =>
    runGuarded(() => nativeRouter.push(...args)),

  replace: (...args: ReplaceArgs) =>
    runGuarded(() => nativeRouter.replace(...args)),

  back: () => runGuarded(() => nativeRouter.back()),

  canGoBack: () => nativeRouter.canGoBack(),
};

