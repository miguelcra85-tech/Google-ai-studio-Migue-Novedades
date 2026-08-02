import { Component, ElementRef, ViewChild, ChangeDetectionStrategy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { animate } from 'motion';

@Component({
  selector: 'app-expandable-robot-video',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      #container
      class="rounded-2xl border border-white/20 bg-white/5 overflow-hidden relative cursor-pointer flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)] origin-left z-[60]"
      style="width: 160px; height: 96px;"
      (mouseenter)="onHover()"
    >
      <video 
        #video
        src="https://res.cloudinary.com/hw31kdln/video/upload/v1785619508/Robot_transforming_with_fiber_op__202607301315_csjdmm.mp4"
        class="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-90"
        muted playsInline
        (ended)="onVideoEnded()"
      ></video>
      
      <div #iconContainer class="absolute z-20 flex items-center justify-center pointer-events-none transition-opacity duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/80 drop-shadow-lg"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </div>
    </div>
  `
})
export class ExpandableRobotVideoComponent {
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('iconContainer') iconRef!: ElementRef<HTMLDivElement>;
  
  private isAnimating = false;
  private isExpanded = false;
  private platformId = inject(PLATFORM_ID);

  onHover() {
    if (this.isAnimating || this.isExpanded || !isPlatformBrowser(this.platformId)) return;
    this.isAnimating = true;
    this.isExpanded = true;
    
    // Ensure video is ready and play it
    this.videoRef.nativeElement.currentTime = 0;
    this.videoRef.nativeElement.play().catch(() => {});
    this.iconRef.nativeElement.style.opacity = '0';

    // Expand and hold
    animate(
      this.containerRef.nativeElement,
      {
        width: "320px",
        scale: 1.15,
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "rgba(59, 130, 246, 0.7)"
      },
      {
        duration: 0.6,
        ease: "easeOut"
      }
    ).finished.then(() => {
      this.isAnimating = false;
    });
  }

  onVideoEnded() {
    if (!this.isExpanded) return;
    this.isAnimating = true;
    
    // Shrink animation back
    animate(
      this.containerRef.nativeElement,
      {
        width: "160px",
        scale: 1,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderColor: "rgba(255, 255, 255, 0.2)"
      },
      {
        duration: 0.6,
        ease: "easeIn"
      }
    ).finished.then(() => {
      this.isAnimating = false;
      this.isExpanded = false;
      this.iconRef.nativeElement.style.opacity = '1';
    });
  }
}
