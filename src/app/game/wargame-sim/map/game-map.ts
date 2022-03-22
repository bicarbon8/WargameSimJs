import Dungeon from "@mikewesthad/dungeon";
import { IPlayer } from "../players/i-player";
import { Rand } from "../utils/rand";
import { GameMapOptions } from "./game-map-options";
import TILE_MAPPING from "./tile-mapping";
import { WarGame } from "../war-game";
import { HasGameObject } from "../interfaces/has-game-object";
import { AStarFinder } from "astar-typescript";
import { HasLocation } from "../ui/types/has-location";
import { MapManager } from "./map-manager";

export class GameMap implements HasGameObject<Phaser.Tilemaps.TilemapLayer> {
    private readonly _options: GameMapOptions;
    private readonly _tileWidth: number;
    private readonly _tileHeight: number;
    private readonly _grid: number[][];
    private readonly _pathFinder: AStarFinder;

    private _layer: Phaser.Tilemaps.TilemapLayer;
    private _tileMap: Phaser.Tilemaps.Tilemap;
    
    constructor(options: GameMapOptions) {
        this._setDefaultOptions(options);
        this._options = options;
        this._tileWidth = 32;
        this._tileHeight = this._tileWidth;
        this._grid = this._createGrid();
        this._pathFinder = new AStarFinder({
            grid: {matrix: this._grid},
            diagonalAllowed: false,
            includeStartNode: false
        });
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

    getTileUnderPointer(location: HasLocation): Phaser.Tilemaps.Tile {
        const world: Phaser.Math.Vector2 = this._options.scene.cameras.main.getWorldPoint(location.x, location.y);
        const tile: Phaser.Tilemaps.Tile = this.obj.getTileAtWorldXY(world.x, world.y);
        return tile;
    }

    getUnoccupiedTiles(): Phaser.Tilemaps.Tile[] {
        let locations: Phaser.Tilemaps.Tile[] = this.getTiles().filter((tile: Phaser.Tilemaps.Tile) => {
            return !this.isTileOccupied(tile.x, tile.y);
        });
        return locations;
    }

    addPlayer(player: IPlayer, tileX: number, tileY: number): void {
        if (player && this.isValidLocation(tileX, tileY)) {
            player.setScene(this._options.scene);
            if (!this.isTileOccupied(tileX, tileY)) {
                player.setTile(tileX, tileY, this.getTileWorldCentre(tileX, tileY));
                this.mapManager.emit(WarGame.EVENTS.PLAYER_ADDED, player);
            }
        }
    }

    movePlayer(startX: number, startY: number, endX: number, endY: number): void {
        const player: IPlayer = this.mapManager.teamManager.playerManager.getPlayerAt(startX, startY);
        if (player && this.isValidLocation(endX, endY)) {
            if (!this.isTileOccupied(endX, endY)) {
                const tile: Phaser.Tilemaps.Tile = this.obj.getTileAt(endX, endY);
                WarGame.uiMgr.gameplayScene.tweens.add({
                    targets: player.obj,
                    x: tile.getCenterX(),
                    y: tile.getCenterY(),
                    ease: 'Sine.easeOut',
                    duration: 500,
                    onComplete: () => {
                        player.setTile(endX, endY, this.getTileWorldCentre(endX, endY));
                        this.mapManager.emit(WarGame.EVENTS.PLAYER_MOVED, player);
                    },
                    onCompleteScope: this
                });
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

    getTilesAround(tileX: number, tileY: number, count: number): Phaser.Tilemaps.Tile[] {
        const tiles: Phaser.Tilemaps.Tile[] = [];
        let xOffset = 0;
        let yOffset = 0;
        while (tiles.length < count) {
            for (var y=tileY-yOffset; y<=tileY+yOffset; y++) {
                for (var x=tileX-xOffset; x<=tileX+xOffset; x++) {
                    if (this.isValidLocation(x, y)) {
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

    getPlayersInRange(tileX: number, tileY: number, range: number): IPlayer[] {
        return this.getTilesInRange(tileX, tileY, range)
        .map((tile: Phaser.Tilemaps.Tile) => {
            return this.mapManager.teamManager.playerManager.getPlayerAt(tile.x, tile.y);
        }).filter((val: IPlayer) => {
            if (val) { return true; }
        });
    }

    isTileOccupied(tileX: number, tileY: number): boolean {
        let player: IPlayer = this.mapManager.teamManager.playerManager.getPlayerAt(tileX, tileY);
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
