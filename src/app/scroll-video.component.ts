import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, PLATFORM_ID, inject, ChangeDetectionStrategy, NgZone, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-scroll-video',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'onResize()'
  },
  template: `
    <div class="fixed inset-0 z-0 bg-black overflow-hidden pointer-events-none select-none">
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
    const currentImg = this.getCurrentImage();
    if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
      this.drawFrame(currentImg);
    }
  }

  private preloadImages() {
    for (let i = 1; i <= this.totalFrames; i++) {
      const img = new Image();
      img.src = `images/images-hero/${i}.webp`;
      img.onload = () => {
        if (i === 1) {
          this.isLoaded.set(true);
          this.drawFrame(img);
        }
      };
      if (img.complete && i === 1 && img.naturalWidth > 0) {
        this.isLoaded.set(true);
        this.drawFrame(img);
      }
      this.images.push(img);
    }
  }

  private getCurrentImage(): HTMLImageElement | null {
    if (this.images.length === 0) return null;
    const frameIndex = Math.min(
      this.totalFrames - 1,
      Math.max(0, Math.floor(this.smoothedProgress * (this.totalFrames - 1)))
    );
    return this.images[frameIndex] || this.images[0] || null;
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

    const frameIndex = Math.min(
      this.totalFrames - 1,
      Math.max(0, Math.floor(this.smoothedProgress * (this.totalFrames - 1)))
    );

    const img = this.images[frameIndex];
    if (img && img.complete && img.naturalWidth > 0) {
      if (frameIndex !== this.lastDrawnIndex) {
        this.drawFrame(img);
        this.lastDrawnIndex = frameIndex;
        if (!this.isLoaded()) {
          this.isLoaded.set(true);
        }
      }
    }
  }

  private updateCanvasDimensions(canvas: HTMLCanvasElement) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const targetW = Math.floor(rect.width * dpr);
    const targetH = Math.floor(rect.height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
  }

  drawFrame(img: HTMLImageElement) {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.updateCanvasDimensions(canvas);

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    if (!canvasWidth || !canvasHeight) return;

    const imgWidth = img.naturalWidth || img.width;
    const imgHeight = img.naturalHeight || img.height;
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
