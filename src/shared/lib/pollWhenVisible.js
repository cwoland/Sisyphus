export const pollWhenVisible = (ms) => () => 
(typeof document === 'undefined' || document.visibilityState === 'visible' ? ms : false);