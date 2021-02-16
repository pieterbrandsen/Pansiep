import Initialization from "./memory/initialization";
import Logger from "./utils/logger";

/**
 *
 */
// eslint-disable-next-line import/prefer-default-export
export function loop(): void {
  if (!Initialization.IsGlobalMemoryInitialized())
    Initialization.InitializeGlobalMemory();
}
