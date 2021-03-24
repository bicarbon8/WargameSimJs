import { IPlayer } from "../players/i-player";
import { Location } from "./location";
import { PlayerManager } from "../players/player-manager";
import { Helpers } from "../utils/helpers";
import { MapGridItem } from "./map-grid-item";

export class WarGameMap {
    private _grid: MapGridItem[][];
    private _playerMgr: PlayerManager;
    
    constructor(grid: MapGridItem[][], playerMgr?: PlayerManager) {
        this._grid = grid;
        this._playerMgr = playerMgr || PlayerManager.inst;
    }

    addPlayers(...players: IPlayer[]): void {
        if (players) {
            for (var i=0; i<players.length; i++) {
                let p: IPlayer = players[i];
                let pLoc: Location = p.getLocation();
                if (!this.isLocationOccupied(pLoc)) {
                    this._playerMgr.addPlayers(p);
                    this._grid[pLoc.x][pLoc.y].player = p;
                }
            }
        }
    }

    movePlayer(player: IPlayer, location: Location): void {
        if (player && location) {
            if (player.getStats().move <= this.getDistanceBetween(player.getLocation(), location)) {
                if (!this.isLocationOccupied(location)) {
                    let pLoc: Location = player.getLocation();
                    this._grid[pLoc.x][pLoc.y].player = null;
                    player.setLocation(location);
                    this._grid[location.x][location.y].player = player;
                }
            } else {
                // TODO: notify that player cannot move there
                console.warn(`player at ${JSON.stringify(player.getLocation())} unable to move to ${JSON.stringify(location)}`);
            }
        }
    }

    /**
     * will return any `IPlayer` occupying the specified `location`
     * @param location the `Location` to search
     * @returns an `IPlayer` if found at the specified location, or null
     */
    getPlayerAt(location: Location): IPlayer {
        if (this.isLocationOccupied(location)) {
            return this._grid[location.x][location.y].player;
        }
        return null;
    }

    /**
     * uses the following formula to calculate distance between two
     * points `d=√((x_2-x_1)²+(y_2-y_1)²)`
     * @param loc1 first location
     * @param loc2 second location
     * @returns the distance as an integer
     */
    getDistanceBetween(loc1: Location, loc2: Location): number {
        let distance: number = 0;
        distance = Math.floor(Math.sqrt(Math.pow((loc2.x-loc1.x), 2)+Math.pow((loc2.y-loc1.y), 2)));
        return distance;
    }

    isBattling(player: IPlayer): boolean {
        return this.getOpponentsInMeleRange(player).length > 0;
    }

    getOpponentsInMeleRange(player: IPlayer): IPlayer[] {
        let inRange: IPlayer[] = [];
        let pLoc: Location = player.getLocation();
        let pX: number = pLoc.x;
        let pY: number = pLoc.y;
        for (var x=pX-1; x<=pX+1; x++) {
            for (var y=pY-1; y<=pY+1; y++) {
                if (this.isLocationOccupied({x: x, y: y})) {
                    if (this._playerMgr.areAllies(player, this.getPlayerAt({x: x, y: y}))) {
                        let opponent: IPlayer = this.getPlayerAt({x: x, y: y});
                        inRange.push(opponent);
                    }
                }
            }
        }
        return inRange;
    }

    /**
     * 
     * @param player the attacker
     * @returns an array of opponents in shooting range
     */
    getOpponentsInShootRange(player: IPlayer): IPlayer[] {
        let inRange: IPlayer[] = [];
        let pLoc: Location = player.getLocation();
        let pX: number = pLoc.x;
        let pY: number = pLoc.y;
        let shoot: number = player.getStats().shoot;
        for (var x=pX-shoot; x<=pX+shoot; x++) {
            for (var y=pY-shoot; y<=pY+shoot; y++) {
                if (this.getDistanceBetween({x: x, y: y}, pLoc) <= shoot && this.isLocationOccupied({x: x, y: y})) {
                    if (this._playerMgr.areAllies(player, this.getPlayerAt({x: x, y: y}))) {
                        let opponent: IPlayer = this.getPlayerAt({x: x, y: y});
                        if (!this.isBattling(opponent)) {
                            inRange.push(opponent);
                        }
                    }
                }
            }
        }
        return inRange;
    }

    isLocationOccupied(location: Location): boolean {
        let isOccupied: boolean = false;
        if (this.isValidLocation(location)) {
            let gridItem: MapGridItem = this._grid[location.x][location.y];
            isOccupied = gridItem.player != null;
        }
        return isOccupied;
    }

    isValidLocation(location: Location): boolean {
        return Helpers.isBetween(location.x, 0, this._grid.length) && Helpers.isBetween(location.y, 0, this._grid[0].length);
    }
}
