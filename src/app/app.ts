import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {HeroComponent} from './hero.component';
import {RevealDirective} from './reveal.directive';
import {WobbleDirective} from './wobble.directive';
import {ExpandableRobotVideoComponent} from './expandable-robot-video.component';
import {TypebotService} from './typebot';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [HeroComponent, RevealDirective, WobbleDirective, ExpandableRobotVideoComponent],
  templateUrl: './app.html',
})
export class App implements OnInit {
  typebotService = inject(TypebotService);
  isMobileMenuOpen = signal(false);

  ngOnInit() {
    this.typebotService.initChatbot();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }
}
