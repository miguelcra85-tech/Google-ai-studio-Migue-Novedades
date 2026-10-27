import { Component, ElementRef, ViewChild, ChangeDetectionStrategy, PLATFORM_ID, inject, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { animate } from 'motion';

@Component({
  selector: 'app-expandable-robot-video',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      #container
      tabindex="0"
      role="button"
      aria-label="Reproducir video de robot"
      class="rounded-2xl border border-white/20 bg-white/5 overflow-hidden relative cursor-pointer flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all duration-300 max-w-[calc(100vw-2.5rem)] focus:outline-none focus:ring-2 focus:ring-white/40"
      style="width: 180px; height: 104px;"
      (mouseenter)="onPlayRequest()"
      (click)="onPlayRequest()"
      (keydown.enter)="onPlayRequest()"
      (keydown.space)="onPlayRequest()"
    >
      <video 
        #video
        src="https://res.cloudinary.com/hw31kdln/video/upload/v1785619508/Robot_transforming_with_fiber_op__202607301315_csjdmm.mp4"
        class="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-90 transition-opacity duration-300"
        muted
        playsinline
        preload="auto"
        (ended)="onVideoEnded()"
      ></video>
      
      <div 
        #iconContainer 
        class="absolute z-20 flex items-center justify-center pointer-events-none transition-opacity duration-300 rounded-full bg-black/50 backdrop-blur-sm p-2.5 border border-white/30 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white drop-shadow-md translate-x-0.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </div>
    </div>
  `
})
export class ExpandableRobotVideoComponent implements AfterViewInit {
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('iconContainer') iconRef!: ElementRef<HTMLDivElement>;
  
  isExpanded = false;
  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const video = this.videoRef?.nativeElement;
    if (video) {
      video.muted = true;
      // Preload first frame cleanly
      video.currentTime = 0;
    }
  }

  onPlayRequest() {
    if (!isPlatformBrowser(this.platformId)) return;
    const video = this.videoRef?.nativeElement;
    
    if (!this.isExpanded) {
      this.expandAndPlay();
    } else if (video && video.paused) {
      video.muted = false;
      video.play().catch((err: unknown) => {
        console.warn('Video play prevented:', err);
      });
    }
  }

  private expandAndPlay() {
    this.isExpanded = true;
    const container = this.containerRef.nativeElement;
    const icon = this.iconRef.nativeElement;
    const video = this.videoRef.nativeElement;

    // Hide play icon
    icon.style.opacity = '0';

    // Unmute and play video with sound upon user interaction
    if (video) {
      video.muted = false;
      video.currentTime = 0;
      video.play().catch((err: unknown) => {
        console.warn('Video play with sound prevented:', err);
        // Fallback to muted if browser blocks unmuted audio
        video.muted = true;
        video.play().catch((mutedErr: unknown) => {
          console.warn('Muted video play also prevented:', mutedErr);
        });
      });
    }

    // Calculate responsive expanded width (longer rectangle, less tall)
    const targetWidth = Math.min(440, (window.innerWidth || 440) - 40);

    // Expand to wide cinematic rectangle
    animate(
      container,
      {
        width: `${targetWidth}px`,
        height: "140px",
        backgroundColor: "rgba(255, 255, 255, 0.12)",
        borderColor: "rgba(255, 255, 255, 0.4)"
      },
      {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    );
  }

  onVideoEnded() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.shrinkAndReset();
  }

  private shrinkAndReset() {
    this.isExpanded = false;
    const container = this.containerRef.nativeElement;
    const icon = this.iconRef.nativeElement;
    const video = this.videoRef.nativeElement;

    if (video) {
      video.pause();
      video.muted = true;
      video.currentTime = 0;
    }

    // Show icon again
    icon.style.opacity = '1';

    // Shrink animation back to original size
    animate(
      container,
      {
        width: "180px",
        height: "104px",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderColor: "rgba(255, 255, 255, 0.2)"
      },
      {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    );
  }
}

