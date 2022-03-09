import { Rand } from "../../utils/rand";
import { Alignment } from "./alignment";
import { LayoutContent } from "./layout-content";
import { GridCellOptions } from "./grid-cell-options";

export class GridCell extends Phaser.GameObjects.Container {
    public readonly id: string;

    private _scaleToFit: boolean;
    private _keepAspectRatio: boolean;
    private _top: number;
    private _bottom: number;
    private _left: number;
    private _right: number;
    private _alignment: Alignment;
    private _background: Phaser.GameObjects.Graphics;
    private _contents: LayoutContent;
    private _debug: boolean;
    private _debugText: Phaser.GameObjects.Text;
    
    constructor(options: GridCellOptions) {
        super(options.scene, options.x, options.y);
        this.id = options.id || Rand.guid();
        this._debug = options.debug;
        const width: number = options.width || 0;
        const height: number = options.height || 0;
        this.updateSize(width, height);
        this.setBackground(options.backgroundColor, options.backgroundAlpha, options.border, options.borderColor, options.borderAlpha);
        this.setContent(options);
        if (this._debug) {
            this._displayDebugInfo();
        }
    }

    get top(): number {
        return this._top;
    }

    get bottom(): number {
        return this._bottom;
    }

    get left(): number {
        return this._left;
    }

    get right(): number {
        return this._right;
    }

    get alignment(): Alignment {
        this._alignment = this._alignment || {horizontal: 'centre', vertical: 'middle'};
        this._alignment.horizontal = this._alignment.horizontal || 'centre';
        this._alignment.vertical = this._alignment.vertical || 'middle';
        return this._alignment;
    }

    get contents(): LayoutContent {
        return this._contents;
    }

    get background(): Phaser.GameObjects.Graphics {
        return this._background;
    }

    updateSize(width: number, height: number): void {
        this.setSize(width, height);
        this._top = -(height / 2);
        this._bottom = (height / 2);
        this._left = -(width / 2);
        this._right = (width / 2);
        if (this.background) {
            // TODO: update background size and position
        }
        if (this.contents) {
            // TODO: update contents scale and position
        }
    }

    setContent(options: GridCellOptions): void {
        if (options.content) {
            if (this._contents) { this.remove(this._contents); } // remove previous contents
            this._contents = options.content;
            this.setContentsScale(options.scaleToFit, options.keepAspectRatio);
            this.setContentsPosition(this._alignment);
            this.add(this._contents);
            this.bringToTop(this._contents);
            if (this._debug) {
                this._displayDebugInfo();
            }
        }
    }

    setBackground(backgroundColor: number, backgroundAlpha: number, border: number, borderColor: number, borderAlpha: number): void {
        if (this._background) { 
            this.remove(this._background);
            this._background.destroy();
            this._background = null;
        }
        this._background = this.scene.add.graphics({fillStyle: {
            color: backgroundColor || 0x000000,
            alpha: backgroundAlpha || 0
        }, lineStyle: {
            width: border || (this._debug) ? 1 : 0,
            color: borderColor || (this._debug) ? 0xfc03e8 : 0x000000,
            alpha: borderAlpha || (this._debug) ? 1 : 0
        }});
        this.add(this._background);
        this._background.fillRect(this.left, this.top, this.width, this.height);
        this._background.strokeRect(this.left, this.top, this.width, this.height);
        this.sendToBack(this._background);
    }

    setContentsScale(scaleToFit: boolean = true, keepAspectRatio: boolean = true): void {
        this._scaleToFit = scaleToFit;
        this._keepAspectRatio = keepAspectRatio;
        if (this.contents) {
            const width: number = this.contents.width;
            const height: number = this.contents.height;
            if (this._scaleToFit && (width > this.width || height > this.height)) {
                const scaleX: number = this.width / width;
                const scaleY: number = this.height / height;
                if (this._keepAspectRatio) {
                    const scale: number = (scaleX < scaleY) ? scaleX : scaleY;
                    this.contents.setScale(scale);    
                } else {
                    this.contents.setScale(scaleX, scaleY);
                }
            } else {
                this.contents.setScale(1);
            }
        }
    }

    setContentsPosition(alignment: Alignment): void {
        this._alignment = alignment;
        if (this.contents) {
            if (!(this.contents instanceof Phaser.GameObjects.Container)) { this.contents.setOrigin(0.5, 0.5); }
            switch(this.alignment.horizontal) {
                case 'right':
                    this.contents.setX(this.width - ((this.contents.width * this.contents.scaleX) / 2));
                    break;
                case 'right':
                    this.contents.setX((this.contents.width * this.contents.scaleX) / 2);
                    break;
                case 'centre':
                default:
                    this.contents.setX(0);
                    break;
            }
            switch(this.alignment.vertical) {
                case 'bottom':
                    this.contents.setY(this.height - ((this.contents.height * this.contents.scaleY) / 2));
                    break;
                case 'top':
                    this.contents.setY((this.contents.height * this.contents.scaleY) / 2);
                    break;
                case 'middle':
                default:
                    this.contents.setY(0);
                    break;
            }
        }
    }

    private _displayDebugInfo(): void {
        if (this._debugText) { 
            this.remove(this._debugText);
            this._debugText.destroy();
            this._debugText = null;
        }
        this._debugText = this.scene.add.text(0, 0, this.id, { 
            font: '40px Courier', 
            color: '#fc03e8'
        });
        this._debugText.setOrigin(0.5);
        const width: number = (this._debugText.width * 1.5);
        const dist: number = Phaser.Math.Distance.BetweenPoints(new Phaser.Math.Vector2(-(this.width / 2), (this.height / 2)), new Phaser.Math.Vector2((this.width / 2), -(this.height / 2)));
        const scale: number = dist / width;
        this._debugText.setScale(scale);
        const angle: number = Phaser.Math.Angle.BetweenPoints(new Phaser.Math.Vector2(-(this.width / 2), (this.height / 2)), new Phaser.Math.Vector2((this.width / 2), -(this.height / 2)));
        this._debugText.setRotation(angle);
        this.add(this._debugText);
        this.bringToTop(this._debugText);
    }
}