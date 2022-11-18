import * as Phaser from "phaser";
import { BattleManager } from "../battles/battle-manager";
import { MapManager } from "../map/map-manager";
import { FightingPhase } from "./fighting-phase";
import { IPhase } from "./i-phase";
import { MovementPhase } from "./movement-phase";
import { PhaseType } from "./phase-type";
import { PlacementPhase } from "./placement-phase";
import { PriorityPhase } from "./priority-phase";
import { ShootingPhase } from "./shooting-phase";

export class PhaseManager extends Phaser.Events.EventEmitter {
    private readonly _phases: IPhase[];
    private _phaseIndex: number = 0;
    private _completedPlacement: boolean;

    constructor(mapManager: MapManager, battleManager: BattleManager) {
        super();
        this._completedPlacement = false;
        this._phases = [
            new PriorityPhase(this, mapManager.teamManager),
            new PlacementPhase(this, mapManager),
            new MovementPhase(this, mapManager), 
            new ShootingPhase(this, battleManager, mapManager), 
            new FightingPhase(this, battleManager, mapManager)
        ];
    }

    get phases(): IPhase[] {
        return this._phases;
    }

    get currentPhase(): IPhase {
        return this._phases[this._phaseIndex];
    }

    get priorityPhase(): PriorityPhase {
        return this._phases[PhaseType.priority] as PriorityPhase;
    }

    get placementPhase(): PlacementPhase {
        return this._phases[PhaseType.placement] as PlacementPhase;
    }

    get movementPhase(): MovementPhase {
        return this._phases[PhaseType.movement] as MovementPhase;
    }

    get shootingPhase(): ShootingPhase {
        return this._phases[PhaseType.shooting] as ShootingPhase;
    }

    get fightingPhase(): FightingPhase {
        return this._phases[PhaseType.fighting] as FightingPhase;
    }

    startCurrentPhase(): IPhase {
        return this.currentPhase.start();
    }

    moveToNextPhase(): IPhase {
        if (this._phaseIndex === PhaseType.placement) {
            this._completedPlacement = true;
        }
        this._phaseIndex++;
        if (this._phaseIndex === PhaseType.placement && this._completedPlacement) {
            this._phaseIndex++; // skip placement since it only happens once per game
        }
        if (this._phaseIndex >= this._phases.length) {
            this._phaseIndex = 0; // wrap back around to the beginning
        }
        return this.currentPhase;
    }

    reset(): IPhase {
        this._phaseIndex = 0;
        this._completedPlacement = false;
        this._phases.forEach((p: IPhase) => p.reset());
        return this.currentPhase;
    }
}
