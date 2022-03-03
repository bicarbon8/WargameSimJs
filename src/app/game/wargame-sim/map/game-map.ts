import Dungeon from "@mikewesthad/dungeon";
import { IPlayer } from "../players/i-player";
import { Rand } from "../utils/rand";
import { GameMapOptions } from "./game-map-options";
import TILE_MAPPING from "./tile-mapping";
import { WarGame } from "../war-game";
import { HasGameObject } from "../interfaces/has-game-object";
import { Constants } from "../utils/constants";
import { AStarFinder } from "astar-typescript";

export class GameMap implements HasGameObject<Phaser.Tilemaps.TilemapLayer> {
    private readonly _scene: Phaser.Scene;
    private readonly _options: GameMapOptions;
    private readonly _tileWidth: number;
    private readonly _tileHeight: number;
    private readonly _grid: 0|1[][];
    private readonly _pathFinder: AStarFinder;

    private _layer: Phaser.Tilemaps.TilemapLayer;
    private _tileMap: Phaser.Tilemaps.Tilemap;
    
    constructor(options: GameMapOptions) {
        this._setDefaultOptions(options);
        this._options = options;
        this._scene = options.scene;
        this._tileWidth = 32;
        this._tileHeight = this._tileWidth;
        this._grid = [];
        this._createGameObj();
        this._pathFinder = new AStarFinder({
            grid: {matrix: this._grid},
            diagonalAllowed: false,
            includeStartNode: false
        });
    }

    get obj(): Phaser.Tilemaps.TilemapLayer {
        return this._layer;
    }

    getTiles(): Phaser.Tilemaps.Tile[] {
        return this.obj.getTilesWithin(0, 0, this.obj.width, this.obj.height);
    }

    getUnoccupiedTiles(): Phaser.Tilemaps.Tile[] {
        let locations: Phaser.Tilemaps.Tile[] = this.getTiles().filter((tile: Phaser.Tilemaps.Tile) => {
            return !this.isTileOccupied(tile.x, tile.y);
        });
        return locations;
    }

    addPlayer(player: IPlayer, tileX: number, tileY: number): void {
        if (player && this.isValidLocation(tileX, tileY)) {
            if (!this.isTileOccupied(tileX, tileY)) {
                WarGame.players.addPlayer(player);
                player.setTile(tileX, tileY);
            }
        }
    }

    movePlayer(startX: number, startY: number, endX: number, endY: number): void {
        const player: IPlayer = WarGame.players.getPlayerAt(startX, startY);
        if (player && this.isValidLocation(endX, endY)) {
            if (!this.isTileOccupied(endX, endY)) {
                player.setTile(endX, endY);
            }
        }
    }

    getDistanceBetween(startX: number, startY: number, endX: number, endY: number): number {
        return this.getPathTo(startX, startY, endX, endY).length;
    }

    getPathTo(startX: number, startY: number, endX: number, endY: number): Phaser.Tilemaps.Tile[] {
        let path: Phaser.Tilemaps.Tile[] = [];
        let p: number[][] = this._pathFinder.findPath({x: startX, y: startY}, {x: endX, y: endY});
        return path;
    }

    getTilesInRange(tileX: number, tileY: number, range: number): Phaser.Tilemaps.Tile[] {
        let worldLoc: Phaser.Math.Vector2 = this.getTileWorldCentre(tileX, tileY);
        let circle = new Phaser.Geom.Circle(worldLoc.x, worldLoc.y, range);
        return this.obj.getTilesWithinShape(circle, {isNotEmpty: true});
    }

    getPlayersInRange(tileX: number, tileY: number, range: number): IPlayer[] {
        return this.getTilesInRange(tileX, tileY, range)
        .map((tile: Phaser.Tilemaps.Tile) => {
            return WarGame.players.getPlayerAt(tile.x, tile.y);
        }).filter((val: IPlayer) => {
            if (val) { return true; }
        });
    }

    isTileOccupied(tileX: number, tileY: number): boolean {
        let player: IPlayer = WarGame.players.getPlayerAt(tileX, tileY);
        if (player) {
            return true;
        }
        return false;
    }

    getTileWorldCentre(tileX: number, tileY: number): Phaser.Math.Vector2 {
        if (this.isValidLocation(tileX, tileY)) {
            const tile: Phaser.Tilemaps.Tile = this.obj.getTileAt(tileX, tileY);
            return new Phaser.Math.Vector2(tile.getCenterX(), tile.getCenterY());
        }
        return null;
    }

    isValidLocation(tileX: number, tileY: number): boolean {
        return this.obj.getTileAt(tileX, tileY) !== null;
    }

    private _createGameObj(): void {
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

        this._tileMap = this._scene.make.tilemap({
            tileWidth: this._tileWidth,
            tileHeight: this._tileHeight,
            width: this._options.width,
            height: this._options.height
        });
        let tileset: Phaser.Tilemaps.Tileset = this._tileMap.addTilesetImage('tiles', 'map-tiles', this._tileWidth, this._tileHeight, 0, 0);
        this._layer = this._tileMap.createBlankLayer('map-layer', tileset);
        this._layer.setDepth(this._options.layerDepth || Constants.DEPTH_PLAYER);
        for (var y=0; y<this._options.height; y++) {
            for (var x=0; x<this._options.width; x++) {
                if (x === 0) {
                    this._grid[y] = [];
                }
                if (dungeon.hasRoomAt(x, y)) {
                    this._layer.putTileAt(Rand.getRandomWeightedValue(TILE_MAPPING.GROUND).index, x, y);
                    this._grid[y][x] = 1;
                } else {
                    this._grid[y][x] = 0;
                }
            }
        }
        this._layer.setCollisionByExclusion([0, 1, 2, 3, 4, 5, 6, 7]);
    }

    private _setDefaultOptions(options: GameMapOptions): void {
        if (!options.seed) { options.seed = `${Rand.getInt(0, 10000)}`; }
        if (!options.width) { options.width = 500; }
        if (!options.height) { options.height = 500; }
        if (!options.roomMinWidth) { options.roomMinWidth = 100; }
        if (!options.roomMinHeight) { options.roomMinHeight = 100; }
        if (!options.roomMaxWidth) { options.roomMaxWidth = 250; }
        if (!options.roomMaxHeight) { options.roomMaxHeight = 250; }
        if (!options.doorPadding) { options.doorPadding = 0; }
        if (!options.layerDepth) { options.layerDepth = Constants.DEPTH_PLAYER; }
    }
}
