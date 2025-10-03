import type { Textmodifier } from 'textmode.js';

export class PositionService {
  private readonly modifier: Textmodifier;
  private readonly overlay: HTMLElement;
  private animationFrameId: number | null = null;
  private readonly handleUpdate: () => void;
  private bound = false;

  constructor(modifier: Textmodifier, overlay: HTMLElement) {
    this.modifier = modifier;
    this.overlay = overlay;
    this.handleUpdate = () => this.scheduleUpdate();
  }

  scheduleUpdate(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = requestAnimationFrame(() => this.update());
  }

  bind(): void {
    if (this.bound) {
      return;
    }
    window.addEventListener('resize', this.handleUpdate);
    window.addEventListener('scroll', this.handleUpdate, true);
    this.bound = true;
    this.handleUpdate();
  }

  private update(): void {
    this.animationFrameId = null;
    const canvasRect = this.modifier.canvas.getBoundingClientRect();
    this.overlay.style.top = `${canvasRect.top + window.scrollY + 8}px`;
    this.overlay.style.left = `${canvasRect.left + window.scrollX + 8}px`;
  }

  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.bound) {
      window.removeEventListener('resize', this.handleUpdate);
      window.removeEventListener('scroll', this.handleUpdate, true);
      this.bound = false;
    }
  }
}
