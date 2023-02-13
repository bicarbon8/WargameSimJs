import Dungeon from "@mikewesthad/dungeon";
import { IPlayer } from "../players/i-player";
import { Rand } from "../utils/rand";
import { GameMapOptions } from "./game-map-options";
import TILE_MAPPING from "./tile-mapping";
import { XY } from "../ui/types/xy";
import { GameMapTile } from "./game-map-tile";
import { Helpers } from "../utils/helpers";
import { PlayerManager } from "../players/player-manager";
import { Logging } from "../utils/logging";

export class TerrainTileManager {
    private readonly _grid: GameMapTile[][];
    private _width: number;
    private _height: number;

    readonly playerManager: PlayerManager;
    
    constructor(plyrMgr: PlayerManager) {
        this.playerManager = plyrMgr;
        this._grid = new Array<Array<GameMapTile>>();
        this._width = 0;
        this._height = 0;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    get grid(): GameMapTile[][] {
        return this._grid;
    }

    get tiles(): GameMapTile[] {
        return [].concat(...this._grid);
    }

    createTerrain(options: GameMapOptions): this {
        const opts = {
            ...this._defaultOptions(),
            ...options
        };
        Logging.log('info', 'creating terrain using:', {opts});
        this._width = opts.width;
        this._height = opts.height;
        const dungeon = new Dungeon({
            randomSeed: opts.seed,
            width: this.width, // in tiles, not pixels
            height: this.height,
            rooms: {
                width: {
                    min: opts.roomMinWidth, // in tiles, not pixels
                    max: opts.roomMaxWidth
                },
                height: {
                    min: opts.roomMinHeight,
                    max: opts.roomMaxHeight
                },
                maxRooms: opts.maxRooms
            },
            doorPadding: opts.doorPadding
        });
        while (this._grid.length <= this.height) {
            this._grid.push(new Array<GameMapTile>(this.width));
        }
        for (var y=0; y<this.height; y++) {
            for (var x=0; x<this.width; x++) {
                this.grid[y][x] = null;
                if (dungeon.hasRoomAt(x, y)) {
                    this._grid[y][x] = {
                        terrain: Rand.getRandomWeightedValue(TILE_MAPPING.GROUND).index,
                        xy: {x, y}
                    };
                }
            }
        }
        return this;
    }

    getTileAt(tileXY: XY): GameMapTile {
        if (this.isValidLocation(tileXY)) {
            return this._grid[tileXY.y][tileXY.x];
        }
        return null;
    }

    getUnoccupiedTiles(): GameMapTile[] {
        let locations: GameMapTile[] = this.tiles
            .filter(tile => tile != null)
            .filter(tile => this.isTileOccupied(tile.xy) === false);
        return locations;
    }

    setPlayerTile(player: IPlayer, tileXY: XY): boolean {
        if (player && this.isValidLocation(tileXY)) {
            if (!this.isTileOccupied(tileXY)) {
                player.setTile(tileXY);
                return true;
            }
        }
        return false;
    }

    /**
     * finds valid tiles within the range (in tiles) from the centre `tileXY`
     * @param tileXY the centre point to search from
     * @param range the radius to search within in number of tiles
     * @returns an array of `GameMapTile` objects within the range
     */
    getTilesInRange(tileXY: XY, range: number): GameMapTile[] {
        const tiles = new Array<GameMapTile>();
        for (let y=tileXY.y-range; y<tileXY.y+range; y++) {
            for (let x=tileXY.x-range; x<tileXY.x+range; x++) {
                if (Helpers.distance(tileXY, {x, y}) <= range && this.isValidLocation({x, y})) {
                    tiles.push(this._grid[y][x]);
                }
            }
        }
        return tiles;
    }

    /**
     * gets the specified number of valid (non-null) tiles around the specified `tileXY`
     * location. used for situations where you need to ensure space for a certain number of
     * items 
     * @param tileXY the central location to start from
     * @param count the number of tiles to return around the location specified
     * with `tileXY`
     * @returns an array of tiles around the location specified
     */
    getTilesAround(tileXY: XY, count: number): GameMapTile[] {
        const tiles: GameMapTile[] = [];
        let xOffset = 0;
        let yOffset = 0;
        while (tiles.length < count) {
            for (var y=tileXY.y-yOffset; y<=tileXY.y+yOffset; y++) {
                for (var x=tileXY.x-xOffset; x<=tileXY.x+xOffset; x++) {
                    if (this.isValidLocation({x, y})) {
                        let t: GameMapTile = this.getTileAt({x, y});
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
        .map(tile => this.playerManager.getPlayerAt(tile.xy))
        .filter((val: IPlayer) => val != null);
    }

    isTileOccupied(tileXY: XY): boolean {
        let player: IPlayer = this.playerManager.getPlayerAt(tileXY);
        if (player) {
            return true;
        }
        return false;
    }

    isValidLocation(tileXY: XY): boolean {
        const row = this._grid[tileXY.y];
        if (row) {
            return row[tileXY.x] != null;
        }
        return false;
    }

    private _defaultOptions(): GameMapOptions {
        return {
            seed: Rand.getStringFrom(10),
            width: 500,
            height: 500,
            roomMinWidth: 100,
            roomMinHeight: 100,
            roomMaxWidth: 250,
            roomMaxHeight: 250,
            doorPadding: 0
        };
    }
}
