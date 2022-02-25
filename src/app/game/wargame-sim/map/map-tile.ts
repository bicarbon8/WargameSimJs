import { IPlayer } from "../players/i-player";
import { MapTerrain } from "./map-terrain";

export interface MapTile {
    x?: number;
    y?: number;
    z?: number;
    terrain?: MapTerrain;
    player?: IPlayer;
}
