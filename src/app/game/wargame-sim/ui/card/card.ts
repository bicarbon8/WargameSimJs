import { Constants } from "../../utils/constants";
import { CardBody } from "./card-body";
import { CardHeader } from "./card-header";
import { CardImage } from "./card-image";
import { CardOptions } from "./card-options";

export class Card extends Phaser.GameObjects.Container {
    private _header: CardHeader;
    private _image: CardImage;
    private _body: CardBody;

    constructor(options: CardOptions) {
        super(options.scene, options.x, options.y);
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
        if (!options.height) { options.height = this.scene.game.canvas.height; }
        this._createHeader(options);
        this._createImage(options);
        this._createBody(options);
    }

    private _createHeader(options: CardOptions): void {
        if (options.header) {
            if (!options.header.width) { options.header.width = options.width; }
            if (!options.header.scene) { options.header.scene = options.scene; }
            this._header = new CardHeader(options.header);
            this.add(this._header);
        }
    }

    private _createImage(options: CardOptions): void {
        if (options.image) {
            if (!options.image.width) { options.image.width = options.width; }
            if (!options.image.scene) { options.image.scene = options.scene; }
            if (this.header && !options.image.y) { options.image.y = this.header.height; }
            this._image = new CardImage(options.image);
            this.add(this._image);
        }
    }

    private _createBody(options: CardOptions): void {
        if (options.body) {
            if (!options.body.width) { options.body.width = options.width; }
            if (!options.body.scene) { options.body.scene = options.scene; }
            if ((this.header || this.image) && !options.body.y) { 
                let offsetY: number = this.header?.height || 0;
                offsetY += this.image?.height || 0;
                options.body.y = offsetY;
            }
            this._body = new CardBody(options.body);
            this.add(this._body);
        }
    }
}