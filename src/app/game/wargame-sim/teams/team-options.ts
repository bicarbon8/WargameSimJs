import { PlayerManager } from "../players/player-manager";
import { TeamManager } from "./team-manager";

export interface TeamOptions {
    name: string;
    color?: string;
    points: number;
    teamManager?: TeamManager;
    playerManager?: PlayerManager;
}