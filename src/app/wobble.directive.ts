import { Directive, ElementRef, HostListener, inject, OnDestroy } from '@angular/core';
import { animate } from 'motion';

@Directive({
  selector: '[appWobble]',
  standalone: true
})
export class WobbleDirective implements OnDestroy {
  private el = inject(ElementRef);
  private animation: any = null;

  @HostListener('mouseenter')
  onMouseEnter() {
    this.animation = animate(
      this.el.nativeElement,
      {
        x: [0, 4, -3, 2, -2, 0],
        y: [0, -3, 4, -2, 2, 0],
        rotate: [0, 4, -4, 3, -2, 0],
        scale: [1, 1.01, 1.02, 1.01, 1.005, 1]
      },
      {
        duration: 4,
        ease: 'easeInOut',
        repeat: Infinity
      }
    );
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (this.animation) {
      this.animation.stop();
      animate(
        this.el.nativeElement,
        { x: 0, y: 0, rotate: 0, scale: 1 },
        { duration: 0.8, ease: 'easeOut' }
      );
    }
  }

  ngOnDestroy() {
    if (this.animation) {
      this.animation.stop();
    }
  }
}
