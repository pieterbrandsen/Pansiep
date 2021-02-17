import Initialization from "./memory/initialization";
import ConsoleCommands from "./utils/consoleCommands";

/**
 *
 */
// eslint-disable-next-line import/prefer-default-export
export function loop(): void {
  if (!Initialization.IsGlobalMemoryInitialized())
    Initialization.InitializeGlobalMemory();

  ConsoleCommands.AssignCommandsToHeap();
}
