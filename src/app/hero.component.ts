import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener,
  Inject, NgZone, OnDestroy, PLATFORM_ID, ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.component.html',
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly TOTAL_FRAMES = 120;
  private readonly BASE_PATH = '/images/images-hero';

  canvasReady = false;

  private ctx!: CanvasRenderingContext2D;
  private frames: (HTMLImageElement | undefined)[] = new Array(this.TOTAL_FRAMES);
  private targetFrame = 0;
  private drawnFrame = -1;
  private ticking = false;
  private rafId = 0;
  private dpr = 1;
  private lastW = 0;
  private destroyed = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  frameUrl(n: number): string {
    return `${this.BASE_PATH}/${n}.webp`;
  }

  async ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();

    await this.zone.runOutsideAngular(async () => {
      const first = await this.loadImage(1);
      if (this.destroyed || !first) {
        console.error('[Hero] No se pudo cargar el fotograma 1:', this.frameUrl(1));
        return;
      }
      this.frames[0] = first;
      this.draw(0);
      this.drawnFrame = 0;

      this.zone.run(() => {
        this.canvasReady = true;
        this.cdr.markForCheck();
      });

      window.addEventListener('scroll', this.onScroll, { passive: true });
      this.onScroll();

      await this.preloadRemaining();
    });
  }

  private loadImage(n: number): Promise<HTMLImageElement | null> {
    const img = new Image();
    img.src = this.frameUrl(n);
    return img.decode().then(() => img).catch(() => null);
  }

  private async preloadRemaining() {
    const BATCH = 8;
    for (let start = 2; start <= this.TOTAL_FRAMES; start += BATCH) {
      if (this.destroyed) return;
      const batch: Promise<void>[] = [];
      for (let n = start; n < start + BATCH && n <= this.TOTAL_FRAMES; n++) {
        batch.push(
          this.loadImage(n).then((img) => {
            if (img) this.frames[n - 1] = img;
          }),
        );
      }
      await Promise.all(batch);
      this.schedule();
    }
  }

  private onScroll = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0;
    this.targetFrame = Math.round(progress * (this.TOTAL_FRAMES - 1));
    this.schedule();
  };

  private schedule() {
    if (this.ticking || this.destroyed) return;
    this.ticking = true;
    this.rafId = requestAnimationFrame(this.render);
  }

  private render = () => {
    this.ticking = false;
    if (this.destroyed || this.drawnFrame === this.targetFrame) return;

    let idx = this.targetFrame;
    while (idx >= 0 && !this.frames[idx]) idx--;
    if (idx >= 0 && idx !== this.drawnFrame) {
      this.draw(idx);
      this.drawnFrame = idx;
    }
  };

  private draw(index: number) {
    const img = this.frames[index];
    if (!img) return;
    const canvas = this.canvasRef.nativeElement;
    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    this.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.lastW = window.innerWidth;
    canvas.width = Math.floor(window.innerWidth * this.dpr);
    canvas.height = Math.floor(window.innerHeight * this.dpr);
  }

  @HostListener('window:resize')
  onResize() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (window.innerWidth === this.lastW) return;
    this.resizeCanvas();
    const idx = this.drawnFrame;
    this.drawnFrame = -1;
    if (idx >= 0) this.draw(idx);
    this.drawnFrame = idx;
  }

  ngOnDestroy() {
    this.destroyed = true;
    if (isPlatformBrowser(this.platformId)) {
      cancelAnimationFrame(this.rafId);
      window.removeEventListener('scroll', this.onScroll);
    }
  }
}
