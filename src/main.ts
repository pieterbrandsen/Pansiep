import Initialization from "./memory/initialization";
import ConsoleCommands from "./utils/consoleCommands";
import UpdateCache from "./memory/updateCache";
import RoomLoop from "./room/loop";
import Stats from "./memory/stats";

/**
 *
 */
// eslint-disable-next-line import/prefer-default-export
export function loop(): void {
  if (!Initialization.IsGlobalMemoryInitialized())
    Initialization.InitializeGlobalMemory();

  ConsoleCommands.AssignCommandsToHeap();
  UpdateCache.Update();
  Stats.GlobalStatsPreProcessing();
  RoomLoop.Run();
  Stats.GlobalStatsProcessing();
}
