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
    private _row: number;
    private _column: number;
    private _padding: number;
    private _alignment: Alignment;
    private _background: Phaser.GameObjects.Graphics;
    private _content: LayoutContent;
    private _debug: boolean;
    private _debugText: Phaser.GameObjects.Text;
    
    constructor(options: GridCellOptions) {
        super(options.scene, options.x, options.y);
        this.id = Rand.guid();
        this._row = options.row || 0;
        this._column = options.column || 0;
        this._padding = options.padding || 0;
        this._debug = options.debug;
        const width: number = options.width || 0;
        const height: number = options.height || 0;
        this.updateSize(width, height);
        this.setBackground(options.style);
        this.setContent(options);
        if (this._debug) {
            this._displayDebugInfo();
        }
    }

    get row(): number {
        return this._row;
    }

    get column(): number { 
        return this._column;
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

    get content(): LayoutContent {
        return this._content;
    }

    contentAs<T extends LayoutContent>(): T {
        return this.content as T;
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
        if (this.content) {
            // TODO: update contents scale and position
        }
    }

    setContent(options: GridCellOptions): void {
        if (options.content) {
            if (this._content) { this.remove(this._content); } // remove previous contents
            this._content = options.content;
            this.setContentScale(options.scaleToFit, options.keepAspectRatio);
            this.setContentPosition(options.alignment);
            this.add(this._content);
            this.bringToTop(this._content);
            if (this._debug) {
                this._displayDebugInfo();
            }
        }
    }

    setBackground(style: Phaser.Types.GameObjects.Graphics.Styles): void {
        if (style || this._debug) {
            if (this._background) { 
                this.remove(this._background);
                this._background.destroy();
                this._background = null;
            }
            style = style || {
                lineStyle: {
                    width: 1,
                    color: 0xfc03e8,
                    alpha: 1
                }
            };
            this._background = this.scene.add.graphics(style);
            this.add(this._background);
            if (style?.fillStyle) {this._background.fillRect(this.left, this.top, this.width, this.height);}
            if (style?.lineStyle || this._debug) {this._background.strokeRect(this.left, this.top, this.width, this.height);}
            this.sendToBack(this._background);
        }
    }

    setContentScale(scaleToFit: boolean = true, keepAspectRatio: boolean = true): void {
        this._scaleToFit = scaleToFit;
        this._keepAspectRatio = keepAspectRatio;
        if (this.content) {
            const width: number = this.content.width;
            const height: number = this.content.height;
            if (this._scaleToFit && (width > (this.width - (this._padding * 2)) || height > (this.height - (this._padding * 2)))) {
                const scaleX: number = (this.width - (this._padding * 2)) / width;
                const scaleY: number = (this.height - (this._padding * 2)) / height;
                if (this._keepAspectRatio) {
                    const scale: number = (scaleX < scaleY) ? scaleX : scaleY;
                    this.content.setScale(scale);    
                } else {
                    this.content.setScale(scaleX, scaleY);
                }
            } else {
                this.content.setScale(1);
            }
        }
    }

    setContentPosition(alignment: Alignment): void {
        this._alignment = alignment;
        if (this.content) {
            if (!(this.content instanceof Phaser.GameObjects.Container)) { this.content.setOrigin(0.5, 0.5); }
            switch(this.alignment?.horizontal) {
                case 'right':
                    this.content.setX(this.right - this._padding - ((this.content.width * this.content.scaleX) / 2));
                    break;
                case 'right':
                    this.content.setX(this.left + this._padding + ((this.content.width * this.content.scaleX) / 2));
                    break;
                case 'centre':
                default:
                    this.content.setX(0);
                    break;
            }
            switch(this.alignment?.vertical) {
                case 'bottom':
                    this.content.setY(this.bottom - this._padding - ((this.content.height * this.content.scaleY) / 2));
                    break;
                case 'top':
                    this.content.setY(this.top + this._padding + ((this.content.height * this.content.scaleY) / 2));
                    break;
                case 'middle':
                default:
                    this.content.setY(0);
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