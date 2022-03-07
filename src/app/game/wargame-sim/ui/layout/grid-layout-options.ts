export interface GridLayoutOptions {
    scene: Phaser.Scene;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rows?: number;
    columns?: number;
    customGrid?: any[][];
    debug?: boolean;
}