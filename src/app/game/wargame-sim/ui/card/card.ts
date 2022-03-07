import { Constants } from "../../utils/constants";
import { LayoutManager } from "../layout/layout-manager";
import { LayoutManagerOptions } from "../layout/layout-manager-options";
import { CardBody } from "./card-body";
import { CardHeader } from "./card-header";
import { CardImage } from "./card-image";
import { CardOptions } from "./card-options";

export class Card extends LayoutManager {
    private _header: CardHeader;
    private _image: CardImage;
    private _body: CardBody;

    constructor(options: CardOptions) {
        const opts: LayoutManagerOptions = {
            scene: options.scene,
            x: options.x,
            y: options.y,
            orientation: 'vertical'
        }
        super(opts);
        this._createGameObject(options);
        this.setDepth(Constants.DEPTH_MENU);
    }

    get header(): CardHeader {
        return this._header;
    }

    get image(): CardImage {
        return this._image;
    }

    get cardBody(): CardBody {
        return this._body;
    }

    private _createGameObject(options: CardOptions): void {
        if (!options.width) { options.width = this.scene.game.canvas.width; }
        this._createHeader(options);
        this._createImage(options);
        this._createBody(options);
        this._createDebug(options);
    }

    private _createHeader(options: CardOptions): void {
        if (options.header) {
            if (!options.header.width) { options.header.width = options.width; }
            if (!options.header.scene) { options.header.scene = options.scene; }
            this._header = new CardHeader(options.header);
            this.addContents(this._header);
        }
    }

    private _createImage(options: CardOptions): void {
        if (options.image) {
            if (!options.image.width) { options.image.width = options.width; }
            if (!options.image.scene) { options.image.scene = options.scene; }
            this._image = new CardImage(options.image);
            this.addContents(this._image);
        }
    }

    private _createBody(options: CardOptions): void {
        if (options.body) {
            if (!options.body.width) { options.body.width = options.width; }
            if (!options.body.scene) { options.body.scene = options.scene; }
            this._body = new CardBody(options.body);
            this.addContents(this._body);
        }
    }

    private _createDebug(options: CardOptions): void {
        if (options.debug) {
            const debugBox = this.scene.add.graphics({lineStyle: {color: 0xfc03e8, alpha: 1, width: 1}});
            debugBox.strokeRect(-(options.width / 2), -(this.height / 2), options.width, this.height);
            this.add(debugBox);
            this.bringToTop(debugBox);

            const debugText = this.scene.add.text(0, 0, `w:${options.width.toFixed(1)};h:${this.height.toFixed(1)}`, { 
                font: '40px Courier', 
                color: '#fc03e8'
            });
            debugText.setOrigin(0.5);
            debugText.setDepth(1000);
            debugText.setVisible(false);
            this.setInteractive().on(Phaser.Input.Events.POINTER_OVER, (pointer: Phaser.Input.Pointer) => {
                debugText.setVisible(true);
            }, this).on(Phaser.Input.Events.POINTER_OUT, () => {
                debugText.setVisible(false);
            });
        }
    }
}