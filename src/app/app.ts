import {ChangeDetectionStrategy, Component} from '@angular/core';
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
export class App {}
