import { GridCell } from "./grid-cell";
import { LayoutManagerOptions } from "./layout-manager-options";

export class LayoutManager extends Phaser.GameObjects.Container {
    private _grid: GridCell[][];

    constructor(options: LayoutManagerOptions) {
        super(options.scene, options.x, options.y);
        this._createGrid(options);
    }

    getCellAt(row: number, column: number): GridCell {
        return this._grid[row][column];
    }

    private _createGrid(options: LayoutManagerOptions): void {
        if (options.customGrid) {
            const rows: number = options.customGrid.length;
            const cellHeight: number = this.scene.game.canvas.height / rows;
            for (var row=0; row<rows; row++) {
                this._grid[row] = [];
                let cols: number = options.customGrid[row].length;
                let cellWidth: number = this.scene.game.canvas.width / cols;
                for (var col=0; col<cols; col++) {
                    let cell: GridCell = new GridCell({
                        scene: this.scene, 
                        x: col * cellWidth, 
                        y: row * cellHeight,
                        width: cellWidth,
                        height: cellHeight
                    });
                    this._grid[row][col] = cell;
                    this.add(cell);
                }
            }
        } else {
            const rows: number = options.rows || 12;
            const columns: number = options.columns || 12;
            const cellWidth: number = this.scene.game.canvas.width / columns;
            const cellHeight: number = this.scene.game.canvas.height / rows;
            for (var row=0; row<rows; row++) {
                this._grid[row] = [];
                for (var col=0; col<columns; col++) {
                    let cell: GridCell = new GridCell({
                        scene: this.scene, 
                        x: col * cellWidth, 
                        y: row * cellHeight,
                        width: cellWidth,
                        height: cellHeight
                    });
                    this._grid[row][col] = cell;
                    this.add(cell);
                }
            }
        }
    }
}