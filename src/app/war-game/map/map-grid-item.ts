import { IPlayer } from "../players/i-player";
import { MapTerrain } from "./map-terrain";

export interface MapGridItem {
    height: number;
    terrain: MapTerrain;
    player?: IPlayer;
}
