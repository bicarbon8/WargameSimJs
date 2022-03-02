import { GameMap } from "./map/game-map";
import { PhaseManager } from "./phases/phase-manager";
import { PlayerManager } from "./players/player-manager";
import { TeamManager } from "./teams/team-manager";
import { UIManager } from "./ui/ui-manager";
import { DiceManager } from "./utils/dice-manager";
import { WarGameOptions } from "./war-game-options";

export module WarGame {
    export var map: GameMap;
    export var players: PlayerManager;
    export var teams: TeamManager;
    export var phases: PhaseManager;
    export var ui: UIManager;
    export var dice: DiceManager;

    export function start(options?: WarGameOptions): void {
        dice = new DiceManager();
        players = new PlayerManager();
        teams = new TeamManager();
        phases = new PhaseManager();
        ui = new UIManager(options?.uiMgrOpts);
    }

    export function stop(): void {
        ui.destroy();
        ui = null;
        phases = null;
        players = null;
        teams = null;
        dice = null;
    }
}