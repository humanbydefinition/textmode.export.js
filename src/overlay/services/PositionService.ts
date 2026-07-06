import type { Textmodifier } from 'textmode.js';
import { overlayClasses } from '../utils/classes';
import { OverlayPositionStorage } from './OverlayPositionStorage';

const DEFAULT_OFFSET = 8;
const VIEWPORT_PADDING = 8;
const KEYBOARD_STEP = 8;
const KEYBOARD_LARGE_STEP = 32;

export interface OverlayPosition {
	mode: 'auto' | 'custom';
	offsetX: number;
	offsetY: number;
}

interface DragState {
	pointerId: number;
	startClientX: number;
	startClientY: number;
	startOffsetX: number;
	startOffsetY: number;
}

interface SetPositionOptions {
	persist?: boolean;
}

export class PositionService {
	private readonly modifier: Textmodifier;
	private readonly host: HTMLElement;
	private readonly surface: HTMLElement;
	private readonly storage: OverlayPositionStorage;
	private animationFrameId: number | null = null;
	private readonly handleUpdate: () => void;
	private bound = false;
	private dragHandle?: HTMLElement;
	private dragState?: DragState;
	private position: OverlayPosition;

	private readonly handlePointerDown = (event: PointerEvent) => this.onPointerDown(event);
	private readonly handlePointerMove = (event: PointerEvent) => this.onPointerMove(event);
	private readonly handlePointerUp = (event: PointerEvent) => this.onPointerUp(event);
	private readonly handleKeyDown = (event: KeyboardEvent) => this.onKeyDown(event);

	constructor(
		modifier: Textmodifier,
		host: HTMLElement,
		surface: HTMLElement = host,
		storage = new OverlayPositionStorage()
	) {
		this.modifier = modifier;
		this.host = host;
		this.surface = surface;
		this.storage = storage;
		this.handleUpdate = () => this.scheduleUpdate();

		const saved = this.storage.load();
		this.position = saved
			? { mode: 'custom', offsetX: saved.offsetX, offsetY: saved.offsetY }
			: { mode: 'auto', offsetX: DEFAULT_OFFSET, offsetY: DEFAULT_OFFSET };
	}

	getPosition(): Readonly<OverlayPosition> {
		return Object.freeze({ ...this.position });
	}

	setPosition(position: Pick<OverlayPosition, 'offsetX' | 'offsetY'>, options: SetPositionOptions = {}): void {
		if (!Number.isFinite(position.offsetX) || !Number.isFinite(position.offsetY)) {
			return;
		}
		this.position = {
			mode: 'custom',
			offsetX: position.offsetX,
			offsetY: position.offsetY,
		};
		this.scheduleUpdate();
		if (options.persist ?? true) {
			this.storage.save(this.position.offsetX, this.position.offsetY);
		}
	}

	resetPosition(): void {
		this.position = {
			mode: 'auto',
			offsetX: DEFAULT_OFFSET,
			offsetY: DEFAULT_OFFSET,
		};
		this.storage.clear();
		this.scheduleUpdate();
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

	attachDragHandle(handle: HTMLElement): void {
		if (this.dragHandle === handle) {
			return;
		}
		this.detachDragHandle();
		this.dragHandle = handle;
		handle.addEventListener('pointerdown', this.handlePointerDown);
		handle.addEventListener('keydown', this.handleKeyDown);
	}

	private detachDragHandle(): void {
		if (!this.dragHandle) {
			return;
		}
		this.dragHandle.removeEventListener('pointerdown', this.handlePointerDown);
		this.dragHandle.removeEventListener('keydown', this.handleKeyDown);
		this.dragHandle.removeEventListener('pointermove', this.handlePointerMove);
		this.dragHandle.removeEventListener('pointerup', this.handlePointerUp);
		this.dragHandle.removeEventListener('pointercancel', this.handlePointerUp);
		this.dragHandle = undefined;
		this.dragState = undefined;
		this.surface.classList.remove(overlayClasses.rootDragging);
	}

	private onPointerDown(event: PointerEvent): void {
		if (event.button !== 0 || !this.dragHandle) {
			return;
		}
		event.preventDefault();
		this.dragState = {
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startClientY: event.clientY,
			startOffsetX: this.position.offsetX,
			startOffsetY: this.position.offsetY,
		};
		this.surface.classList.add(overlayClasses.rootDragging);
		this.dragHandle.addEventListener('pointermove', this.handlePointerMove);
		this.dragHandle.addEventListener('pointerup', this.handlePointerUp);
		this.dragHandle.addEventListener('pointercancel', this.handlePointerUp);
		try {
			this.dragHandle.setPointerCapture?.(event.pointerId);
		} catch {
			// Pointer capture is an enhancement; dragging still works within the handle target in tests.
		}
	}

	private onPointerMove(event: PointerEvent): void {
		if (!this.dragState || event.pointerId !== this.dragState.pointerId) {
			return;
		}
		event.preventDefault();
		this.setPosition(
			{
				offsetX: this.dragState.startOffsetX + event.clientX - this.dragState.startClientX,
				offsetY: this.dragState.startOffsetY + event.clientY - this.dragState.startClientY,
			},
			{ persist: false }
		);
	}

	private onPointerUp(event: PointerEvent): void {
		if (!this.dragState || event.pointerId !== this.dragState.pointerId || !this.dragHandle) {
			return;
		}
		event.preventDefault();
		this.dragHandle.removeEventListener('pointermove', this.handlePointerMove);
		this.dragHandle.removeEventListener('pointerup', this.handlePointerUp);
		this.dragHandle.removeEventListener('pointercancel', this.handlePointerUp);
		try {
			if (this.dragHandle.hasPointerCapture?.(event.pointerId)) {
				this.dragHandle.releasePointerCapture?.(event.pointerId);
			}
		} catch {
			// Ignore capture release failures during pointer cancellation.
		}
		this.surface.classList.remove(overlayClasses.rootDragging);
		this.dragState = undefined;
		if (this.position.mode === 'custom') {
			this.storage.save(this.position.offsetX, this.position.offsetY);
		}
	}

	private onKeyDown(event: KeyboardEvent): void {
		const step = event.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;
		const position = this.position;

		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				this.setPosition({ offsetX: position.offsetX, offsetY: position.offsetY - step });
				break;
			case 'ArrowDown':
				event.preventDefault();
				this.setPosition({ offsetX: position.offsetX, offsetY: position.offsetY + step });
				break;
			case 'ArrowLeft':
				event.preventDefault();
				this.setPosition({ offsetX: position.offsetX - step, offsetY: position.offsetY });
				break;
			case 'ArrowRight':
				event.preventDefault();
				this.setPosition({ offsetX: position.offsetX + step, offsetY: position.offsetY });
				break;
			case 'Home':
				event.preventDefault();
				this.resetPosition();
				break;
			default:
				break;
		}
	}

	private update(): void {
		this.animationFrameId = null;
		const canvasRect = this.modifier.canvas.getBoundingClientRect();
		const next = this.clampToViewport(canvasRect, this.position.offsetX, this.position.offsetY);

		this.host.style.top = `${canvasRect.top + window.scrollY + next.offsetY}px`;
		this.host.style.left = `${canvasRect.left + window.scrollX + next.offsetX}px`;

		if (next.offsetX !== this.position.offsetX || next.offsetY !== this.position.offsetY) {
			this.position = {
				...this.position,
				offsetX: next.offsetX,
				offsetY: next.offsetY,
			};
			if (this.position.mode === 'custom') {
				this.storage.save(this.position.offsetX, this.position.offsetY);
			}
		}
	}

	private clampToViewport(
		canvasRect: DOMRect,
		offsetX: number,
		offsetY: number
	): Pick<OverlayPosition, 'offsetX' | 'offsetY'> {
		const surfaceRect = this.surface.getBoundingClientRect();
		const width = surfaceRect.width || this.host.getBoundingClientRect().width || 0;
		const height = surfaceRect.height || this.host.getBoundingClientRect().height || 0;
		const maxLeft = Math.max(VIEWPORT_PADDING, window.innerWidth - width - VIEWPORT_PADDING);
		const maxTop = Math.max(VIEWPORT_PADDING, window.innerHeight - height - VIEWPORT_PADDING);
		const viewportLeft = this.clamp(canvasRect.left + offsetX, VIEWPORT_PADDING, maxLeft);
		const viewportTop = this.clamp(canvasRect.top + offsetY, VIEWPORT_PADDING, maxTop);

		return {
			offsetX: viewportLeft - canvasRect.left,
			offsetY: viewportTop - canvasRect.top,
		};
	}

	private clamp(value: number, min: number, max: number): number {
		return Math.min(Math.max(value, min), max);
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
		this.detachDragHandle();
	}
}
