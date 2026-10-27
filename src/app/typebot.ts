import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class TypebotService {
  private platformId = inject(PLATFORM_ID);
  private typebotModule: typeof import('@typebot.io/js') | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  async initChatbot(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const typebot = await import('@typebot.io/js');
        this.typebotModule = typebot;

        const initFn = typebot.default?.initBubble || typebot.initBubble;
        if (typeof initFn === 'function') {
          initFn({
            typebot: 'lead-generation-14pfxu6',
            previewMessage: {
              message: 'I have a question for you!',
            },
            theme: {
              placement: 'right',
              button: {
                backgroundColor: '#1D1D1D',
                customIconSrc:
                  'https://s3.typebotstorage.com/public/workspaces/cmsj91idd00000ai1l144bags/typebots/pcgz6xaqcdhsj5qk414pfxu6/bubble-icon?v=1786146993938',
              },
            },
          });
          this.isInitialized = true;
          console.log('[TypebotService] Typebot bubble initialized successfully.');
        } else {
          console.warn('[TypebotService] initBubble function not found on Typebot SDK.');
        }
      } catch (err) {
        console.warn('[TypebotService] Could not initialize Typebot:', err);
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  async openChatbot(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      if (!this.isInitialized) {
        await this.initChatbot();
      }

      if (this.typebotModule) {
        const openFn = this.typebotModule.default?.open || this.typebotModule.open;
        if (typeof openFn === 'function') {
          openFn();
          return;
        }
      }

      const bubbleEl = document.querySelector('typebot-bubble');
      if (bubbleEl) {
        if (bubbleEl.shadowRoot) {
          const btn = bubbleEl.shadowRoot.querySelector('button');
          if (btn) {
            btn.click();
            return;
          }
        }
        (bubbleEl as HTMLElement).click();
        return;
      }

      // Final fallback if SDK exposes global window.Typebot
      const win = window as Window & { Typebot?: { open?: () => void } };
      if (win.Typebot && typeof win.Typebot.open === 'function') {
        win.Typebot.open();
      }
    } catch (err) {
      console.warn('[TypebotService] Error opening chatbot:', err);
    }
  }
}

