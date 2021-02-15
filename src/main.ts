import ErrorMapper from "./utils/errorMapper";
import Initialization from "./memory/initialization";

/**
 * Run the complete bot without ErrorMapper
 */
function unwrappedLoop(): void {
  if (!Initialization.IsGlobalMemoryInitialized())
    Initialization.InitializeGlobalMemory();
}

const loop = ErrorMapper.wrapLoop(unwrappedLoop);

export { loop, unwrappedLoop };
