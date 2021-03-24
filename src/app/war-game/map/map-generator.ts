import { MapGridItem } from "./map-grid-item";
import { MapTerrain } from "./map-terrain";

export class MapGenerator {
    generate(sizeX: number, sizeY: number, seed: number): void {
        let grid: MapGridItem[][] = [];
        for (var x=0; x<sizeX; x++) {
            grid[x] = [];
            for (var y=0; y<sizeY; y++) {
                grid[x][y] = {height: 0, terrain: MapTerrain.grass} // TODO: randomise
            }
        }
    }
}
