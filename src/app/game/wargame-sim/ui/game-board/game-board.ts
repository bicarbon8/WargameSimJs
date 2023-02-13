import { TeamManager } from "../../teams/team-manager";
import { TerrainTileManager } from "../../terrain/terrain-tile-manager";
import { WarGame } from "../../war-game";
import { XY } from "../types/xy";

export class GameBoard extends Phaser.Tilemaps.Tilemap {
    readonly tileManager: TerrainTileManager;
    readonly teamManager: TeamManager;
    
    private _groundLayer: Phaser.Tilemaps.TilemapLayer;

    constructor(scene: Phaser.Scene, tileMgr: TerrainTileManager, teamMgr: TeamManager) {
        const mult: number = teamMgr.teams.length;
        tileMgr.createTerrain({
            width: mult * 20,
            height: mult * 20,
            roomMaxWidth: 20,
            roomMaxHeight: 20,
            roomMinWidth: 10,
            roomMinHeight: 10,
            maxRooms: mult
        });
        super(scene, new Phaser.Tilemaps.MapData({
            tileWidth: 32,
            tileHeight: 32,
            width: tileMgr.width,
            height: tileMgr.height
        }));
        this.tileManager = tileMgr;
        this.teamManager = teamMgr;
        this._drawTiles();
    }

    get groundLayer(): Phaser.Tilemaps.TilemapLayer {
        return this._groundLayer;
    }

    getTileXYFromCameraXY(cameraXY: XY): XY {
        const {x, y} = this.scene.cameras.main.getWorldPoint(cameraXY.x, cameraXY.y);
        return this.getTileXYFromWorldXY({x, y});
    }

    getTileXYFromWorldXY(worldXY: XY): XY {
        const {x, y} = this._groundLayer.worldToTileXY(worldXY.x, worldXY.y);
        return {x, y};
    }

    getWorldXYFromTileXY(tileXY: XY): XY {
        const {x, y} = this._groundLayer.tileToWorldXY(tileXY.x, tileXY.y);
        return {x, y};
    }

    private _drawTiles(): void {
        const tileset: Phaser.Tilemaps.Tileset = this.addTilesetImage('tiles', 'map-tiles', this.tileWidth, this.tileHeight, 0, 0);
        this._groundLayer = this.createBlankLayer('ground', tileset);
        this._groundLayer.setDepth(WarGame.DEPTH.MIDGROUND);
        const grid = this.tileManager.grid;
        for (let y=0; y<grid.length; y++) {
            for (let x=0; x<grid[y].length; x++) {
                let t = grid[y][x];
                if (t) {
                    this._groundLayer.putTileAt(Number(t.terrain), x, y);
                }
            }
        }
        this._groundLayer.setCollisionByExclusion([0, 1, 2, 3, 4, 5, 6, 7]);
        this._groundLayer.setPosition(-(this._groundLayer.width / 2), -(this._groundLayer.height / 2));
        this._groundLayer.setInteractive();
    }
}