import { IPlayer } from "../players/i-player";
import { GameEventManager } from "../utils/game-event-manager";
import { WarGame } from "../war-game";
import { PhaseManager } from "./phase-manager";
import { PhaseType } from "./phase-type";

export abstract class AbstractPhase {
    readonly eventManger: GameEventManager;
    readonly phaseManager: PhaseManager;

    private _active: boolean;
    private _done: boolean;

    constructor(evtMgr: GameEventManager, phaseMgr: PhaseManager) {
        this.eventManger = evtMgr;
        this.phaseManager = phaseMgr;
    }

    get active(): boolean {
        return this._active;
    }

    get done(): boolean {
        return this._done;
    }

    start(): this {
        this._active = true;
        this.eventManger.notify(WarGame.EVENTS.PHASE_START, this);
        return this;
    }

    end(): this {
        this._active = false;
        this.eventManger.notify(WarGame.EVENTS.PHASE_END, this);
        return this;
    }

    abstract getType(): PhaseType;

    getName(): string {
        return PhaseType[this.getType()];
    }
}