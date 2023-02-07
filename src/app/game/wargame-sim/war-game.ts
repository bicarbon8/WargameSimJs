import { PhaseManager } from "./phases/phase-manager";
import { PlayerManager } from "./players/player-manager";
import { PlayerOptions } from "./players/player-options";
import { PlayerSpritesheetMappings } from "./players/player-spritesheet-mappings";
import { TeamManager } from "./teams/team-manager";
import { UIManager } from "./ui/ui-manager";
import { DiceManager } from "./utils/dice-manager";
import { BattleManager } from "./battles/battle-manager";
import { WarGameOptions } from "./war-game-options";
import { MapManager } from "./map/map-manager";
import { GameEventManager } from "./utils/game-event-manager";

export module WarGame {
    export var playerMgr: PlayerManager;
    export var teamMgr: TeamManager;
    export var phaseMgr: PhaseManager;
    export var uiMgr: UIManager;
    export var dice: DiceManager;
    export var battleMgr: BattleManager;
    export var mapMgr: MapManager;
    export var evtMgr: GameEventManager;

    export function start(options?: WarGameOptions): void {
        evtMgr = new GameEventManager();
        dice = new DiceManager();
        playerMgr = new PlayerManager();
        teamMgr = new TeamManager(playerMgr);
        mapMgr = new MapManager(teamMgr);
        uiMgr = new UIManager(options?.uiMgrOpts);
        battleMgr = new BattleManager(teamMgr, uiMgr);
        phaseMgr = new PhaseManager(mapMgr, battleMgr);
        uiMgr.start();
    }

    export function stop(): void {
        uiMgr.destroy();
        uiMgr = null;
        phaseMgr = null;
        mapMgr = null;
        playerMgr = null;
        teamMgr = null;
        dice = null;
    }

    export function resize(): void {
        uiMgr?.resize();
    }

    export function width(): number {
        return uiMgr?.width || 0;
    }

    export function height(): number {
        return uiMgr?.height || 0;
    }

    export function removeAllListeners(): void {
        evtMgr?.unsubscribeAll();
    }

    export module TIMING {
        export const INPUT_HELD_DELAY: number = 100; // milliseconds
        export const CLICK_HANDLING_DELAY: number = 1000; // milliseconds
        export const CAMERA_SCROLL_SPEED: number = 5; // px per update
    }
    export module CONSTANTS {
        export const MAX_TEAMS: number = 9;
        export const MIN_TEAMS: number = 2;
        export const MIN_PLAYERS: number = 1;
        export const MAX_ZOOM: number = 4;
        export const MIN_ZOOM: number = 0.5;
    }
    export module DEPTH {
        export const BACKGROUND: number = 0;
        export const MIDGROUND: number = 1;
        export const PLAYER: number = 2;
        export const MENU: number = 3;
    }
    export module EVENTS {
        export const CAMERA_MOVE_START = 'camera-move-start';
        export const CAMERA_MOVE_END = 'camera-move-end';
        export const CAMERA_ZOOM = 'camera-zoom';
        export const PHASE_START = 'phase-start';
        export const PHASE_END = 'phase-end';
        export const TEAM_START = 'team-start';
        export const TEAM_END = 'team-end';
        export const TEAM_ADDED = 'team-added';
        export const TEAM_REMOVED = 'team-removed';
        export const TEAM_CHANGED = 'team-changed';
        export const PLAYER_ADDED = 'player-added';
        export const PLAYER_REMOVED = 'player-removed';
        export const PLAYER_DIED = 'player-died';
        export const PLAYER_MOVED = 'player-moved';
        export const PLAYER_FIRED_SHOT = 'player-fired-shot';
        export const PLAYER_MISFIRED_SHOT = 'player-misfired-shot';
        export const PLAYER_HIT_SHOT = 'player-hit-shot';
        export const PLAYER_MISSED_SHOT = 'player-missed-shot';
        export const MESSAGE = 'wargame-message';
    }
    export module PLAYERS {
        export const BASIC: PlayerOptions = {
            name: 'basic',
            spriteMapping: PlayerSpritesheetMappings.basic,
            stats: {
                mele: 3,
                ranged: 5,
                strength: 3,
                defense: 5,
                attacks: 1,
                wounds: 2,
                courage: 3,
                might: 0,
                will: 0,
                fate: 0,
                move: 5,
                shoot: 10,
                cost: 15
            }
        };
        export const HERO: PlayerOptions = {
            name: 'hero',
            spriteMapping: PlayerSpritesheetMappings.hero,
            stats: {
                mele: 6,
                ranged: 3,
                strength: 5,
                defense: 7,
                attacks: 2,
                wounds: 3,
                courage: 6,
                might: 2,
                will: 2,
                fate: 2,
                move: 6,
                shoot: 15,
                cost: 50
            }
        };
        export const LIGHT: PlayerOptions = {
            name: 'light',
            spriteMapping: PlayerSpritesheetMappings.light,
            stats: {
                mele: 1,
                ranged: 1,
                strength: 2,
                defense: 2,
                attacks: 1,
                wounds: 1,
                courage: 1,
                might: 0,
                will: 0,
                fate: 0,
                move: 7,
                shoot: 14,
                cost: 10
            }
        };
        export const HEAVY: PlayerOptions = {
            name: 'heavy',
            spriteMapping: PlayerSpritesheetMappings.heavy,
            stats: {
                mele: 5,
                ranged: 5,
                strength: 5,
                defense: 7,
                attacks: 1,
                wounds: 3,
                courage: 5,
                might: 1,
                will: 1,
                fate: 0,
                move: 3,
                shoot: 6,
                cost: 20
            }
        };
    }
}