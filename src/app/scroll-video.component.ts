<<<<<<< HEAD
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, PLATFORM_ID, inject, ChangeDetectionStrategy, NgZone, signal, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const MAX_CANVAS_DIMENSION = 2560;

=======
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, PLATFORM_ID, inject, ChangeDetectionStrategy, NgZone, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

>>>>>>> 9de23772c612ac3a5a2184a20491b8bb29bda5c2
@Component({
  selector: 'app-scroll-video',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'onResize()'
  },
  template: `
<<<<<<< HEAD
    <div class="fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden pointer-events-none select-none">
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
export class ScrollVideoComponent implements AfterViewInit, OnDestroy, OnInit {
=======
    <div class="fixed inset-0 z-0 overflow-hidden select-none bg-[#0a0a0a]">
      <canvas
        #canvas
        class="block h-full w-full object-cover transition-opacity duration-700"
        [class.opacity-100]="isLoaded()"
        [class.opacity-0]="!isLoaded()"
        aria-label="Hero background video"
      ></canvas>
      <div class="absolute inset-0 z-10 bg-gradient-to-b from-black/25 via-transparent to-black/40 pointer-events-none"></div>
    </div>
  `
})
export class ScrollVideoComponent implements AfterViewInit, OnDestroy {
>>>>>>> 9de23772c612ac3a5a2184a20491b8bb29bda5c2
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
<<<<<<< HEAD
  private allImagesFailed = false;

  ngOnInit() {
    // Initialize any component setup needed on change detection cycles
  }
=======
>>>>>>> 9de23772c612ac3a5a2184a20491b8bb29bda5c2

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

<<<<<<< HEAD
=======
    this.ensureCanvasDimensions();
>>>>>>> 9de23772c612ac3a5a2184a20491b8bb29bda5c2
    this.preloadImages();

    this.ngZone.runOutsideAngular(() => {
      this.startLoop();
    });
  }

  onResize() {
<<<<<<< HEAD
    this.lastDrawnIndex = -1;
    if (this.allImagesFailed) return;
=======
    this.ensureCanvasDimensions();
    this.lastDrawnIndex = -1;

>>>>>>> 9de23772c612ac3a5a2184a20491b8bb29bda5c2
    const currentImg = this.getBestLoadedImage(this.getCurrentFrameIndex());
    if (currentImg) {
      this.drawFrame(currentImg);
    }
  }

<<<<<<< HEAD
  private preloadImages() {
    // Multiple CDN fallbacks for hero images
    const cdnPaths = [
      // Primary: Cloudinary
      `https://res.cloudinary.com/hw31kdln/image/upload/v1785472879/images-hero/${i}.webp`,
      // Secondary: Higgs AI
      `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260728_050334_5b076e26-0ce7-4898-b432-d764190e448f.png&w=1280&q=85`,
      // Tertiary: Local assets
      `./assets/images-hero/${i}.webp`
    ];

    let initialFrameDrawn = false;
    let totalLoadErrors = 0;

    for (let i = 1; i <= this.totalFrames; i++) {
      const img = new Image();
      let triedPaths: string[] = [];

      // Try each path in order, stopping at the first success
      for (const path of cdnPaths) {
        triedPaths.push(path);
        img.src = path;

        // Wait for onload/onerror before trying next path
        const loadHandler = () => {
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

        const errorHandler = () => {
          totalLoadErrors++;
          // Try the next path
          const nextIndex = cdnPaths.indexOf(path) + 1;
          if (nextIndex < cdnPaths.length) {
            img.src = cdnPaths[nextIndex];
          }
        };

        img.onload = () => {
          loadHandler();
        };
        img.onerror = () => {
          errorHandler();
        };

        // Check if already cached/completed synchronously
        if (img.complete && img.naturalWidth > 0) {
          this.loadedCount.update(c => c + 1);
          if (i === 1 && !initialFrameDrawn) {
            initialFrameDrawn = true;
            this.isLoaded.set(true);
            this.drawFrame(img);
          }
          // Stop trying other paths since this one loaded
          break;
        }
      }

      this.images.push(img);
    }

    // If ALL images failed to load across all paths, mark for graceful degradation
    if (totalLoadErrors >= this.totalFrames * cdnPaths.length) {
      this.allImagesFailed = true;
=======
  private ensureCanvasDimensions() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.max(1, Math.floor((canvas.clientWidth || window.innerWidth) * dpr));
    const targetH = Math.max(1, Math.floor((canvas.clientHeight || window.innerHeight) * dpr));

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    canvas.style.width = '100%';
    canvas.style.height = '100%';
  }

  private forceFrameOneRender() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const renderFallback = (img: HTMLImageElement) => {
      this.images[0] = img;
      this.isLoaded.set(true);
      this.drawFrame(img);
    };

    const primary = new Image();
    primary.decoding = 'async';
    primary.onload = () => renderFallback(primary);
    primary.onerror = () => {
      const fallback = new Image();
      fallback.decoding = 'async';
      fallback.onload = () => renderFallback(fallback);
      fallback.onerror = () => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.isLoaded.set(true);
      };
      fallback.src = './images/images-hero/1.webp';
    };
    primary.src = './assets/images-hero/1.webp';
  }

  private preloadImages() {
    this.images = new Array(this.totalFrames);
    let firstFrameRendered = false;

    const renderInitialFrame = (img: HTMLImageElement) => {
      if (firstFrameRendered) return;
      firstFrameRendered = true;
      this.ensureCanvasDimensions();
      this.isLoaded.set(true);
      this.drawFrame(img);
    };

    for (let i = 1; i <= this.totalFrames; i++) {
      const primaryPath = `./images/images-hero/${i}.webp`;
      const fallbackPath = `./assets/images-hero/${i}.webp`;

      const img = new Image();
      img.decoding = 'async';

      img.onload = () => {
        this.loadedCount.update(c => c + 1);
        this.images[i - 1] = img;

        if (i === 1 || !firstFrameRendered) {
          renderInitialFrame(img);
        }
      };

      img.onerror = () => {
        const backup = new Image();
        backup.decoding = 'async';

        backup.onload = () => {
          this.loadedCount.update(c => c + 1);
          this.images[i - 1] = backup;

          if (i === 1 || !firstFrameRendered) {
            renderInitialFrame(backup);
          }
        };

        backup.onerror = () => {
          if (i === 1 && !firstFrameRendered) {
            this.forceFrameOneRender();
          }
        };

        backup.src = fallbackPath;
      };

      if (img.complete && img.naturalWidth > 0) {
        this.loadedCount.update(c => c + 1);
        this.images[i - 1] = img;
        if (i === 1 || !firstFrameRendered) {
          renderInitialFrame(img);
        }
      } else {
        img.src = primaryPath;
      }
>>>>>>> 9de23772c612ac3a5a2184a20491b8bb29bda5c2
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

<<<<<<< HEAD
    // 1. Try preferred index
=======
>>>>>>> 9de23772c612ac3a5a2184a20491b8bb29bda5c2
    const target = this.images[preferredIndex];
    if (target && target.complete && target.naturalWidth > 0) {
      return target;
    }

<<<<<<< HEAD
    // 2. Search nearest loaded neighbor
=======
>>>>>>> 9de23772c612ac3a5a2184a20491b8bb29bda5c2
    for (let offset = 1; offset < this.totalFrames; offset++) {
      const prev = this.images[preferredIndex - offset];
      if (prev && prev.complete && prev.naturalWidth > 0) return prev;

      const next = this.images[preferredIndex + offset];
      if (next && next.complete && next.naturalWidth > 0) return next;
    }

<<<<<<< HEAD
    // 3. Fallback to first frame if available
=======
>>>>>>> 9de23772c612ac3a5a2184a20491b8bb29bda5c2
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
<<<<<<< HEAD

    // Smooth Lerp animation loop
=======
>>>>>>> 9de23772c612ac3a5a2184a20491b8bb29bda5c2
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

<<<<<<< HEAD
    // Ensure fallback dimensions if layout pass hasn't completed rect values
    const targetW = Math.floor((rect.width || window.innerWidth) * dpr);
    const targetH = Math.floor((rect.height || window.innerHeight) * dpr);

    // Size patch: clamp to MAX_CANVAS_DIMENSION to prevent oversized canvases on high-DPI displays
    const maxW = Math.min(targetW, MAX_CANVAS_DIMENSION * dpr);
    const maxH = Math.min(targetH, MAX_CANVAS_DIMENSION * dpr);

    if (maxW === 0 || maxH === 0) return false;

    if (canvas.width !== maxW || canvas.height !== maxH) {
      canvas.width = maxW;
      canvas.height = maxH;
=======
    const targetW = Math.max(1, Math.floor((rect.width || window.innerWidth || canvas.clientWidth) * dpr));
    const targetH = Math.max(1, Math.floor((rect.height || window.innerHeight || canvas.clientHeight) * dpr));

    if (targetW === 0 || targetH === 0) return false;

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
>>>>>>> 9de23772c612ac3a5a2184a20491b8bb29bda5c2
    }
    return true;
  }

  drawFrame(img: HTMLImageElement) {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
<<<<<<< HEAD
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!img.complete || img.naturalWidth === 0) return;
=======

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!img || !img.complete || img.naturalWidth === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }
>>>>>>> 9de23772c612ac3a5a2184a20491b8bb29bda5c2

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

<<<<<<< HEAD
    // object-cover logic
=======
>>>>>>> 9de23772c612ac3a5a2184a20491b8bb29bda5c2
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
