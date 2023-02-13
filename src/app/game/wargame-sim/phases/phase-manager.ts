import { BattleManager } from "../battles/battle-manager";
import { TerrainTileManager } from "../terrain/terrain-tile-manager";
import { FightingPhase } from "./fighting-phase";
import { AbstractPhase } from "./abstract-phase";
import { MovementPhase } from "./movement-phase";
import { PhaseType } from "./phase-type";
import { PlacementPhase } from "./placement-phase";
import { PriorityPhase } from "./priority-phase";
import { ShootingPhase } from "./shooting-phase";
import { GameEventManager } from "../utils/game-event-manager";
import { TeamManager } from "../teams/team-manager";

export class PhaseManager {
    private readonly _phases: AbstractPhase[];
    private _phaseIndex: number = 0;
    private _completedPlacement: boolean;

    constructor(evtMgr: GameEventManager, terrainMgr: TerrainTileManager, teamMgr: TeamManager, battleManager: BattleManager) {
        this._completedPlacement = false;
        this._phases = [
            new PriorityPhase(evtMgr, this, teamMgr),
            new PlacementPhase(evtMgr, this, terrainMgr, teamMgr),
            new MovementPhase(evtMgr, this, terrainMgr, teamMgr), 
            new ShootingPhase(evtMgr, this, battleManager, terrainMgr), 
            new FightingPhase(evtMgr, this, battleManager, terrainMgr)
        ];
    }

    get phases(): AbstractPhase[] {
        return this._phases;
    }

    get currentPhase(): AbstractPhase {
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

    startCurrentPhase(): AbstractPhase {
        return this.currentPhase.start();
    }

    moveToNextPhase(): AbstractPhase {
        if (this._phaseIndex === PhaseType.placement) {
            this._completedPlacement = true;
        }
        this._phaseIndex++;
        if (this._phaseIndex >= this._phases.length) {
            this._phaseIndex = 0; // wrap back around to the beginning
        }
        if (this._phaseIndex === PhaseType.placement && this._completedPlacement) {
            this._phaseIndex++; // skip placement since it only happens once per game
        }
        return this.currentPhase;
    }

    reset(): AbstractPhase {
        this._phaseIndex = 0;
        this._completedPlacement = false;
        return this.currentPhase;
    }
}
