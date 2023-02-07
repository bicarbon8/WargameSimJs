import Phaser from "phaser";
import Dungeon from "@mikewesthad/dungeon";
import { IPlayer } from "../players/i-player";
import { Rand } from "../utils/rand";
import { GameMapOptions } from "./game-map-options";
import TILE_MAPPING from "./tile-mapping";
import { WarGame } from "../war-game";
import { HasGameObject } from "../interfaces/has-game-object";
import { XY } from "../ui/types/xy";
import { MapManager } from "./map-manager";

export class GameMap implements HasGameObject<Phaser.Tilemaps.TilemapLayer> {
    private readonly _options: GameMapOptions;
    private readonly _tileWidth: number;
    private readonly _tileHeight: number;
    private readonly _grid: number[][];

    private _layer: Phaser.Tilemaps.TilemapLayer;
    private _tileMap: Phaser.Tilemaps.Tilemap;
    
    constructor(options: GameMapOptions) {
        this._setDefaultOptions(options);
        this._options = options;
        this._tileWidth = 32;
        this._tileHeight = this._tileWidth;
        this._grid = this._createGrid();
    }

    get mapManager(): MapManager {
        return this._options.mapManager;
    }

    get obj(): Phaser.Tilemaps.TilemapLayer {
        if (!this._layer) {
            this._createGameObj();
        }
        return this._layer;
    }

    getTiles(): Phaser.Tilemaps.Tile[] {
        return this.obj.getTilesWithin(0, 0, this.obj.width, this.obj.height);
    }

    getTileAt(tileXY: XY): Phaser.Tilemaps.Tile {
        const tile = this.obj.getTileAt(tileXY.x, tileXY.y, true);
        return tile;
    }

    getTileAtCameraXY(cameraXY: XY): Phaser.Tilemaps.Tile {
        const world: Phaser.Math.Vector2 = this._options.scene.cameras.main.getWorldPoint(cameraXY.x, cameraXY.y);
        const tile = this.getTileAtWorldXY(world);
        return tile;
    }

    getTileAtWorldXY(worldXY: XY): Phaser.Tilemaps.Tile {
        const tile = this.obj.getTileAtWorldXY(worldXY.x, worldXY.y, true, this._options.scene.cameras.main);
        return tile;
    }

    getUnoccupiedTiles(): Phaser.Tilemaps.Tile[] {
        let locations: Phaser.Tilemaps.Tile[] = this.getTiles()
            .filter((tile: Phaser.Tilemaps.Tile) => this.isTileOccupied(tile) === false);
        return locations;
    }

    addPlayer(player: IPlayer, tileXY: XY): void {
        if (player && this.isValidLocation(tileXY)) {
            player.setScene(this._options.scene);
            if (!this.isTileOccupied(tileXY)) {
                player.setTile(tileXY);
                WarGame.evtMgr.notify(WarGame.EVENTS.PLAYER_ADDED, player);
            }
        }
    }

    movePlayer(start: XY, end: XY): void {
        const player: IPlayer = this.mapManager.teamManager.playerManager.getPlayerAt(start);
        if (player && this.isValidLocation(end)) {
            if (!this.isTileOccupied(end)) {
                const tile: Phaser.Tilemaps.Tile = this.obj.getTileAt(end.x, end.y);
                WarGame.uiMgr.gameplayScene.tweens.add({
                    targets: player.obj,
                    x: tile.getCenterX(),
                    y: tile.getCenterY(),
                    ease: 'Sine.easeOut',
                    duration: 500,
                    onComplete: () => {
                        player.setTile(end);
                        WarGame.evtMgr.notify(WarGame.EVENTS.PLAYER_MOVED, player);
                    },
                    onCompleteScope: this
                });
            }
        }
    }

    getDistanceBetween(start: XY, end: XY): number {
        return Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y);
    }

    /**
     * finds valid tiles within the range (in tiles) from the centre `tileXY`
     * @param tileXY the centre point to search from
     * @param range the radius to search within in number of tiles
     * @returns an array of `Phaser.Tilemaps.Tile` objects within the range
     */
    getTilesInRange(tileXY: XY, range: number): Phaser.Tilemaps.Tile[] {
        let worldLoc: Phaser.Math.Vector2 = this.getTileWorldCentre(tileXY);
        let circle = new Phaser.Geom.Circle(worldLoc.x, worldLoc.y, range * (this._tileWidth / 2));
        return this.obj.getTilesWithinShape(circle, {isNotEmpty: true});
    }

    getTilesAround(tileXY: XY, count: number): Phaser.Tilemaps.Tile[] {
        const tiles: Phaser.Tilemaps.Tile[] = [];
        let xOffset = 0;
        let yOffset = 0;
        while (tiles.length < count) {
            for (var y=tileXY.y-yOffset; y<=tileXY.y+yOffset; y++) {
                for (var x=tileXY.x-xOffset; x<=tileXY.x+xOffset; x++) {
                    if (this.isValidLocation({x, y})) {
                        let t: Phaser.Tilemaps.Tile = this.obj.getTileAt(x, y);
                        if (!tiles.includes(t)) {
                            tiles.push(t);
                        }
                    }
                    if (tiles.length >= count) {
                        break;
                    }
                }
                if (tiles.length >= count) {
                    break;
                }
            }
            xOffset++;
            yOffset++;
        }
        return tiles;
    }

    /**
     * searches for players within the range (number of tiles) specified from 
     * the centre point `tileXY`
     * @param tileXY the centre point to search from
     * @param range the radius outwards in number of tiles to search within
     * @returns an array of `IPlayer` objects found within the range
     */
    getPlayersInRange(tileXY: XY, range: number): IPlayer[] {
        return this.getTilesInRange(tileXY, range)
        .map((tile: Phaser.Tilemaps.Tile) => this.mapManager.teamManager.playerManager.getPlayerAt(tile))
        .filter((val: IPlayer) => val != null);
    }

    isTileOccupied(tileXY: XY): boolean {
        let player: IPlayer = this.mapManager.teamManager.playerManager.getPlayerAt(tileXY);
        if (player) {
            return true;
        }
        return false;
    }

    getTileWorldCentre(tileXY: XY): Phaser.Math.Vector2 {
        return this.obj.tileToWorldXY(tileXY.x, tileXY.y);
    }

    isValidLocation(tileXY: XY): boolean {
        return this.obj.getTileAt(tileXY.x, tileXY.y) !== null;
    }

    setScene(scene: Phaser.Scene): void {
        if (scene) {
            this.obj.destroy();
            this._layer = null;
            this._options.scene = scene;
        }
    }

    private _createGrid(): number[][] {
        const dungeon = new Dungeon({
            randomSeed: this._options.seed,
            width: this._options.width, // in tiles, not pixels
            height: this._options.height,
            rooms: {
                width: {
                    min: this._options.roomMinWidth, // in tiles, not pixels
                    max: this._options.roomMaxWidth,
                    onlyOdd: true
                },
                height: {
                    min: this._options.roomMinHeight,
                    max: this._options.roomMaxHeight,
                    onlyOdd: true
                },
                maxRooms: this._options.maxRooms
            },
            doorPadding: this._options.doorPadding
        });
        const grid: number[][] = [];
        for (var y=0; y<this._options.height; y++) {
            grid[y] = [];
            for (var x=0; x<this._options.width; x++) {
                if (dungeon.hasRoomAt(x, y)) {
                    grid[y][x] = 1;
                } else {
                    grid[y][x] = 0;
                }
            }
        }
        return grid;
    }

    private _createGameObj(): void {
        this._tileMap = this._options.scene.make.tilemap({
            tileWidth: this._tileWidth,
            tileHeight: this._tileHeight,
            width: this._options.width,
            height: this._options.height
        });
        let tileset: Phaser.Tilemaps.Tileset = this._tileMap.addTilesetImage('tiles', 'map-tiles', this._tileWidth, this._tileHeight, 0, 0);
        this._layer = this._tileMap.createBlankLayer('map-layer', tileset);
        this._layer.setDepth(this._options.layerDepth);
        for (var y=0; y<this._grid.length; y++) {
            for (var x=0; x<this._grid[y].length; x++) {
                if (this._grid[y][x] === 1) {
                    this._layer.putTileAt(Rand.getRandomWeightedValue(TILE_MAPPING.GROUND).index, x, y);
                }
            }
        }
        this._layer.setCollisionByExclusion([0, 1, 2, 3, 4, 5, 6, 7]);
        this._layer.setPosition(-(this._layer.width / 2), -(this._layer.height / 2));
        this._layer.setInteractive();
    }

    private _setDefaultOptions(options: GameMapOptions): void {
        options.seed = options.seed || `${Rand.getInt(0, 10000)}`;
        options.width = options.width || 500;
        options.height = options.height || 500;
        options.roomMinWidth = options.roomMinWidth || 100;
        options.roomMinHeight = options.roomMinHeight || 100;
        options.roomMaxWidth = options.roomMaxWidth || 250;
        options.roomMaxHeight = options.roomMaxHeight || 250;
        options.doorPadding = options.doorPadding || 0;
        options.layerDepth = options.layerDepth || WarGame.DEPTH.MIDGROUND;
    }
}
