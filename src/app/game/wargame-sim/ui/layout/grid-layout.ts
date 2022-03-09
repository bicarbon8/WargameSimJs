import { Rand } from "../../utils/rand";
import { GridCell } from "./grid-cell";
import { GridCellOptions } from "./grid-cell-options";
import { GridLayoutOptions } from "./grid-layout-options";
import { LayoutContent } from "./layout-content";

export class GridLayout extends Phaser.GameObjects.Container {
    public readonly id: number;
    private _grid: GridCell[][];
    private _top: number;
    private _bottom: number;
    private _left: number;
    private _right: number;

    constructor(options: GridLayoutOptions) {
        super(options.scene, options.x, options.y);
        this.id = Rand.getId();
        const width: number = options.width || this.scene.game.canvas.width;
        const height: number = options.height || this.scene.game.canvas.height;
        this.updateSize(width, height);
        this._createGrid(options);
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

    setGridCellContent(row: number, column: number, content: LayoutContent | GridCellOptions): void {
        const cell: GridCell = this.getGridCell(row, column);
        if (cell) {
            if ((content as GridCellOptions)?.content) {
                cell.setContent(content);
            } else {
                cell.setContent({content: content as LayoutContent});
            }
        }
    }

    getGridCell(row: number, column: number): GridCell {
        return this._grid[row][column];
    }

    getRow(row: number): GridCell[] {
        return this._grid[row];
    }

    updateSize(width: number, height: number): void {
        this.setSize(width, height);
        this._top = this.y - (height / 2);
        this._bottom = this.y + (height / 2);
        this._left = this.x - (width / 2);
        this._right = this.x + (width / 2);
    }

    private _createGrid(options: GridLayoutOptions): void {
        this._grid = [];
        const xOffset: number = -(this.width / 2);
        const yOffset: number = -(this.height / 2);
        if (options.customGrid) {
            const rows: number = options.customGrid.length;
            const cellHeight: number = this.height / rows;
            for (var row=0; row<rows; row++) {
                this._grid[row] = [];
                let cols: number = options.customGrid[row].length;
                let cellWidth: number = this.width / cols;
                for (var col=0; col<cols; col++) {
                    let cell: GridCell = options.customGrid[row][col] as GridCell;
                    if (typeof cell?.setContent === 'function') {
                        cell.setPosition(xOffset + (cell.width / 2) + (cell.width * col), yOffset + (cell.height / 2) + (cell.height * row));
                    } else {
                        cell = new GridCell({
                            id: `LM: ${this.id} - row: ${row}, col: ${col}`,
                            scene: this.scene, 
                            x: xOffset + (cellWidth / 2) + (cellWidth * col), 
                            y: yOffset + (cellHeight / 2) + (cellHeight * row),
                            width: cellWidth,
                            height: cellHeight,
                            debug: options.debug
                        });
                    }
                    this._grid[row][col] = cell;
                    this.add(cell);
                }
            }
        } else {
            const rows: number = options.rows || 12;
            const columns: number = options.columns || 12;
            const cellWidth: number = this.width / columns;
            const cellHeight: number = this.height / rows;
            for (var row=0; row<rows; row++) {
                this._grid[row] = [];
                for (var col=0; col<columns; col++) {
                    let cell: GridCell = new GridCell({
                        id: `LM: ${this.id} - row: ${row}, col: ${col}`,
                        scene: this.scene, 
                        x: xOffset + (cellWidth / 2) + (cellWidth * col), 
                        y: yOffset + (cellHeight / 2) + (cellHeight * row),
                        width: cellWidth,
                        height: cellHeight,
                        debug: options.debug
                    });
                    this._grid[row][col] = cell;
                    this.add(cell);
                }
            }
        }
    }
}