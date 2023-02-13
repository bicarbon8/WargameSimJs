import { XY } from "../ui/types/xy";
import { MapTerrain } from "./map-terrain"

export type GameMapTile = {
    terrain: MapTerrain;
    xy: XY;
}