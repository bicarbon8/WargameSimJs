import { Rand } from "../../utils/rand";
import { WarGame } from "../../war-game";
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
        const width: number = options.width || WarGame.uiMgr.width;
        const height: number = options.height || WarGame.uiMgr.height;
        this.updateSize(width, height);
        this._createGrid(options);
    }

    get rows(): number {
        return this._grid.length;
    }

    get columns(): number {
        return (this.rows > 0) ? this._grid[0].length : 0;
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

    get cells(): GridCell[] {
        let cells: GridCell[] = [];
        this._grid.forEach((row: GridCell[]) => {
            cells = cells.concat(row);
        });
        return cells;
    }

    setGridCellContent(row: number, column: number, content: LayoutContent | GridCellOptions): void {
        const cell: GridCell = this.getGridCell(row, column);
        if (cell) {
            if ((content as GridCellOptions)?.content) {
                cell.setContent(content as GridCellOptions);
            } else {
                cell.setContent({content: content as LayoutContent});
            }
        }
    }

    getGridCell(row: number, column: number): GridCell {
        if (row >= 0 && row < this.rows && column >= 0 && column < this.columns) {
            return this._grid[row][column];
        }
        return null;
    }

    getRow(row: number): GridCell[] {
        if (row >= 0 && row < this.rows) {
            return this._grid[row];
        }
        return [];
    }

    getColumn(col: number): GridCell[] {
        const column: GridCell[] = [];
        if (col >= 0 && col < this.columns) {
            for (var row=0; row<this._grid.length; row++) {
                column.push(this._grid[row][col]);
            }
        }
        return column;
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
        const padding: number = options.padding || 0;
        const margins: number = options.margins || 0;
        const rows: number = options.rows || 12;
        const columns: number = options.columns || 12;
        const cellWidth: number = (this.width - (margins * (columns + 1))) / columns;
        const cellHeight: number = (this.height - (margins * (rows + 1))) / rows;
        let yOffset: number = -(this.height / 2) + margins;
        for (var row=0; row<rows; row++) {
            this._grid[row] = [];
            let xOffset: number = -(this.width / 2) + margins;
            for (var col=0; col<columns; col++) {
                let cell: GridCell = new GridCell({
                    scene: this.scene,
                    gridLayout: this,
                    x: xOffset + (cellWidth / 2), 
                    y: yOffset + (cellHeight / 2),
                    width: cellWidth,
                    height: cellHeight,
                    row: row,
                    column: col,
                    padding: padding,
                    debug: options.debug
                });
                this._grid[row][col] = cell;
                this.add(cell);
                xOffset += cellWidth + margins;
            }
            yOffset += cellHeight + margins;
        }
    }
}