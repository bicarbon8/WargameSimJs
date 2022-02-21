import { BattleManager } from "./battles/battle-manager";
import { WarGameMap } from "./map/war-game-map";
import { PhaseManager } from "./phases/phase-manager";
import { PlayerManager } from "./players/player-manager";
import { TeamManager } from "./teams/team-manager";
import { UIManager } from "./ui/ui-manager";
import { WarGameOptions } from "./war-game-options";

export module WarGame {
    var _map: WarGameMap;

    export function map(): WarGameMap {
        return this._map;
    }

    export function start(options?: WarGameOptions): void {
        UIManager.start(options?.uiMgrOpts);
    }

    export function stop(): void {
        UIManager.stop();
    }
}