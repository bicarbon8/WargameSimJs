import { Constants } from "../../utils/constants";
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
            this.emit(Constants.CAMERA_ZOOM_EVENT);
            let zoom: number = this.scene.cameras.main.zoom;
            this.scene.cameras.main.setZoom(zoom + deltaZ * -0.001);
        }, this);
    }

    private _setupKeyBindings(): void {
        this._cameraUpKey = this.scene.input.keyboard.addKey('W', true, true);
        this._cameraUpKey.on(Phaser.Input.Keyboard.Events.DOWN, () => {
            this.emit(Constants.CAMERA_MOVE_START_EVENT);
        }, this).on(Phaser.Input.Keyboard.Events.UP, () => {
            if (!this._cameraUpKey.isDown && !this._cameraDownKey.isDown && !this._cameraLeftKey.isDown && !this._cameraRightKey.isDown) {
                this.emit(Constants.CAMERA_MOVE_END_EVENT);
            }
        });
        this._cameraDownKey = this.scene.input.keyboard.addKey('S', true, true);
        this._cameraDownKey.on(Phaser.Input.Keyboard.Events.DOWN, () => {
            this.emit(Constants.CAMERA_MOVE_START_EVENT);
        }, this).on(Phaser.Input.Keyboard.Events.UP, () => {
            if (!this._cameraUpKey.isDown && !this._cameraDownKey.isDown && !this._cameraLeftKey.isDown && !this._cameraRightKey.isDown) {
                this.emit(Constants.CAMERA_MOVE_END_EVENT);
            }
        });
        this._cameraLeftKey = this.scene.input.keyboard.addKey('A', true, true);
        this._cameraLeftKey.on(Phaser.Input.Keyboard.Events.DOWN, () => {
            this.emit(Constants.CAMERA_MOVE_START_EVENT);
        }, this).on(Phaser.Input.Keyboard.Events.UP, () => {
            if (!this._cameraUpKey.isDown && !this._cameraDownKey.isDown && !this._cameraLeftKey.isDown && !this._cameraRightKey.isDown) {
                this.emit(Constants.CAMERA_MOVE_END_EVENT);
            }
        });
        this._cameraRightKey = this.scene.input.keyboard.addKey('D', true, true);
        this._cameraRightKey.on(Phaser.Input.Keyboard.Events.DOWN, () => {
            this.emit(Constants.CAMERA_MOVE_START_EVENT);
        }, this).on(Phaser.Input.Keyboard.Events.UP, () => {
            if (!this._cameraUpKey.isDown && !this._cameraDownKey.isDown && !this._cameraLeftKey.isDown && !this._cameraRightKey.isDown) {
                this.emit(Constants.CAMERA_MOVE_END_EVENT);
            }
        });

        this.scene.input.keyboard.enableGlobalCapture();

        this.game.canvas.oncontextmenu = (e) => {
            e.preventDefault();
        }
    }

    private _handleCameraScroll(): void {
        const zoom: number = this.scene.cameras.main.zoom;
        if (this._cameraLeftKey.isDown) {
            this.scene.cameras.main.scrollX -= Constants.CAMERA_SCROLL_SPEED / zoom;
        }
        if (this._cameraRightKey.isDown) {
            this.scene.cameras.main.scrollX += Constants.CAMERA_SCROLL_SPEED / zoom;
        }
        if (this._cameraUpKey.isDown) {
            this.scene.cameras.main.scrollY -= Constants.CAMERA_SCROLL_SPEED / zoom;
        }
        if (this._cameraDownKey.isDown) {
            this.scene.cameras.main.scrollY += Constants.CAMERA_SCROLL_SPEED / zoom;
        }
    }
}