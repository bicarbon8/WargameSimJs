import { Logging } from "../../utils/logging";
import { WarGame } from "../../war-game";
import { GameBoard } from "../game-board/game-board";
import { InputController } from "./input-controller";

export type KBMControllerOptions = {
    gameboard: GameBoard;
};

export class KBMController extends InputController {
    private _cameraUpKey: Phaser.Input.Keyboard.Key;
    private _cameraDownKey: Phaser.Input.Keyboard.Key;
    private _cameraLeftKey: Phaser.Input.Keyboard.Key;
    private _cameraRightKey: Phaser.Input.Keyboard.Key;

    readonly gameboard: GameBoard;
    
    constructor(scene: Phaser.Scene, options: KBMControllerOptions) {
        super(scene);
        this.gameboard = options.gameboard;

        this._setupMouseBindings();
        this._setupKeyBindings();
    }

    update(time: number, delta: number): void {
        if (this.active) {
            this._handleCameraScroll();
        }
    }

    private _setupMouseBindings(): void {
        // Zoom Camera
        this.scene.input.on(Phaser.Input.Events.POINTER_WHEEL, (pointer: Phaser.Input.Pointer, deltaX: number, deltaY: number, deltaZ: number) => {
            WarGame.evtMgr.notify(WarGame.EVENTS.CAMERA_ZOOM, deltaZ * -0.001);
            const zoom: number = this.scene.cameras.main.zoom;
            let newZoom: number = zoom + (deltaZ * -0.001);
            if (newZoom > WarGame.CONSTANTS.MAX_ZOOM) { newZoom = WarGame.CONSTANTS.MAX_ZOOM; }
            if (newZoom < WarGame.CONSTANTS.MIN_ZOOM) { newZoom = WarGame.CONSTANTS.MIN_ZOOM; }
            this.scene.cameras.main.setZoom(newZoom);
        }, this);

        this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            const tileXY = this.gameboard.getTileXYFromCameraXY(pointer);
            WarGame.evtMgr.notify(WarGame.EVENTS.POINTER_DOWN, tileXY);
        }).on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) => {
            const tileXY = this.gameboard.getTileXYFromCameraXY(pointer);
            WarGame.evtMgr.notify(WarGame.EVENTS.POINTER_UP, tileXY);
        }).on(Phaser.Input.Events.POINTER_OVER, (pointer: Phaser.Input.Pointer) => {
            const tileXY = this.gameboard.getTileXYFromCameraXY(pointer);
            WarGame.evtMgr.notify(WarGame.EVENTS.POINTER_OVER, tileXY);
        }).on(Phaser.Input.Events.POINTER_OUT, (pointer: Phaser.Input.Pointer) => {
            const tileXY = this.gameboard.getTileXYFromCameraXY(pointer);
            WarGame.evtMgr.notify(WarGame.EVENTS.POINTER_OUT, tileXY);
        }).on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            const tileXY = this.gameboard.getTileXYFromCameraXY(pointer);
            WarGame.evtMgr.notify(WarGame.EVENTS.POINTER_MOVE, tileXY);
        });
    }

    private _setupKeyBindings(): void {
        this._cameraUpKey = this.scene.input.keyboard.addKey('W', true, true);
        this._cameraUpKey.on(Phaser.Input.Keyboard.Events.DOWN, () => {
            WarGame.evtMgr.notify(WarGame.EVENTS.CAMERA_MOVE_START);
        }, this).on(Phaser.Input.Keyboard.Events.UP, () => {
            if (!this._cameraUpKey.isDown && !this._cameraDownKey.isDown && !this._cameraLeftKey.isDown && !this._cameraRightKey.isDown) {
                WarGame.evtMgr.notify(WarGame.EVENTS.CAMERA_MOVE_END);
            }
        });
        this._cameraDownKey = this.scene.input.keyboard.addKey('S', true, true);
        this._cameraDownKey.on(Phaser.Input.Keyboard.Events.DOWN, () => {
            WarGame.evtMgr.notify(WarGame.EVENTS.CAMERA_MOVE_START);
        }, this).on(Phaser.Input.Keyboard.Events.UP, () => {
            if (!this._cameraUpKey.isDown && !this._cameraDownKey.isDown && !this._cameraLeftKey.isDown && !this._cameraRightKey.isDown) {
                WarGame.evtMgr.notify(WarGame.EVENTS.CAMERA_MOVE_END);
            }
        });
        this._cameraLeftKey = this.scene.input.keyboard.addKey('A', true, true);
        this._cameraLeftKey.on(Phaser.Input.Keyboard.Events.DOWN, () => {
            WarGame.evtMgr.notify(WarGame.EVENTS.CAMERA_MOVE_START);
        }, this).on(Phaser.Input.Keyboard.Events.UP, () => {
            if (!this._cameraUpKey.isDown && !this._cameraDownKey.isDown && !this._cameraLeftKey.isDown && !this._cameraRightKey.isDown) {
                WarGame.evtMgr.notify(WarGame.EVENTS.CAMERA_MOVE_END);
            }
        });
        this._cameraRightKey = this.scene.input.keyboard.addKey('D', true, true);
        this._cameraRightKey.on(Phaser.Input.Keyboard.Events.DOWN, () => {
            WarGame.evtMgr.notify(WarGame.EVENTS.CAMERA_MOVE_START);
        }, this).on(Phaser.Input.Keyboard.Events.UP, () => {
            if (!this._cameraUpKey.isDown && !this._cameraDownKey.isDown && !this._cameraLeftKey.isDown && !this._cameraRightKey.isDown) {
                WarGame.evtMgr.notify(WarGame.EVENTS.CAMERA_MOVE_END);
            }
        });

        this.scene.input.keyboard.enableGlobalCapture();
    }

    private _handleCameraScroll(): void {
        const zoom: number = this.scene.cameras.main.zoom;
        if (this._cameraLeftKey.isDown) {
            this.scene.cameras.main.scrollX -= WarGame.TIMING.CAMERA_SCROLL_SPEED / zoom;
        }
        if (this._cameraRightKey.isDown) {
            this.scene.cameras.main.scrollX += WarGame.TIMING.CAMERA_SCROLL_SPEED / zoom;
        }
        if (this._cameraUpKey.isDown) {
            this.scene.cameras.main.scrollY -= WarGame.TIMING.CAMERA_SCROLL_SPEED / zoom;
        }
        if (this._cameraDownKey.isDown) {
            this.scene.cameras.main.scrollY += WarGame.TIMING.CAMERA_SCROLL_SPEED / zoom;
        }
    }
}