import { Constants } from "../../utils/constants";
import { Helpers } from "../../utils/helpers";
import { LayoutManager } from "../layout/layout-manager";
import { LayoutManagerOptions } from "../layout/layout-manager-options";
import { CardBody } from "./card-body";
import { CardBodyOptions } from "./card-body-options";
import { CardHeader } from "./card-header";
import { CardHeaderOptions } from "./card-header-options";
import { CardImage } from "./card-image";
import { CardImageOptions } from "./card-image-options";
import { CardOptions } from "./card-options";

export class Card extends LayoutManager {
    private readonly _options: CardOptions;
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
        this._options = options;
        this._createGameObject(options);
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
        this.setHeader(options.header);
        this.setImage(options.image);
        this.setBody(options.body);
        this._createDebug(options.debug);
    }

    setHeader(options?: CardHeaderOptions): void {
        if (this._header) {
            this._header.destroy();
            this._header = null;
        }
        if (options) {
            options.width = options.width || this._options.width;
            options.scene = options.scene || this._options.scene;
            this._header = new CardHeader(options);
            this._options.width = this._options.width || this._header.width;
            this.addContents(this._header);
        } else {
            this.layout();
        }
    }

    setImage(options?: CardImageOptions): void {
        if (this._image) {
            this._image.destroy();
            this._image = null;
        }
        if (options) {
            options.width = options.width || this._options.width;
            options.scene = options.scene || this._options.scene;
            this._image = new CardImage(options);
            this._options.width = this._options.width || this._image.width;
            this.addContents(this._image);
        } else {
            this.layout();
        }
    }

    setBody(options: CardBodyOptions): void {
        if (this._body) {
            this._body.destroy();
            this._body = null;
        }
        if (options) {
            options.width = options.width || this._options.width;
            options.scene = options.scene || this._options.scene;
            this._body = new CardBody(options);
            this._options.width = this._options.width || this._body.width;
            this.addContents(this._body);
        } else {
            this.layout();
        }
    }

    private _createDebug(enabled?: boolean): void {
        if (enabled) {
            const debugBox = this.scene.add.graphics({lineStyle: {color: 0xfc03e8, alpha: 1, width: 1}});
            debugBox.strokeRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
            this.add(debugBox);
            this.bringToTop(debugBox);
            Helpers.displayDebug(this.scene, this, 'Card');
        }
    }
}