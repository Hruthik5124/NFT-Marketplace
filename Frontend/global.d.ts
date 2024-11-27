interface Window {
    ethereum: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      // Add other properties and methods if needed
      on?: (eventName: string, callback: (...args: any[]) => void) => void;
    };
  }
  