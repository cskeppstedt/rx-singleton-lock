const hotModuleTextSnippets = [
  "Download the React DevTools",
  "Hot Module Replacement",
  "App Updated, Reloading Modules",
  "WebSocket connected"
];

export default (message: string): boolean =>
  hotModuleTextSnippets.some(textSnippet => message.includes(textSnippet));
