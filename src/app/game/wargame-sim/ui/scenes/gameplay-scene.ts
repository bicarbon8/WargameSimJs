import { environment } from "src/environments/environment";
import { GameMap } from "../../map/game-map";
import { Constants } from "../../utils/constants";
import { IPlayer } from "../../players/i-player";
import { Team } from "../../teams/team";
import { InputController } from "../controllers/input-controller";
import { KBMController } from "../controllers/kbm-controller";
import { WarGame } from "../../war-game";
import { HasGameObject } from "../../interfaces/has-game-object";
import { PhaseType } from "../../phases/phase-type";
import { Card } from "../card/card";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'gameplay-scene'
};

export class GameplayScene extends Phaser.Scene {
    private _width: number;
    private _height: number;
    private _controller: InputController;
    private _highlightedTiles: Phaser.Tilemaps.Tile[] = [];
    private _currentTeamIndex: number = 0;
    private _downTime: number = 0;
    private _gameMenu: Card;
    private _gameMenuHiddenUntil: number;
    
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

    async create(): Promise<void> {
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;
        await WarGame.phaseMgr.runCurrentPhase();
        this._createMap();
        this._setupCamera();
        this._setupController();
        this._showMenu();

        this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            let world: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            console.info(`screen: ${pointer.x.toFixed(0)},${pointer.y.toFixed(0)}; world: ${world.x.toFixed(0)},${world.y.toFixed(0)}`);
        });
    }

    update(time: number, delta: number): void {
        this._controller.update(time, delta);
        this._gameMenu.setScale(1 / this.cameras.main.zoom);
        const view: Phaser.Geom.Rectangle = this.cameras.main.worldView;
        const x: number = view.left + (this._gameMenu.displayWidth / 2) + 10;
        const y: number = view.top + (this._gameMenu.displayHeight / 2) + 10;
        this._gameMenu.setPosition(x, y);

        if (this._gameMenuHiddenUntil && time > this._gameMenuHiddenUntil) {
            this._gameMenu.setVisible(true);
            this._gameMenuHiddenUntil = undefined;
        }

        this._gameMenu.updateHeaderText(`Current Phase: [${PhaseType[WarGame.phaseMgr.currentPhase().getType()]}]`);
        this._gameMenu.updateBodyTitle(`Current Team: [${WarGame.teamMgr.getTeamsByPriority()[this._currentTeamIndex]?.name}]`);
    }

    private _createMap(): void {
        const mult: number = WarGame.teamMgr.teams.length;
        WarGame.map = new GameMap({
            scene: this,
            width: mult * 20,
            height: mult * 20,
            roomMaxWidth: 20,
            roomMaxHeight: 20,
            roomMinWidth: 10,
            roomMinHeight: 10,
            maxRooms: mult,
            seed: 'bicarbon8',
            layerDepth: Constants.DEPTH_PLAYER
        });
        WarGame.map.obj.setInteractive();
        console.info(`map width: ${WarGame.map.obj.width}, height: ${WarGame.map.obj.height}, position: ${WarGame.map.obj.x}, ${WarGame.map.obj.y}`);
    }

    private _handleTileHighlighting(): void {
        WarGame.map.obj.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            this._clearHighlightedTiles();
            let worldLoc: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            let pointerTile: Phaser.Tilemaps.Tile = WarGame.map.obj.getTileAtWorldXY(worldLoc.x, worldLoc.y);
            if (pointerTile) {
                let teamPlayers: IPlayer[] = WarGame.teamMgr.getTeamsByPriority()[this._currentTeamIndex]?.getPlayers();
                let tiles: Phaser.Tilemaps.Tile[] = WarGame.map.getTilesInRange(pointerTile.x, pointerTile.y, (teamPlayers.length / 3) * 32)
                    .filter((tile: Phaser.Tilemaps.Tile) => !WarGame.map.isTileOccupied(tile.x, tile.y));
                if (teamPlayers.length <= tiles.length) {
                    this._highlightedTiles = this._highlightedTiles.concat(tiles);
                    for (var i=0; i<this._highlightedTiles.length; i++) {
                        this._highlightedTiles[i].alpha = 0.5;
                    }
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

    private _handleTeamPlacement(): void {
        WarGame.map.obj.once(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this.time.now > this._downTime + Constants.CLICK_HANDLING_DELAY) {
                this._downTime = this.time.now;
                let team: Team = WarGame.teamMgr.getTeamsByPriority()[this._currentTeamIndex];
                if (team) {
                    this._placeTeam(team, ...this._highlightedTiles);
                }
            }
            if (this._currentTeamIndex < WarGame.teamMgr.teams.length) {
                this._handleTeamPlacement();
            } else {
                WarGame.map.obj.off(Phaser.Input.Events.POINTER_MOVE);
                WarGame.map.obj.off(Phaser.Input.Events.POINTER_OUT);
                WarGame.phaseMgr.moveToNextPhase();
                this._startMovementPhase();
            }
        }, this);
    }

    private _placeTeam(team: Team, ...tiles: Phaser.Tilemaps.Tile[]): void {
        const players: IPlayer[] = team.getPlayers();
        if (tiles.length >= players.length) {
            for (var i=0; i<this._highlightedTiles.length; i++) {
                if (i>players.length) { break; }

                let t: Phaser.Tilemaps.Tile = this._highlightedTiles[i];
                let p: IPlayer = players[i];
                if (p) {
                    (p as unknown as HasGameObject<Phaser.GameObjects.Sprite>).setScene(this);
                    WarGame.map.addPlayer(p, t.x, t.y);
                }
            }
            this._clearHighlightedTiles();
            this._currentTeamIndex++;
        }
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

    private _showMenu(): void {
        const menuWidth: number = this._width / 3;
        this._gameMenu = new Card({
            scene: this,
            width: menuWidth,
            header: {
                text: `Current Phase: [${PhaseType[WarGame.phaseMgr.currentPhase().getType()]}]`,
                textStyle: {font: '20px Courier', color: '#ffffff'},
                background: {color: 0x006000},
                cornerRadius: 5
            },
            body: {
                title: `Current Team: [${WarGame.teamMgr.getTeamsByPriority()[this._currentTeamIndex].name}]`,
                titleStyle: {font: '20px Courier', color: '#606060'},
                description: 'Press location on the\nMap to place your team.',
                descriptionStyle: {font: '10px Courier', color: '#606060'},
                background: {color: 0xc0c0c0},
                cornerRadius: 5,
                buttons: [
                    {
                        text: 'Press "Go" to begin',
                        background: {alpha: 0},
                        padding: 5
                    },
                    {
                        text: 'Go',
                        background: {color: 0x00ff00},
                        interactive: true,
                        cornerRadius: 5,
                        padding: 5
                    }
                ]
            }
        });
        this.add.existing(this._gameMenu);
        this._gameMenu.cardbody.buttons[1].on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._gameMenu.removeBodyButtons(true);
            this._gameMenu.updateBodyDescription('');
            this._handleTileHighlighting();
            this._handleTeamPlacement();
        }, this);
        this._controller.on(Constants.CAMERA_ZOOM_EVENT, () => {
            this._gameMenu.setVisible(false);
            this._gameMenuHiddenUntil = this.time.now + 250;
        }, this);
        this._controller.on(Constants.CAMERA_MOVE_START_EVENT, () => {
            this._gameMenu.setVisible(false);
        }).on(Constants.CAMERA_MOVE_END_EVENT, () => {
            this._gameMenu.setVisible(true);
        });
        this._gameMenu.setDepth(Constants.DEPTH_MENU);
    }

    private _startMovementPhase(): void {
        this._currentTeamIndex = 0;
        this._gameMenu.updateBodyDescription('Tap each player and pick a\nlocation within their\nmovement range.');
        this._gameMenu.addBodyButtons({
            text: 'Continue',
            padding: 5,
            background: {color: 0x00f000},
            cornerRadius: 5,
            interactive: true
        },{
            text: 'to next Team',
            padding: 5,
            background: {alpha: 0},
            interactive: true
        });
        this._gameMenu.cardbody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._currentTeamIndex++;
            if (this._currentTeamIndex >= WarGame.teamMgr.teams.length) {
                this._currentTeamIndex = 0;
                this._gameMenu.removeBodyButtons(true);
                WarGame.phaseMgr.moveToNextPhase();
                this._startShootingPhase();
            }
        }, this);
    }

    private _startShootingPhase(): void {
        this._currentTeamIndex = 0;
        this._gameMenu.updateBodyDescription('Tap each player and pick an\nopponent in range\nto attempt to shoot them.');
        this._gameMenu.addBodyButtons({
            text: 'Continue',
            padding: 5,
            background: {color: 0x00f000},
            cornerRadius: 5,
            interactive: true
        },{
            text: 'to next Team',
            padding: 5,
            background: {alpha: 0},
            interactive: true
        });
        this._gameMenu.cardbody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._currentTeamIndex++;
            if (this._currentTeamIndex >= WarGame.teamMgr.teams.length) {
                this._currentTeamIndex = 0;
                this._gameMenu.removeBodyButtons(true);
                WarGame.phaseMgr.moveToNextPhase();
            }
        }, this);
    }
}