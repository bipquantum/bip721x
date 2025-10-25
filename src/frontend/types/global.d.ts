// global.d.ts
export {};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    mixpanel?: {
      init: (token: string, config?: any) => void;
      track: (event_name: string, properties?: any) => void;
      identify: (unique_id: string) => void;
      people: {
        set: (properties: any) => void;
      };
      register: (properties: any) => void;
      reset: () => void;
    };
  }
}
