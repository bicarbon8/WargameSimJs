import { FightingPhase } from "./fighting-phase";
import { IPhase } from "./i-phase";
import { MovementPhase } from "./movement-phase";
import { PriorityPhase } from "./priority-phase";
import { ShootingPhase } from "./shooting-phase";

export class PhaseManager {
    private readonly _phases: IPhase[];
    private _phaseIndex: number = 0;

    constructor() {
        this._phases = [
            new PriorityPhase(), 
            new MovementPhase(), 
            new ShootingPhase(), 
            new FightingPhase()
        ];
    }

    numberOfPhases(): number {
        return this._phases.length;
    }

    currentPhase(): IPhase {
        return this._phases[this._phaseIndex];
    }

    async runCurrentPhase(): Promise<void> {
        await this.currentPhase().runPhase();
    }

    moveToNextPhase(): void {
        this._phaseIndex++;
        if (this._phaseIndex >= this._phases.length) {
            this._phaseIndex = 0;
        }
    }
}
