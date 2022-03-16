import { WarGame } from "../../war-game";
import { InputController } from "./input-controller";

export class KBMController extends InputController {
    private _cameraUpKey: Phaser.Input.Keyboard.Key;
    private _cameraDownKey: Phaser.Input.Keyboard.Key;
    private _cameraLeftKey: Phaser.Input.Keyboard.Key;
    private _cameraRightKey: Phaser.Input.Keyboard.Key;
    
    constructor(scene: Phaser.Scene) {
        super(scene);

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
            this.emit(WarGame.EVENTS.CAMERA_ZOOM, deltaZ * -0.001);
            const zoom: number = this.scene.cameras.main.zoom;
            let newZoom: number = zoom + (deltaZ * -0.001);
            if (newZoom > WarGame.CONSTANTS.MAX_ZOOM) { newZoom = WarGame.CONSTANTS.MAX_ZOOM; }
            if (newZoom < WarGame.CONSTANTS.MIN_ZOOM) { newZoom = WarGame.CONSTANTS.MIN_ZOOM; }
            this.scene.cameras.main.setZoom(newZoom);
        }, this);
    }

    private _setupKeyBindings(): void {
        this._cameraUpKey = this.scene.input.keyboard.addKey('W', true, true);
        this._cameraUpKey.on(Phaser.Input.Keyboard.Events.DOWN, () => {
            this.emit(WarGame.EVENTS.CAMERA_MOVE_START);
        }, this).on(Phaser.Input.Keyboard.Events.UP, () => {
            if (!this._cameraUpKey.isDown && !this._cameraDownKey.isDown && !this._cameraLeftKey.isDown && !this._cameraRightKey.isDown) {
                this.emit(WarGame.EVENTS.CAMERA_MOVE_END);
            }
        });
        this._cameraDownKey = this.scene.input.keyboard.addKey('S', true, true);
        this._cameraDownKey.on(Phaser.Input.Keyboard.Events.DOWN, () => {
            this.emit(WarGame.EVENTS.CAMERA_MOVE_START);
        }, this).on(Phaser.Input.Keyboard.Events.UP, () => {
            if (!this._cameraUpKey.isDown && !this._cameraDownKey.isDown && !this._cameraLeftKey.isDown && !this._cameraRightKey.isDown) {
                this.emit(WarGame.EVENTS.CAMERA_MOVE_END);
            }
        });
        this._cameraLeftKey = this.scene.input.keyboard.addKey('A', true, true);
        this._cameraLeftKey.on(Phaser.Input.Keyboard.Events.DOWN, () => {
            this.emit(WarGame.EVENTS.CAMERA_MOVE_START);
        }, this).on(Phaser.Input.Keyboard.Events.UP, () => {
            if (!this._cameraUpKey.isDown && !this._cameraDownKey.isDown && !this._cameraLeftKey.isDown && !this._cameraRightKey.isDown) {
                this.emit(WarGame.EVENTS.CAMERA_MOVE_END);
            }
        });
        this._cameraRightKey = this.scene.input.keyboard.addKey('D', true, true);
        this._cameraRightKey.on(Phaser.Input.Keyboard.Events.DOWN, () => {
            this.emit(WarGame.EVENTS.CAMERA_MOVE_START);
        }, this).on(Phaser.Input.Keyboard.Events.UP, () => {
            if (!this._cameraUpKey.isDown && !this._cameraDownKey.isDown && !this._cameraLeftKey.isDown && !this._cameraRightKey.isDown) {
                this.emit(WarGame.EVENTS.CAMERA_MOVE_END);
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