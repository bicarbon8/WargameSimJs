import { environment } from "src/environments/environment";
import { MapTile } from "../../map/map-tile";
import { MapManager } from "../../map/map-manager";
import { PlayerManager } from "../../players/player-manager";
import { HeroPlayer } from "../../players/player-types/hero-player";
import { TeamManager } from "../../teams/team-manager";
import { Constants } from "../../utils/constants";
import { Rand } from "../../utils/rand";
import { UIGameMap } from "../map/ui-game-map";
import { IPlayer } from "../../players/i-player";
import { Team } from "../../teams/team";
import { BasicPlayer } from "../../players/player-types/basic-player";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'gameplay-scene'
};

export class GameplayScene extends Phaser.Scene {
    private _gameMap: UIGameMap;
    private readonly _players: Phaser.GameObjects.Sprite[] = [];
    private _mouseLoc: Phaser.Math.Vector2;

    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);
    }

    preload(): void {
        this.load.image('map-tiles', `${environment.baseUrl}/assets/tiles/metaltiles.png`);
        this.load.spritesheet('players', `${environment.baseUrl}/assets/sprites/player/sprite.png`, {
            frameWidth: 32,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 3
        }); // 12w by 8h
    }

    create(): void {
        this._createMap();
        this._createPlayers();
        this._setupCamera();
    }

    update(time: number, delta: number): void {
        if (this.input.activePointer.leftButtonDown()) {
            this._mouseLoc = this._getPointerLocation();
        }
        if (this.input.activePointer.leftButtonReleased()) {
            if (this._mouseLoc) {
                console.info(`mouse: ${this._mouseLoc.x.toFixed(0)},${this._mouseLoc.y.toFixed(0)}`);
                this._mouseLoc = null;
            }
        }
    }

    private _createMap(): void {
        const mult: number = TeamManager.getTeams().length;
        MapManager.generate({
            width: mult * 50,
            height: mult * 50,
            roomMaxWidth: 50,
            roomMaxHeight: 50,
            roomMinWidth: 25,
            roomMinHeight: 25,
            maxRooms: mult * 2
        });
        this._gameMap = new UIGameMap({
            scene: this,
            tiles: MapManager.getTiles(),
            layerDepth: Constants.DEPTH_PLAYER
        });
        this._gameMap.getGameObject().setInteractive();
        this._gameMap.getGameObject().on(Phaser.Input.Events.POINTER_WHEEL, (pointer, deltaX, deltaY, deltaZ) => {
            let zoom: number = this.cameras.main.zoom;
            this.cameras.main.setZoom(zoom + deltaY * -0.001);
        });
    }

    private _createPlayers(): void {
        // TODO: add player selection scene / menu
        let teams: Team[] = TeamManager.getTeams();
        for (var i=0; i<teams.length; i++) {
            let team: Team = teams[i];
            do {
                let player: IPlayer = new BasicPlayer();
                team.addPlayers(player);
            } while (team.remainingPoints > 10);
        }
        let locs: MapTile[] = MapManager.getEmptyTiles();
        let players: IPlayer[] = PlayerManager.getPlayers()
        for (var i=0; i<players.length; i++) {
            let player: IPlayer = players[i];
            let index: number = Rand.getInt(0, locs.length);
            let loc: MapTile = locs[index];
            locs.splice(index, 1);
            MapManager.addPlayer(player, loc.x, loc.y);
            let worldPos: Phaser.Math.Vector2 = this._gameMap.getMapTileWorldLocation(loc.x, loc.y);
            console.info(`placing player ${i} at: x: ${worldPos.x}, y: ${worldPos.y}`);
            let playerSprite: Phaser.GameObjects.Sprite = this.add.sprite(worldPos.x + 16, worldPos.y + 16, 'players', 1);
            playerSprite.setDepth(Constants.DEPTH_PLAYER);
            playerSprite.setInteractive();
            playerSprite.on(Phaser.Input.Events.POINTER_OVER, () => {
                this._gameMap.getLayer().getTileAt(player.x, player.y).setAlpha(0.5);
            }).on(Phaser.Input.Events.POINTER_OUT, () => {
                this._gameMap.getLayer().getTileAt(player.x, player.y).setAlpha(1);
            });
            this._players.push(playerSprite);
        }
    }

    private _setupCamera(): void {
        this.cameras.main.backgroundColor.setFromRGB({r: 0, g: 0, b: 0});
        this.cameras.main.setZoom(1);
        let player: Phaser.GameObjects.Sprite = this._players[0];
        console.info(`centering camera at: x: ${player.x}, y: ${player.y}`);
        this.cameras.main.centerOn(player.x, player.y);
    }

    /**
     * returns the world location of the pointer
     */
    private _getPointerLocation(): Phaser.Math.Vector2 {
        // console.log(`mouse REAL location: ${JSON.stringify(world)}`);
        return this._pointer()?.positionToCamera(this.cameras?.main) as Phaser.Math.Vector2;
    }

    private _pointer(): Phaser.Input.Pointer {
        return this.input?.activePointer;
    }
}