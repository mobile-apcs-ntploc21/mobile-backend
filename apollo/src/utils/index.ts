export const wsLogger = (message: string) => {
  console.log(`[WS]-[${new Date().toLocaleTimeString()}] ${message}`);
};
