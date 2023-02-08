import { UIManagerOptions } from "./ui/ui-manager-options";
import { Logging } from "./utils/logging";

export interface WarGameOptions {
    uiMgrOpts?: UIManagerOptions;
    loglevel?: Logging.LogLevel;
}