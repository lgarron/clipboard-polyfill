/******** Debug Logging ********/

// tslint:disable-next-line: no-empty
var debugLogImpl = (s: string) => {};

export function debugLog(s: string) {
  debugLogImpl(s);
}

export function setDebugLog(logFn: (s: string) => void) {
  debugLogImpl = logFn;
}

/******** Warnings ********/

var showWarnings = true;

export function suppressWarnings() {
  showWarnings = false;
}

export function shouldShowWarnings(): boolean {
  return showWarnings;
}

// Workaround for:
// - IE9 (can't bind console functions directly), and
// - Edge Issue #14495220 (referencing `console` without F12 Developer Tools can cause an exception)
function warnOrLog() {
  (console.warn || console.log).apply(console, arguments);
}

export var warn = warnOrLog.bind("[clipboard-polyfill]");
