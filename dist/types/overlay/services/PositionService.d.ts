import type { Textmodifier } from 'textmode.js';
export declare class PositionService {
    private readonly modifier;
    private readonly overlay;
    private animationFrameId;
    private readonly handleUpdate;
    private bound;
    constructor(modifier: Textmodifier, overlay: HTMLElement);
    scheduleUpdate(): void;
    bind(): void;
    private update;
    dispose(): void;
}
//# sourceMappingURL=PositionService.d.ts.map