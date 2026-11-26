/**
 * Mobile exit-intent on the start page.
 * The visitor has scrolled upward by more than 50px and is still near the top.
 */
export function shouldShowExitIntent(currentScrollY: number, previousScrollY: number): boolean {
  return currentScrollY < previousScrollY - 50 && currentScrollY < 200;
}
