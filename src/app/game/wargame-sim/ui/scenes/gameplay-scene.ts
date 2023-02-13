import { environment } from "src/environments/environment";
import { InputController } from "../controllers/input-controller";
import { KBMController } from "../controllers/kbm-controller";
import { WarGame } from "../../war-game";
import { OverlaySceneConfig } from "./overlay-scene";
import { GameBoard } from "../game-board/game-board";
import { IPlayer } from "../../players/i-player";
import { UiPlayer } from "../players/ui-player";
import { PlayerSpritesheetMapping } from "../players/player-spritesheet-mappings";
import { Logging } from "../../utils/logging";
import { GameMapTile } from "../../terrain/game-map-tile";

export const GameplaySceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'gameplay-scene'
} as const;

export class GameplayScene extends Phaser.Scene {
    private _controller: InputController;
    private _board: GameBoard;
    private _playerSprites = new Map<string, UiPlayer>(); // player.id to sprite mapping
    
    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || GameplaySceneConfig);
    }

    preload(): void {
        this.load.image('map-tiles', `${environment.baseUrl}/assets/tiles/ground-tiles.png`);
        this.load.image('border-tiles', `${environment.baseUrl}/assets/tiles/metaltiles.png`);
        this.load.spritesheet('players', `${environment.baseUrl}/assets/sprites/player/sprite.png`, {
            frameWidth: 32,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 96
        }); // 12w by 8h
    }

    create(): void {
        this._board = new GameBoard(this, WarGame.terrainMgr, WarGame.teamMgr);
        this._setupCamera();
        this._setupController();
        this._setupWarGameEventHandling();

        this.game.scene.start(OverlaySceneConfig.key);
        this.game.scene.bringToTop(OverlaySceneConfig.key);

        WarGame.phaseMgr.startCurrentPhase();
    }

    update(time: number, delta: number): void {
        this._controller.update(time, delta);
    }

    private _setupCamera(): void {
        this.cameras.main.setBackgroundColor(0x0066ff);
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(0, 0);
    }

    private _setupController(): void {
        this._controller = new KBMController(this, {gameboard: this._board});
    }

    private _setupWarGameEventHandling(): void {
        const owner = GameplaySceneConfig.key;
        const condition = () => this.game.scene.isActive(this);
        WarGame.evtMgr
            .subscribe(owner, WarGame.EVENTS.PLAYER_MOVED, (p: IPlayer) => this._handlePlayerMove(p), condition)
            .subscribe(owner, WarGame.EVENTS.PLAYER_REMOVED, (p: IPlayer) => this._handlePlayerRemoved(p), condition)
            .subscribe(owner, WarGame.EVENTS.PLAYER_DIED, (p: IPlayer) => this._handlePlayerDeath(p), condition)
            .subscribe(owner, WarGame.EVENTS.HIGHLIGHT_TILES, (...tiles: Array<GameMapTile>) => this._handleHighlightTiles(...tiles), condition)
            .subscribe(owner, WarGame.EVENTS.UNHIGHLIGHT_TILES, (...tiles: Array<GameMapTile>) => this._handleUnhighlightTiles(...tiles), condition);
    }

    private _handlePlayerMove(player: IPlayer): void {
        // get world location for tileXY
        const worldXY = this._board.getWorldXYFromTileXY(player.tileXY);
        const spriteContainer = this._playerSprites.get(player.id);
        if (spriteContainer) {
            this.tweens.add({
                targets: spriteContainer,
                x: worldXY.x + 16,
                y: worldXY.y + 16,
                duration: 500
            });
        } else {
            // create UiPlayer (placement phase)
            let mapping: PlayerSpritesheetMapping;
            switch(player.name) {
                case 'basic':
                    mapping = PlayerSpritesheetMapping.basic;
                    break;
                case 'heavy':
                    mapping = PlayerSpritesheetMapping.heavy;
                    break;
                case 'hero':
                    mapping = PlayerSpritesheetMapping.hero;
                    break;
                case 'light':
                    mapping = PlayerSpritesheetMapping.light;
                    break;
                default:
                    Logging.log('warn', 'invalid player name of', player.name, 'provided');
                    break;
            }
            this._playerSprites.set(player.id, new UiPlayer(this, {
                spriteMapping: mapping,
                playerId: player.id,
                x: worldXY.x,
                y: worldXY.y
            }));
        }
    }

    private _handlePlayerRemoved(player: IPlayer): void {
        const spriteContainer = this._playerSprites.get(player.id);
        if (spriteContainer) {
            spriteContainer.destroy();
            this._playerSprites.delete(player.id);
        }
    }

    private _handlePlayerDeath(player: IPlayer): void {
        const spriteContainer = this._playerSprites.get(player.id);
        if (spriteContainer) {
            this.tweens.add({
                targets: spriteContainer,
                angle: 90,
                duration: 500,
                onComplete: () => {
                    // TODO: play sound effect
                    this.tweens.add({
                        targets: spriteContainer,
                        alpha: 0,
                        duration: 500,
                        onComplete: () => WarGame.playerMgr.removePlayer(player)
                    });
                }
            });
        }
    }

    private _handleHighlightTiles(...tiles: Array<GameMapTile>): void {
        for (let tile of tiles) {
            const boardTile = this._board.groundLayer.getTileAt(tile.xy.x, tile.xy.y);
            if (boardTile) {
                boardTile.alpha = 0.5;
            }
        }
    }

    private _handleUnhighlightTiles(...tiles: Array<GameMapTile>): void {
        for (let tile of tiles) {
            const boardTile = this._board.groundLayer.getTileAt(tile.xy.x, tile.xy.y);
            if (boardTile) {
                boardTile.alpha = 1;
            }
        }
    }
}