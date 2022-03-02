import { environment } from "src/environments/environment";
import { GameMap } from "../../map/game-map";
import { Constants } from "../../utils/constants";
import { IPlayer } from "../../players/i-player";
import { Team } from "../../teams/team";
import { BasicPlayer } from "../../players/player-types/basic-player";
import { InputController } from "../controllers/input-controller";
import { KBMController } from "../controllers/kbm-controller";
import { WarGame } from "../../war-game";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'gameplay-scene'
};

export class GameplayScene extends Phaser.Scene {
    private readonly _players: Phaser.GameObjects.Sprite[] = [];
    private _controller: InputController;
    private _highlightedTiles: Phaser.Tilemaps.Tile[] = [];
    private _playerPlacements: number = 0;
    private _downTime: number = 0;

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
            endFrame: 3
        }); // 12w by 8h
    }

    create(): void {
        this._createMap();
        this._setupCamera();
        this._setupController();
        this._handlePickTeams();
    }

    update(time: number, delta: number): void {
        this._controller.update(time, delta);
    }

    private _createMap(): void {
        const mult: number = WarGame.teams.getTeams().length;
        WarGame.map = new GameMap({
            scene: this,
            width: mult * 50,
            height: mult * 50,
            roomMaxWidth: 50,
            roomMaxHeight: 50,
            roomMinWidth: 25,
            roomMinHeight: 25,
            maxRooms: mult,
            seed: 'bicarbon8',
            layerDepth: Constants.DEPTH_PLAYER
        });
        WarGame.map.obj.setInteractive();
        console.info(`map width: ${WarGame.map.obj.width}, height: ${WarGame.map.obj.height}, position: ${WarGame.map.obj.x}, ${WarGame.map.obj.y}`);
    }

    private _handlePickTeams(): void {
        // TODO: display player selection scene / menu
        let teams: Team[] = WarGame.teams.getTeams();
        for (var i=0; i<teams.length; i++) {
            let team: Team = teams[i];
            do {
                let player: IPlayer = new BasicPlayer(this);
                team.addPlayers(player);
            } while (team.remainingPoints > 10);
        }
        this._handleTileHighlighting();
        this._startPlacePlayers();
    }

    private _handleTileHighlighting(): void {
        WarGame.map.obj.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            this._clearHighlightedTiles();
            let worldLoc: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            let pointerTile: Phaser.Tilemaps.Tile = WarGame.map.obj.getTileAtWorldXY(worldLoc.x, worldLoc.y);
            if (pointerTile) {
                let teamPlayers: IPlayer[] = WarGame.teams.getTeams()[this._playerPlacements]?.getPlayers();
                let tiles: Phaser.Tilemaps.Tile[] = WarGame.map.getTilesInRange(pointerTile.x, pointerTile.y, (teamPlayers.length / 3) * 32)
                    .filter((tile: Phaser.Tilemaps.Tile) => !WarGame.map.isTileOccupied(tile.x, tile.y));
                this._highlightedTiles = this._highlightedTiles.concat(tiles);
                for (var i=0; i<this._highlightedTiles.length; i++) {
                    this._highlightedTiles[i].alpha = 0.5;
                }
            }
        }, this).on(Phaser.Input.Events.POINTER_OUT, () => {
            this._clearHighlightedTiles();
        }, this);
    }

    private _clearHighlightedTiles(): void {
        for (var i=0; i<this._highlightedTiles.length; i++) {
            let tile: Phaser.Tilemaps.Tile = this._highlightedTiles.shift();
            tile?.clearAlpha();
        }
    }

    private _startPlacePlayers(): void {
        WarGame.map.obj.once(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this.time.now > this._downTime + Constants.CLICK_HANDLING_DELAY) {
                this._downTime = this.time.now;
                let players: IPlayer[] = WarGame.teams.getTeams()[this._playerPlacements++]?.getPlayers();
                if (players?.length) {
                    this._placePlayers(...players);
                }
            }
            if (this._playerPlacements < WarGame.teams.getTeams().length) {
                this._startPlacePlayers();
            } else {
                WarGame.map.obj.off(Phaser.Input.Events.POINTER_MOVE);
                WarGame.map.obj.off(Phaser.Input.Events.POINTER_OUT);
            }
        }, this);
    }

    private _placePlayers(...players: IPlayer[]): void {
        for (var i=0; i<this._highlightedTiles.length; i++) {
            if (i>players.length) { break; }

            let t: Phaser.Tilemaps.Tile = this._highlightedTiles[i];
            let p: IPlayer = players[i];
            WarGame.map.addPlayer(p, t.x, t.y);
        }
        this._clearHighlightedTiles();
    }

    private _setupCamera(): void {
        this.cameras.main.backgroundColor.setFromRGB({r: 0, g: 0, b: 0});
        this.cameras.main.setZoom(1);
        let loc: Phaser.Math.Vector2 = new Phaser.Math.Vector2(WarGame.map.obj.width / 2, WarGame.map.obj.height / 2);
        console.info(`placing camera at: ${loc.x}, ${loc.y}`);
        this.cameras.main.centerOn(loc.x, loc.y);
    }

    private _setupController(): void {
        this._controller = new KBMController(this);
    }
}