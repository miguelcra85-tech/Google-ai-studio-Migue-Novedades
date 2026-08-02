import { Directive, ElementRef, Input, OnInit, OnDestroy, PLATFORM_ID, inject, Renderer2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appReveal]',
  standalone: true
})
export class RevealDirective implements OnInit, OnDestroy {
  @Input('appReveal') delay: number | string = 0;
  private observer: IntersectionObserver | null = null;
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    this.renderer.addClass(this.el.nativeElement, 'translate-y-8');
    this.renderer.addClass(this.el.nativeElement, 'opacity-0');
    this.renderer.addClass(this.el.nativeElement, 'transition-all');
    this.renderer.addClass(this.el.nativeElement, 'duration-700');
    this.renderer.addClass(this.el.nativeElement, 'ease-out');
    this.renderer.addClass(this.el.nativeElement, 'will-change-transform');
    
    if (this.delay) {
      this.renderer.setStyle(this.el.nativeElement, 'transition-delay', `${this.delay}ms`);
    }

    if (isPlatformBrowser(this.platformId)) {
      this.observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          this.renderer.removeClass(this.el.nativeElement, 'translate-y-8');
          this.renderer.removeClass(this.el.nativeElement, 'opacity-0');
          this.renderer.addClass(this.el.nativeElement, 'translate-y-0');
          this.renderer.addClass(this.el.nativeElement, 'opacity-100');
          this.observer?.disconnect();
        }
      }, { threshold: 0.15 });
      
      this.observer.observe(this.el.nativeElement);
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
