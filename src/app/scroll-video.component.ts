import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, PLATFORM_ID, inject, ChangeDetectionStrategy, NgZone, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-scroll-video',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'onResize()'
  },
  template: `
    <div class="fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden pointer-events-none select-none">
      <!-- Instant poster fallback to guarantee no blank/black screen -->
      <img 
        src="./images/images-hero/1.webp" 
        alt="Hero Background Poster" 
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        [class.opacity-0]="isLoaded()"
        [class.opacity-100]="!isLoaded()"
      />
      <canvas 
        #canvas 
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        [class.opacity-100]="isLoaded()"
        [class.opacity-0]="!isLoaded()"
      ></canvas>
      <div class="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40 pointer-events-none z-10"></div>
    </div>
  `
})
export class ScrollVideoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly totalFrames = 120;
  isLoaded = signal(false);
  loadedCount = signal(0);

  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  private images: HTMLImageElement[] = [];
  private rAFId: number | null = null;
  private targetProgress = 0;
  private smoothedProgress = 0;
  private lastDrawnIndex = -1;

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.preloadImages();

    this.ngZone.runOutsideAngular(() => {
      this.startLoop();
    });
  }

  onResize() {
    this.lastDrawnIndex = -1;
    const currentImg = this.getBestLoadedImage(this.getCurrentFrameIndex());
    if (currentImg) {
      this.drawFrame(currentImg);
    }
  }

  private preloadImages() {
    let initialFrameDrawn = false;

    for (let i = 1; i <= this.totalFrames; i++) {
      const img = new Image();
      const primaryPath = `./images/images-hero/${i}.webp`;

      img.src = primaryPath;

      img.onload = () => {
        this.loadedCount.update(c => c + 1);

        // As soon as the first frame is loaded, render it immediately
        if (i === 1 && !initialFrameDrawn) {
          initialFrameDrawn = true;
          this.isLoaded.set(true);
          this.drawFrame(img);
        } else if (!initialFrameDrawn && img.naturalWidth > 0) {
          // If another early frame arrives before frame 1, paint it to eliminate blank canvas
          initialFrameDrawn = true;
          this.isLoaded.set(true);
          this.drawFrame(img);
        }
      };

      // Check if already cached/completed synchronously
      if (img.complete && img.naturalWidth > 0) {
        this.loadedCount.update(c => c + 1);
        if (i === 1 && !initialFrameDrawn) {
          initialFrameDrawn = true;
          this.isLoaded.set(true);
          this.drawFrame(img);
        }
      }

      this.images.push(img);
    }
  }

  private getCurrentFrameIndex(): number {
    return Math.min(
      this.totalFrames - 1,
      Math.max(0, Math.floor(this.smoothedProgress * (this.totalFrames - 1)))
    );
  }

  private getBestLoadedImage(preferredIndex: number): HTMLImageElement | null {
    if (this.images.length === 0) return null;

    // 1. Try preferred index
    const target = this.images[preferredIndex];
    if (target && target.complete && target.naturalWidth > 0) {
      return target;
    }

    // 2. Search nearest loaded neighbor
    for (let offset = 1; offset < this.totalFrames; offset++) {
      const prev = this.images[preferredIndex - offset];
      if (prev && prev.complete && prev.naturalWidth > 0) return prev;

      const next = this.images[preferredIndex + offset];
      if (next && next.complete && next.naturalWidth > 0) return next;
    }

    // 3. Fallback to first frame if available
    const first = this.images[0];
    if (first && first.complete && first.naturalWidth > 0) {
      return first;
    }

    return null;
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
    const maxScroll = Math.max(1, scrollHeight - innerHeight);

    this.targetProgress = Math.max(0, Math.min(1, scrollY / maxScroll));

    // Smooth Lerp animation loop
    this.smoothedProgress += (this.targetProgress - this.smoothedProgress) * 0.1;

    const frameIndex = this.getCurrentFrameIndex();
    const img = this.getBestLoadedImage(frameIndex);

    if (img && frameIndex !== this.lastDrawnIndex) {
      this.drawFrame(img);
      this.lastDrawnIndex = frameIndex;
      if (!this.isLoaded()) {
        this.isLoaded.set(true);
      }
    }
  }

  private updateCanvasDimensions(canvas: HTMLCanvasElement): boolean {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();

    // Ensure fallback dimensions if layout pass hasn't completed rect values
    const targetW = Math.floor((rect.width || window.innerWidth) * dpr);
    const targetH = Math.floor((rect.height || window.innerHeight) * dpr);

    if (targetW === 0 || targetH === 0) return false;

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    return true;
  }

  drawFrame(img: HTMLImageElement) {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!img.complete || img.naturalWidth === 0) return;

    this.updateCanvasDimensions(canvas);

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    if (!canvasWidth || !canvasHeight) return;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    if (!imgWidth || !imgHeight) return;

    const imgRatio = imgWidth / imgHeight;
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
    this.images = [];
  }
}
