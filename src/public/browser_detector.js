/**
 * Browser detector
 *
 * @description Detect which browser you are on.
 * @result getBrowser
 */

window.getBrowser = () => {
  if (
    window.opera ||
    (window.opr && opr.addons) ||
    /OPR/.test(navigator.userAgent)
  ) {
    return "Opera";
  }
  if (window.InstallTrigger) {
    return "Firefox";
  }
  if (
    window.safari &&
    /SafariRemoteNotification/.test(safari.pushNotification)
  ) {
    return "Safari";
  }
  if (window.chrome && (chrome.webstore || chrome.runtime)) {
    if (/Edg/.test(navigator.userAgent)) {
      return "Edge";
    } else {
      return "Chrome";
    }
  }
};
