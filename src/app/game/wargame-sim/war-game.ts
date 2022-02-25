import { UIManager } from "./ui/ui-manager";
import { WarGameOptions } from "./war-game-options";

export module WarGame {
    export function start(options?: WarGameOptions): void {
        UIManager.start(options?.uiMgrOpts);
    }

    export function stop(): void {
        UIManager.stop();
    }
}