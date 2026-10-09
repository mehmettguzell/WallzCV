const PULL_THRESHOLD_PX = 80;
const WHEEL_IDLE_RESET_MS = 200;

interface PullToRefreshOptions {
  on_refresh: () => void;
  on_progress?: (progress: number) => void;
}

const isPageAtTop = (): boolean => window.scrollY === 0;

const isInsideScrolledElement = (target: EventTarget | null): boolean => {
  let element = target instanceof Element ? target : null;

  while (element) {
    if (element.scrollTop > 0) return true;
    element = element.parentElement;
  }

  return false;
};

export function attach_pull_to_refresh(
  root: HTMLElement,
  options: PullToRefreshOptions,
): () => void {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const reportProgress = (progress: number): void => {
    if (!reducedMotion.matches) {
      options.on_progress?.(progress);
    }
  };

  let touchStartY: number | null = null;
  let touchProgress = 0;
  let wheelPullPx = 0;
  let wheelIdleTimer: number | undefined;

  const resetTouch = (): void => {
    touchStartY = null;
    touchProgress = 0;
    reportProgress(0);
  };

  const resetWheel = (): void => {
    wheelPullPx = 0;
    reportProgress(0);
  };

  const onTouchStart = (event: TouchEvent): void => {
    const canStartPull =
      isPageAtTop() && !isInsideScrolledElement(event.target);

    touchStartY = canStartPull ? event.touches[0].clientY : null;
  };

  const onTouchMove = (event: TouchEvent): void => {
    if (touchStartY === null) return;

    const pullDistance = event.touches[0].clientY - touchStartY;

    if (pullDistance <= 0 || !isPageAtTop()) {
      if (touchProgress > 0) resetTouch();
      return;
    }

    event.preventDefault();

    touchProgress = Math.min(pullDistance / PULL_THRESHOLD_PX, 1);

    reportProgress(touchProgress);
  };

  const onTouchEnd = (): void => {
    const shouldRefresh = touchProgress >= 1;

    resetTouch();

    if (shouldRefresh) {
      options.on_refresh();
    }
  };

  const onWheel = (event: WheelEvent): void => {
    const cannotPull =
      event.deltaY >= 0 ||
      !isPageAtTop() ||
      isInsideScrolledElement(event.target);

    if (cannotPull) {
      if (wheelPullPx > 0) resetWheel();
      return;
    }

    wheelPullPx += -event.deltaY;

    window.clearTimeout(wheelIdleTimer);

    if (wheelPullPx >= PULL_THRESHOLD_PX) {
      resetWheel();
      options.on_refresh();
      return;
    }

    reportProgress(wheelPullPx / PULL_THRESHOLD_PX);

    wheelIdleTimer = window.setTimeout(resetWheel, WHEEL_IDLE_RESET_MS);
  };

  root.addEventListener("touchstart", onTouchStart, {
    passive: true,
  });
  root.addEventListener("touchmove", onTouchMove, {
    passive: false,
  });
  root.addEventListener("touchend", onTouchEnd);
  root.addEventListener("touchcancel", resetTouch);
  root.addEventListener("wheel", onWheel, {
    passive: true,
  });

  return (): void => {
    window.clearTimeout(wheelIdleTimer);

    root.removeEventListener("touchstart", onTouchStart);
    root.removeEventListener("touchmove", onTouchMove);
    root.removeEventListener("touchend", onTouchEnd);
    root.removeEventListener("touchcancel", resetTouch);
    root.removeEventListener("wheel", onWheel);
  };
}
