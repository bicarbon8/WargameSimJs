import { GridCellOptions } from "./grid-cell-options";

export class GridCell extends Phaser.GameObjects.Container {
    constructor(options: GridCellOptions) {
        super(options.scene, options.x, options.y);
        const width: number = options.width || 0;
        const height: number = options.height || 0;
        this.setSize(width, height);
    }

    setContents(obj: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container | Phaser.GameObjects.Image, scaleToFit: boolean = false, keepAspectRatio: true): void {
        if (obj) {
            const width: number = obj.width;
            const height: number = obj.height;
            if (scaleToFit && (width > this.width || height > this.height)) {
                const scaleX: number = this.width / width;
                const scaleY: number = this.height / height;
                if (keepAspectRatio) {
                    const scale: number = (scaleX < scaleY) ? scaleX : scaleY;
                    obj.setScale(scale);    
                } else {
                    obj.setScale(scaleX, scaleY);
                }
            }

            obj.setPosition((this.width / 2) - ((width * obj.scaleX) / 2), (this.height / 2) - ((height * obj.scaleY) / 2));
        }
    }
}