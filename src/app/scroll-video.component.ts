import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, PLATFORM_ID, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-scroll-video',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden pointer-events-none">
      <video 
        #video 
        muted 
        playsInline 
        preload="auto" 
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        [class.opacity-0]="canvasReady()"
        src="https://res.cloudinary.com/hw31kdln/video/upload/v1785620666/hf_20260729_102822_0e6c87e8-c141-4744-bf32-ad30db296371_dfxz88.mp4"
      ></video>
      <canvas 
        #canvas 
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-0"
        [class.opacity-100]="canvasReady()"
      ></canvas>
    </div>
  `
})
export class ScrollVideoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  videoReady = signal(false);
  canvasReady = signal(false);

  private platformId = inject(PLATFORM_ID);
  private frames: ImageBitmap[] = [];
  private rAFId = 0;
  private smoothedProgress = 0;
  private lastSeekTime = 0;
  
  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const video = this.videoRef.nativeElement;
    
    video.addEventListener('loadeddata', () => {
      this.videoReady.set(true);
      
      // Delay extraction slightly to let the browser breathe and render the first frame
      setTimeout(() => {
        this.extractFrames(video.src);
      }, 300);
    });

    this.startLoop();
  }
  
  async extractFrames(url: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const offscreenVideo = document.createElement('video');
      offscreenVideo.muted = true;
      offscreenVideo.playsInline = true;
      offscreenVideo.crossOrigin = "anonymous";
      offscreenVideo.src = url;
      
      await new Promise(r => {
        offscreenVideo.addEventListener('loadeddata', r, { once: true });
      });
      
      const duration = offscreenVideo.duration || 5;
      const frameCount = Math.max(24, Math.min(90, Math.floor(duration * 12)));
      const timeStep = duration / frameCount;
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      // Max width 960 to save memory
      let w = offscreenVideo.videoWidth;
      let h = offscreenVideo.videoHeight;
      if (w > 960) {
        h = Math.floor(h * (960 / w));
        w = 960;
      }
      canvas.width = w;
      canvas.height = h;

      for (let i = 0; i < frameCount; i++) {
        offscreenVideo.currentTime = i * timeStep;
        await new Promise(r => {
          offscreenVideo.addEventListener('seeked', r, { once: true });
        });
        ctx.drawImage(offscreenVideo, 0, 0, w, h);
        const bitmap = await createImageBitmap(canvas);
        this.frames.push(bitmap);
      }
      this.canvasReady.set(true);
    } catch (e) {
      console.error("Frame extraction failed", e);
    }
  }

  startLoop() {
    const loop = () => {
      this.rAFId = requestAnimationFrame(loop);
      this.update();
    };
    this.rAFId = requestAnimationFrame(loop);
  }

  update() {
    const scrollY = window.scrollY;
    const scrollHeight = document.body.scrollHeight;
    const innerHeight = window.innerHeight;
    
    let targetProgress = 0;
    if (scrollHeight > innerHeight) {
      targetProgress = scrollY / (scrollHeight - innerHeight);
    }
    targetProgress = Math.max(0, Math.min(1, targetProgress));
    
    // Smooth easing
    this.smoothedProgress += (targetProgress - this.smoothedProgress) * 0.12;
    
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
      // Fallback: Seek visible video if canvas not ready
      const video = this.videoRef.nativeElement;
      if (video.duration) {
        const targetTime = this.smoothedProgress * (video.duration - 0.05);
        if (Math.abs(video.currentTime - targetTime) > 0.04 && Math.abs(this.lastSeekTime - targetTime) > 0.04) {
          video.currentTime = targetTime;
          this.lastSeekTime = targetTime;
        }
      }
    }
  }

  drawFrame(img: ImageBitmap) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    }
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight, x, y;

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
    if (this.rAFId) {
      cancelAnimationFrame(this.rAFId);
    }
  }
}
