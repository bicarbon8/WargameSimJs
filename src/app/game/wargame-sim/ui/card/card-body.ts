import { TextButton } from "../buttons/text-button";
import { TextButtonOptions } from "../buttons/text-button-options";
import { CardBodyOptions } from "./card-body-options";

export class CardBody extends Phaser.GameObjects.Container {
    private readonly PADDING: number = 5;
    private _title: Phaser.GameObjects.Text;
    private _description: Phaser.GameObjects.Text;
    private _buttons: TextButton[];
    private _background: Phaser.GameObjects.Container;

    constructor(options: CardBodyOptions) {
        super(options.scene, options.x, options.y);
        this._buttons = [];
        this._createGameObject(options);
    }

    get title(): Phaser.GameObjects.Text {
        return this._title;
    }

    get description(): Phaser.GameObjects.Text {
        return this._description;
    }

    get buttons(): TextButton[] {
        return this._buttons;
    }

    get background(): Phaser.GameObjects.Container {
        return this._background;
    }

    private _createGameObject(options: CardBodyOptions): void {
        const title: string = options.title;
        const description: string = options.description;
        const buttons: TextButtonOptions[] = options.buttons;
        const bgColour: number = options.backgroundColor;
        
        let offsetY: number = this.PADDING;
        if (title) {
            const titleStyle: Phaser.Types.GameObjects.Text.TextStyle = options.titleStyle || { 
                font: '30px Courier', 
                color: '#000000',
            };
            const titleText: Phaser.GameObjects.Text = this.scene.add.text(this.PADDING, offsetY, title, titleStyle);
            const availableWidth: number = options.width - (this.PADDING * 2);
            let scaleX: number = 1;
            if (availableWidth < titleText.width) {
                scaleX = availableWidth / titleText.width;
                titleText.setScale(scaleX);
            }
            this._title = titleText;
            this.add(titleText);
            offsetY += (titleText.height * scaleX) + this.PADDING;
        }
        if (description) {
            const descStyle: Phaser.Types.GameObjects.Text.TextStyle = options.titleStyle || { 
                font: '20px Courier', 
                color: '#000000',
            };
            const descText: Phaser.GameObjects.Text = this.scene.add.text(this.PADDING, offsetY, description, descStyle);
            const availableWidth: number = options.width - (this.PADDING * 2);
            let scaleX: number = 1;
            if (availableWidth < descText.width) {
                scaleX = availableWidth / descText.width;
                descText.setScale(scaleX);
            }
            this._description = descText;
            this.add(descText);
            offsetY += (descText.height * scaleX) + this.PADDING;
        }
        if (buttons) {
            const buttonsContainer: Phaser.GameObjects.Container = this.scene.add.container(0, offsetY);
            const buttonSpacing: number = options.buttonSpacing || 0;
            let buttonsMaxHeight: number = 0;
            let createdWidths: number = 0;
            for (var i=0; i<buttons.length; i++) {
                let opts: TextButtonOptions = buttons[i];
                opts.scene = this.scene;
                opts.x = createdWidths;
                opts.y = 0;
                let button: TextButton = new TextButton(opts);
                buttonsContainer.add(button);
                createdWidths += button.width + buttonSpacing;
                buttonsMaxHeight = (buttonsMaxHeight < button.height) ? button.height : buttonsMaxHeight;
                this._buttons.push(button);
            }
            buttonsContainer.setSize(createdWidths, buttonsMaxHeight);
            if ((buttonsContainer.width + (this.PADDING * 2)) > options.width) {
                const scaleX: number = (options.width - (this.PADDING * 2)) / buttonsContainer.width;
                buttonsContainer.setScale(scaleX);
                buttonsMaxHeight *= scaleX;
            }
            buttonsContainer.setX(((options.width - (this.PADDING * 2)) / 2) - ((buttonsContainer.width * buttonsContainer.scaleX) / 2) + this.PADDING);
            offsetY += buttonsMaxHeight + this.PADDING;
            this.add(buttonsContainer);
        }
        if (bgColour) {
            const cornerRadius: number = options.cornerRadius || 0;
            this._background = this.scene.add.container(0, 0);
            const headerBackgroundTop: Phaser.GameObjects.Graphics = this.scene.add.graphics({fillStyle: {color: bgColour}});
            headerBackgroundTop.fillRect(0, 0, options.width, cornerRadius);
            this._background.add(headerBackgroundTop);
            const headerBackgroundBottom: Phaser.GameObjects.Graphics = this.scene.add.graphics({fillStyle: {color: bgColour}});
            headerBackgroundBottom.fillRoundedRect(0, 0, options.width, offsetY, cornerRadius);
            this._background.add(headerBackgroundBottom);
            this.add(this._background);
            this.sendToBack(this._background);
        }
        this.setSize(options.width, offsetY);
    }
}