import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, PLATFORM_ID, inject, ChangeDetectionStrategy, NgZone, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-scroll-video',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-0 bg-black overflow-hidden pointer-events-none select-none">
      <video 
        #video 
        muted 
        playsinline 
        preload="auto" 
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        [class.opacity-0]="canvasReady()"
        [class.opacity-100]="!canvasReady()"
        src="https://res.cloudinary.com/hw31kdln/video/upload/v1785620666/hf_20260729_102822_0e6c87e8-c141-4744-bf32-ad30db296371_dfxz88.mp4"
        (loadeddata)="onVideoLoaded()"
      ></video>
      <canvas 
        #canvas 
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-0"
        [class.opacity-100]="canvasReady()"
      ></canvas>
      <div class="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40 pointer-events-none z-10"></div>
    </div>
  `
})
export class ScrollVideoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  canvasReady = signal(false);
  videoReady = signal(false);

  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  private frames: ImageBitmap[] = [];
  private rAFId: number | null = null;
  private targetProgress = 0;
  private smoothedProgress = 0;
  private lastSeekTime = -1;

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ngZone.runOutsideAngular(() => {
      this.startLoop();
    });
  }

  onVideoLoaded() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.videoReady.set(true);

    const video = this.videoRef?.nativeElement;
    if (video) {
      video.pause();
      // Wait 300ms after loadeddata before starting offscreen frame extraction
      setTimeout(() => {
        this.extractFrames(video.src);
      }, 300);
    }
  }

  private async extractFrames(url: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const offscreenVideo = document.createElement('video');
      offscreenVideo.muted = true;
      offscreenVideo.playsInline = true;
      offscreenVideo.crossOrigin = 'anonymous';
      offscreenVideo.src = url;

      await new Promise((resolve) => {
        offscreenVideo.addEventListener('loadeddata', resolve, { once: true });
      });

      const duration = offscreenVideo.duration || 5;
      const frameCount = Math.max(24, Math.min(90, Math.floor(duration * 12)));
      const timeStep = duration / frameCount;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      let w = offscreenVideo.videoWidth || 960;
      let h = offscreenVideo.videoHeight || 540;
      if (w > 960) {
        h = Math.floor(h * (960 / w));
        w = 960;
      }
      canvas.width = w;
      canvas.height = h;

      const extracted: ImageBitmap[] = [];
      for (let i = 0; i < frameCount; i++) {
        offscreenVideo.currentTime = i * timeStep;
        await new Promise((resolve) => {
          offscreenVideo.addEventListener('seeked', resolve, { once: true });
        });
        ctx.drawImage(offscreenVideo, 0, 0, w, h);
        const bitmap = await createImageBitmap(canvas);
        extracted.push(bitmap);
      }

      this.frames = extracted;
      this.canvasReady.set(true);
    } catch (err) {
      console.warn('Offscreen frame extraction skipped or failed:', err);
    }
  }

  private startLoop() {
    const loop = () => {
      this.update();
      this.rAFId = requestAnimationFrame(loop);
    };
    this.rAFId = requestAnimationFrame(loop);
  }

  private update() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const innerHeight = window.innerHeight;

    if (scrollHeight > innerHeight) {
      this.targetProgress = scrollY / (scrollHeight - innerHeight);
    } else {
      this.targetProgress = 0;
    }
    this.targetProgress = Math.max(0, Math.min(1, this.targetProgress));

    // Smoothed Lerp
    this.smoothedProgress += (this.targetProgress - this.smoothedProgress) * 0.12;

    if (this.canvasReady() && this.frames.length > 0) {
      const frameIndex = Math.min(
        this.frames.length - 1,
        Math.max(0, Math.floor(this.smoothedProgress * this.frames.length))
      );
      const frame = this.frames[frameIndex];
      if (frame) {
        this.drawFrame(frame);
      }
    } else if (this.videoReady()) {
      // Fallback: Seek visible video if canvas cache not ready
      const video = this.videoRef?.nativeElement;
      if (video && video.duration) {
        const targetTime = this.smoothedProgress * (video.duration - 0.05);
        if (
          Math.abs(video.currentTime - targetTime) > 0.04 &&
          Math.abs(this.lastSeekTime - targetTime) > 0.04
        ) {
          video.currentTime = Math.max(0, Math.min(video.duration, targetTime));
          this.lastSeekTime = targetTime;
        }
      }
    }
  }

  private drawFrame(img: ImageBitmap) {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const targetW = Math.floor(rect.width * dpr);
    const targetH = Math.floor(rect.height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    if (!canvasWidth || !canvasHeight) return;

    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth: number;
    let drawHeight: number;
    let x: number;
    let y: number;

    // object-cover logic
    if (canvasRatio > imgRatio) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      x = 0;
      y = (canvasHeight - drawHeight) / 2;
    } else {
      drawWidth = canvasHeight * imgRatio;
      drawHeight = canvasHeight;
      x = (canvasWidth - drawWidth) / 2;
      y = 0;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  }

  ngOnDestroy() {
    if (this.rAFId !== null) {
      cancelAnimationFrame(this.rAFId);
    }
    this.frames.forEach((f) => f.close());
    this.frames = [];
  }
}



