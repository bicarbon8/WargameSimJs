import { Constants } from "../../utils/constants";
import { UIGameMapOptions } from "./ui-game-map-options";

export class UIGameMap {
    private _scene: Phaser.Scene;
    private _layer: Phaser.Tilemaps.TilemapLayer;
    private _tileMap: Phaser.Tilemaps.Tilemap;

    constructor(options: UIGameMapOptions) {
        this._scene = options.scene;
        this._createGameObj(options);
    }

    getGameObject(): Phaser.Tilemaps.TilemapLayer {
        return this._layer;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        return this._layer.body as Phaser.Physics.Arcade.Body;
    }

    private _createGameObj(options: UIGameMapOptions): void {
        this._tileMap = this._scene.make.tilemap({
            tileWidth: 32,
            tileHeight: 32,
            width: options.width || 500,
            height: options.height || 500
        });

        let tileset: Phaser.Tilemaps.Tileset = this._tileMap.addTilesetImage('tiles', 'map-tiles', 32, 32, 0, 0);
        this._layer = this._tileMap.createBlankLayer('Map Layer', tileset);
        this._layer.setDepth(options.layerDepth || Constants.DEPTH_PLAYER);

        options.tiles.forEach((gridItem) => {
            if (gridItem) {
                this._layer.putTileAt(gridItem.terrain, gridItem.x, gridItem.y);
            }
        });

        this._layer.setCollisionByExclusion([-1, 0, 7]);
    }

    getMapTileWorldLocation(tilePositionX: number, tilePositionY: number): Phaser.Math.Vector2 {
        return this._tileMap.tileToWorldXY(tilePositionX, tilePositionY);
    }

    getLayer(): Phaser.Tilemaps.TilemapLayer {
        return this._layer;
    }
}