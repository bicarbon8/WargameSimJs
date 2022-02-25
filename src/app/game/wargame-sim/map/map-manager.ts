import Dungeon, { Room } from "@mikewesthad/dungeon";
import { IPlayer } from "../players/i-player";
import { PlayerManager } from "../players/player-manager";
import { Rand } from "../utils/rand";
import { MapGeneratorOptions } from "./map-generator-options";
import { MapTile } from "./map-tile";
import TILE_MAPPING from "../ui/map/tile-mapping";

export module MapManager {
    var _tiles: MapTile[][];

    export function generate(options: MapGeneratorOptions): void {
        _setDefaultOptions(options);
        const dungeon = new Dungeon({
            randomSeed: options.seed,
            width: options.width, // in tiles, not pixels
            height: options.height,
            rooms: {
                width: {
                    min: options.roomMinWidth, // in tiles, not pixels
                    max: options.roomMaxWidth,
                    onlyOdd: true
                },
                height: {
                    min: options.roomMinHeight,
                    max: options.roomMaxHeight,
                    onlyOdd: true
                },
                maxRooms: options.maxRooms
            },
            doorPadding: options.doorPadding
        });

        _tiles = [];
        for (var y=0; y<options.height; y++) {
            for (var x=0; x<options.width; x++) {
                if (x === 0) {
                    _tiles[y] = [];
                }
                if (dungeon.hasRoomAt(x, y)) {
                    _tiles[y][x] = {
                        x: x, 
                        y: y, 
                        terrain: Rand.getRandomWeightedValue(TILE_MAPPING.GROUND).index
                    }
                } else {
                    _tiles[y][x] = null;
                }
            }
        }
    }

    export function getTiles(): MapTile[] {
        let g: MapTile[] = [];
        for (var i=0; i<_tiles.length; i++) {
            g = g.concat(_tiles[i]);
        }
        return g.filter((tile: MapTile) => tile);
    }

    export function getEmptyTiles(): MapTile[] {
        let locations: MapTile[] = getTiles().filter((tile: MapTile) => {
            return !isTileOccupied(tile.x, tile.y);
        });
        return locations;
    }

    export function addPlayer(player: IPlayer, x: number, y: number): void {
        if (player && isValidLocation(x, y)) {
            if (!isTileOccupied(x, y)) {
                PlayerManager.addPlayers(player);
                let tile: MapTile = _getTileAt(x, y);
                tile.player = player;
                player.setLocation(tile.x, tile.y);
            }
        }
    }

    export function movePlayer(startX: number, startY: number, endX: number, endY: number): void {
        const player: IPlayer = getPlayerAt(startX, startY);
        if (player && isValidLocation(endX, endY)) {
            if (!isTileOccupied(endX, endY)) {
                let startTile: MapTile = _getTileAt(player.x, player.y);
                startTile.player = null;
                let endTile: MapTile = _getTileAt(endX, endY);
                endTile.player = player;
                player.setLocation(endX, endY);
            }
        }
    }

    /**
     * will return any `IPlayer` occupying the specified `location`
     * @param location the `Location` to search
     * @returns an `IPlayer` if found at the specified location, or null
     */
    export function getPlayerAt(x: number, y: number): IPlayer {
        return _getTileAt(x, y)?.player;
    }

    /**
     * uses the following formula to calculate distance between two
     * points `d=√((x_2-x_1)²+(y_2-y_1)²)`
     * @param loc1 first location
     * @param loc2 second location
     * @returns the distance as an integer
     */
    export function getDistanceBetween(startX: number, startY: number, endX: number, endY: number): number {
        let distance: number = 0;
        distance = Math.floor(Math.sqrt(Math.pow((endX-startX), 2)+Math.pow((endY-startY), 2)));
        return distance;
    }

    export function getPlayersInRange(x: number, y: number, range: number): IPlayer[] {
        return getTilesInRange(x, y, range)
        .map((val: MapTile) => {
            return val.player;
        })
        .filter((val: IPlayer) => {
            if (val) { return true; }
        });
    }

    export function getTilesInRange(locX: number, locY: number, range: number): MapTile[] {
        let inRangeTiles: MapTile[] = [];
        for (var x=locX-range; x<=locX+range; x++) {
            for (var y=locY-range; y<=locY+range; y++) {
                if (getDistanceBetween(x, y, locX, locY) <= range) {
                    let tile: MapTile = _getTileAt(x, y);
                    if (tile) {
                        inRangeTiles.push(tile);
                    }
                }
            }
        }
        return inRangeTiles;
    }

    export function isTileOccupied(x: number, y: number): boolean {
        let player: IPlayer = _getTileAt(x, y)?.player;
        if (player) {
            return true;
        }
        return false;
    }

    export function isValidLocation(x: number, y: number): boolean {
        return _getTileAt(x, y) !== null;
    }

    function _getTileAt(x: number, y: number): MapTile {
        return _tiles[y][x];
    }

    function _setDefaultOptions(options: MapGeneratorOptions): void {
        if (!options.seed) { options.seed = `${Rand.getInt(0, 10000)}`; }
        if (!options.width) { options.width = 500; }
        if (!options.height) { options.height = 500; }
        if (!options.roomMinWidth) { options.roomMinWidth = 100; }
        if (!options.roomMinHeight) { options.roomMinHeight = 100; }
        if (!options.roomMaxWidth) { options.roomMaxWidth = 250; }
        if (!options.roomMaxHeight) { options.roomMaxHeight = 250; }
        if (!options.doorPadding) { options.doorPadding = 0; }
    }
}
