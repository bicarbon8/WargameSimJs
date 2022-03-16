import { environment } from "src/environments/environment";
import { GameMap } from "../../map/game-map";
import { IPlayer } from "../../players/i-player";
import { Team } from "../../teams/team";
import { InputController } from "../controllers/input-controller";
import { KBMController } from "../controllers/kbm-controller";
import { WarGame } from "../../war-game";
import { HasGameObject } from "../../interfaces/has-game-object";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'gameplay-scene'
};

export class GameplayScene extends Phaser.Scene {
    private _controller: InputController;
    private _highlightedTiles: Phaser.Tilemaps.Tile[] = [];
    private _downTime: number = 0;
    private _placedTeamsCount: number = 0;
    
    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);
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
        this._createMap();
        this._setupCamera();
        this._setupController();

        WarGame.uiMgr.game.scene.start('overlay-scene');
        WarGame.uiMgr.game.scene.bringToTop('overlay-scene');
        
        this._startHandlingTeamPlacement();
        
        this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            let world: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            console.info(`screen: ${pointer.x.toFixed(0)},${pointer.y.toFixed(0)}; world: ${world.x.toFixed(0)},${world.y.toFixed(0)}; zoom: ${this.cameras.main.zoom.toFixed(1)}`);
        });
    }

    update(time: number, delta: number): void {
        this._controller.update(time, delta);
    }

    private _createMap(): void {
        const mult: number = WarGame.teamMgr.teams.length;
        WarGame.map = new GameMap({
            playerManager: WarGame.playerMgr,
            scene: this,
            width: mult * 20,
            height: mult * 20,
            roomMaxWidth: 20,
            roomMaxHeight: 20,
            roomMinWidth: 10,
            roomMinHeight: 10,
            maxRooms: mult,
            seed: 'bicarbon8',
            layerDepth: WarGame.DEPTH.PLAYER
        });
        WarGame.map.obj.setInteractive();
        console.info(`map width: ${WarGame.map.obj.width}, height: ${WarGame.map.obj.height}, position: ${WarGame.map.obj.x}, ${WarGame.map.obj.y}`);
    }

    private _clearHighlightedTiles(pointer?: Phaser.Input.Pointer): void {
        for (var i=0; i<this._highlightedTiles.length; i++) {
            let tile: Phaser.Tilemaps.Tile = this._highlightedTiles.shift();
            tile?.clearAlpha();
        }
    }

    private _startHandlingTeamPlacement(): void {
        WarGame.map.obj
        .on(Phaser.Input.Events.POINTER_MOVE, this._highlightTiles, this)
        .on(Phaser.Input.Events.POINTER_OUT, this._clearHighlightedTiles, this)
        .on(Phaser.Input.Events.POINTER_DOWN, this._placeTeam, this);
    }

    private _stopHandlingTeamPlacement(): void {
        WarGame.map.obj
        .off(Phaser.Input.Events.POINTER_MOVE, this._highlightTiles, this)
        .off(Phaser.Input.Events.POINTER_OUT, this._clearHighlightedTiles, this)
        .off(Phaser.Input.Events.POINTER_DOWN, this._placeTeam, this);
    }

    private _highlightTiles(pointer: Phaser.Input.Pointer): void {
        this._clearHighlightedTiles();
        let worldLoc: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        let pointerTile: Phaser.Tilemaps.Tile = WarGame.map.obj.getTileAtWorldXY(worldLoc.x, worldLoc.y);
        if (pointerTile) {
            let teamPlayers: IPlayer[] = WarGame.phaseMgr.priorityPhase.priorityTeam.getPlayers();
            let tiles: Phaser.Tilemaps.Tile[] = WarGame.map.getTilesInRange(pointerTile.x, pointerTile.y, (teamPlayers.length / 3) * 32)
                .filter((tile: Phaser.Tilemaps.Tile) => !WarGame.map.isTileOccupied(tile.x, tile.y));
            if (teamPlayers.length <= tiles.length) {
                this._highlightedTiles = this._highlightedTiles.concat(tiles);
                for (var i=0; i<this._highlightedTiles.length; i++) {
                    this._highlightedTiles[i].alpha = 0.5;
                }
            }
        }
    }

    private _placeTeam(pointer: Phaser.Input.Pointer): void {
        if (this.time.now > this._downTime + WarGame.TIMING.CLICK_HANDLING_DELAY) {
            this._downTime = this.time.now;
            let team: Team = WarGame.phaseMgr.priorityPhase.priorityTeam;
            const players: IPlayer[] = team.getPlayers();
            if (this._highlightedTiles.length >= players.length) {
                for (var i=0; i<this._highlightedTiles.length; i++) {
                    if (i>players.length) { break; }

                    let t: Phaser.Tilemaps.Tile = this._highlightedTiles[i];
                    let p: IPlayer = players[i];
                    if (p) {
                        (p as unknown as HasGameObject<Phaser.GameObjects.Sprite>).setScene(this);
                        WarGame.map.addPlayer(p, t.x, t.y);
                    }
                }
                this._placedTeamsCount++;
                this._clearHighlightedTiles();
                WarGame.phaseMgr.priorityPhase.nextTeam();
            }
        }
        if (this._placedTeamsCount >= WarGame.teamMgr.teams.length) {
            this._stopHandlingTeamPlacement();
        }
    }

    private _setupCamera(): void {
        this.cameras.main.backgroundColor.setFromRGB({r: 0, g: 0, b: 0});
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(0, 0);
    }

    private _setupController(): void {
        this._controller = new KBMController(this);
    }
}