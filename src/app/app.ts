import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {ScrollVideoComponent} from './scroll-video.component';
import {RevealDirective} from './reveal.directive';
import {WobbleDirective} from './wobble.directive';
import {ExpandableRobotVideoComponent} from './expandable-robot-video.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [ScrollVideoComponent, RevealDirective, WobbleDirective, ExpandableRobotVideoComponent],
  templateUrl: './app.html',
})
export class App {
  isMobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  openTypebot(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    const win = window as Window & {
      openTypebot?: (e?: Event) => void;
      typebotInstance?: { open?: () => void };
      Typebot?: { open?: () => void };
    };
    if (typeof win.openTypebot === 'function') {
      win.openTypebot(event);
    } else if (win.typebotInstance && typeof win.typebotInstance.open === 'function') {
      win.typebotInstance.open();
    } else if (win.Typebot && typeof win.Typebot.open === 'function') {
      win.Typebot.open();
    } else {
      const bubbleEl = document.querySelector('typebot-bubble');
      if (bubbleEl) {
        if (bubbleEl.shadowRoot) {
          const btn = bubbleEl.shadowRoot.querySelector('button');
          if (btn) btn.click();
        } else {
          (bubbleEl as HTMLElement).click();
        }
      }
    }
  }
}
