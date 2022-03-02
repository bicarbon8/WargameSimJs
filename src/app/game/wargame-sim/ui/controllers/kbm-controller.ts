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
        // Move Camera around
        this.scene.input.on(Phaser.Input.Events.POINTER_MOVE, function (p: Phaser.Input.Pointer) {
            // console.info(`pointer: ${p.x.toFixed(0)},${p.y.toFixed(0)}`);
            if (p.x <= 50) {
                this._cameraScrollX = -2
            } else if (p.x >= this.scene.game.canvas.width - 50) {
                this._cameraScrollX = 2;
            } else {
                this._cameraScrollX = 0;
            }
            if (p.y <= 50) {
                this._cameraScrollY = -2;
            } else if (p.y >= this.scene.game.canvas.height - 50) {
                this._cameraScrollY = 2;
            } else {
                this._cameraScrollY = 0;
            }
        }, this);

        // Zoom Camera
        this.scene.input.on(Phaser.Input.Events.POINTER_WHEEL, (pointer: Phaser.Input.Pointer, deltaX: number, deltaY: number, deltaZ: number) => {
            let zoom: number = this.scene.cameras.main.zoom;
            // console.info(`mouse wheel X: ${deltaX}, Y: ${deltaY}, Z: ${deltaZ}`);
            this.scene.cameras.main.setZoom(zoom + deltaZ * -0.001);
        }, this);

        this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            let loc: Phaser.Math.Vector2 = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            console.info(`pointer down at: ${loc.x.toFixed(0)}, ${loc.y.toFixed(0)}`);
        }, this);
    }

    private _setupKeyBindings(): void {
        this._cameraUpKey = this.scene.input.keyboard.addKey('W', true, true);
        this._cameraDownKey = this.scene.input.keyboard.addKey('S', true, true);
        this._cameraLeftKey = this.scene.input.keyboard.addKey('A', true, true);
        this._cameraRightKey = this.scene.input.keyboard.addKey('D', true, true);

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