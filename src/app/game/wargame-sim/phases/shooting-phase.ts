import { IPhase } from "./i-phase";
import { PhaseManager } from "./phase-manager";
import { PhaseType } from "./phase-type";

export class ShootingPhase implements IPhase {
    private readonly _phaseMgr: PhaseManager;
    
    constructor(phaseManager: PhaseManager) {
        this._phaseMgr = phaseManager;
    }
    
    start(): IPhase {
        return this;
    }

    isComplete(): boolean {
        return false;
    }

    reset(): IPhase {
        return this;
    }

    getType(): PhaseType {
        return PhaseType.shooting;
    }

    getName(): string {
        return PhaseType[this.getType()];
    }
}
