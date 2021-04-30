const hotModuleTextSnippets = [
  "Download the React DevTools",
  "Hot Module Replacement",
  "App Updated, Reloading Modules",
  "WebSocket connected",
];

const reTestMessage = /^\((sync|lock)\)\ /;

export default (message: string): boolean => !reTestMessage.test(message);
