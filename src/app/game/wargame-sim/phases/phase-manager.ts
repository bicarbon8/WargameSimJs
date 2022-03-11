import * as Phaser from "phaser";
import { TeamManager } from "../teams/team-manager";
import { FightingPhase } from "./fighting-phase";
import { IPhase } from "./i-phase";
import { MovementPhase } from "./movement-phase";
import { PriorityPhase } from "./priority-phase";
import { ShootingPhase } from "./shooting-phase";

export class PhaseManager extends Phaser.Events.EventEmitter {
    private readonly _phases: IPhase[];
    private _phaseIndex: number = 0;

    constructor(teamManager: TeamManager) {
        super();
        this._phases = [
            new PriorityPhase(this, teamManager), 
            new MovementPhase(this), 
            new ShootingPhase(this), 
            new FightingPhase(this)
        ];
    }

    get phases(): IPhase[] {
        return this._phases;
    }

    get currentPhase(): IPhase {
        return this._phases[this._phaseIndex];
    }

    startCurrentPhase(): void {
        this.currentPhase.start();
    }

    moveToNextPhase(): void {
        this._phaseIndex++;
        if (this._phaseIndex >= this._phases.length) {
            this._phaseIndex = 0;
        }
    }
}
