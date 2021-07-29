import { ErrorMapper } from "./utils/external/errorMapper";
import MemoryInitializationHandler from "./memory/initialization";
import UpdateCacheHandler from "./memory/updateCache";
import StatsHandler from "./memory/stats";
import RoomManager from "./room/loop";

// eslint-disable-next-line import/prefer-default-export
export const loop = ErrorMapper.wrapLoop((): void => {
  if (!MemoryInitializationHandler.AreCustomPrototypesInitialized()) {
    MemoryInitializationHandler.InitializeCustomPrototypes();
    if (!MemoryInitializationHandler.AreCustomPrototypesInitialized()) return;
  }

  if (!MemoryInitializationHandler.AreHeapVarsValid()) {
    MemoryInitializationHandler.InitializeHeapVars();
    if (!MemoryInitializationHandler.AreHeapVarsValid()) return;
  }

  if (!MemoryInitializationHandler.IsGlobalMemoryInitialized()) {
    MemoryInitializationHandler.InitializeGlobalMemory();
    if (!MemoryInitializationHandler.IsGlobalMemoryInitialized()) return;
  }

  UpdateCacheHandler.UpdateAll();
  StatsHandler.GlobalStatsPreProcessing();
  RoomManager.Run();
  StatsHandler.GlobalStats();
});

export const unwrappedLoop = ErrorMapper.wrapLoop(loop);
