import { IPlayer } from "../players/i-player";

export interface BattleGroup {
    attackers: IPlayer[];
    defenders: IPlayer[];
}