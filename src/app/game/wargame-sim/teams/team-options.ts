import { TeamManager } from "./team-manager";

export interface TeamOptions {
    name: string;
    colour?: string;
    points: number;
    teamManager?: TeamManager;
}