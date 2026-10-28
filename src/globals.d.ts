declare module '@typebot.io/js' {
  export interface BubbleParams {
    typebot: string;
    previewMessage?: {
      message: string;
    };
    theme?: {
      placement?: string;
      button?: {
        backgroundColor?: string;
        customIconSrc?: string;
      };
    };
  }

  export function initBubble(params: BubbleParams): void;
  export function open(): void;
  export function close(): void;
  export function toggle(): void;

  const typebot: {
    initBubble: typeof initBubble;
    open: typeof open;
    close: typeof close;
    toggle: typeof toggle;
  };

  export default typebot;
}
