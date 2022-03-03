import { CardHeaderOptions } from "./card-header-options";

export class CardHeader extends Phaser.GameObjects.Container {
    private readonly PADDING: number = 5;
    private _text: Phaser.GameObjects.Text;
    private _background: Phaser.GameObjects.Container;
    
    constructor(options: CardHeaderOptions) {
        super(options.scene, options.x, options.y);
        this._createGameObject(options);
    }

    get text(): Phaser.GameObjects.Text {
        return this._text;
    }

    get background(): Phaser.GameObjects.Container {
        return this._background;
    }

    private _createGameObject(options: CardHeaderOptions): void {
        const text: string = options.text;
        const bgColour: number = options.backgroundColor;
        
        if (text) {
            const textStyle: Phaser.Types.GameObjects.Text.TextStyle = options.textStyle || { 
                font: '20px Courier', 
                color: '#000000',
                align: 'center'
            };
            const headerText: Phaser.GameObjects.Text = this.scene.add.text(this.PADDING, this.PADDING, text, textStyle);
            const width: number = headerText.width + (this.PADDING * 2);
            if (width > options.width) {
                const scaleX: number = options.width / width;
                headerText.setScale(scaleX);
            }
            this._text = headerText;
            this.add(headerText);
        }
        const textHeight: number = this._text?.height || 20;
        const height: number = textHeight + (this.PADDING * 2);
        if (bgColour) {
            const cornerRadius: number = options.cornerRadius || 0;
            this._background = this.scene.add.container(0, 0);
            const headerBackgroundTop: Phaser.GameObjects.Graphics = this.scene.add.graphics({fillStyle: {color: bgColour}});
            headerBackgroundTop.fillRoundedRect(0, 0, options.width, height, cornerRadius);
            this._background.add(headerBackgroundTop);
            const headerBackgroundBottom: Phaser.GameObjects.Graphics = this.scene.add.graphics({fillStyle: {color: bgColour}});
            headerBackgroundBottom.fillRect(0, height - cornerRadius, options.width, cornerRadius);
            this._background.add(headerBackgroundBottom);
            this.add(this._background);
            this.sendToBack(this._background);
        }
        this.setSize(options.width, height);
    }
}