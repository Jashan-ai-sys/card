// 24×24 SVG icons shared by the profile page and the signature PNG renderer.
window.ICONS = {
  linkedin: '<path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>',
  github: '<path fill="currentColor" d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57l-.02-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.31-5.47-1.34-5.47-5.94 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22l-.01 3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .3"/>',
  globe: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9.2"/><path d="M2.8 12h18.4M12 2.8c2.5 2.6 3.7 5.7 3.7 9.2s-1.2 6.6-3.7 9.2c-2.5-2.6-3.7-5.7-3.7-9.2s1.2-6.6 3.7-9.2z"/></g>',
  mail: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="2.5" y="4.5" width="19" height="15" rx="3"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></g>',
  send: '<path fill="currentColor" d="M21.4 2.6a1 1 0 0 0-1.05-.23L3.1 8.75a1 1 0 0 0 0 1.88l7.07 2.47 2.47 7.07a1 1 0 0 0 1.88 0l6.38-17.25a1 1 0 0 0-.5-1.32z"/>',
  arrowUp: '<path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M12 19V5m-6 6 6-6 6 6"/>',
  mic: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></g>',
  pin: '<path fill="currentColor" d="M20.7 3.3 3.6 10.1c-.8.3-.7 1.5.2 1.7l6.6 1.8 1.8 6.6c.2.9 1.4 1 1.7.2l6.8-17.1z"/>',
  close: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="m6 6 12 12M18 6 6 18"/>',
  spark: '<path fill="currentColor" d="M12 3c.6 5.3 2.7 8.4 9 9-6.3.6-8.4 3.7-9 9-.6-5.3-2.7-8.4-9-9 6.3-.6 8.4-3.7 9-9z"/>',
  chevron: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m9 6 6 6-6 6"/>',
  user: '<g fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6" stroke-linecap="round"/></g>',
  grid: '<g fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></g>',
  pause: '<path fill="currentColor" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/>',
  play: '<path fill="currentColor" d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/>',
  chat: '<path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>',
};
window.icon = (name, cls = "i") =>
  `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${window.ICONS[name]}</svg>`;
