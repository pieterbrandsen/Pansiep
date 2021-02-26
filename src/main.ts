import {
  AreHeapVarsValid,
  InitializeGlobalMemory,
  InitializeHeapVars,
  IsGlobalMemoryInitialized,
  InitializeCustomPrototypes,
  AreCustomPrototypesInitialized,
} from "./memory/initialization";
import { Update } from "./memory/updateCache";
import { Run as RunRooms } from "./room/loop";
import { GlobalStatsPreProcessing, GlobalStats } from "./memory/stats";
import { FunctionReturnCodes } from "./utils/constants/global";
import { FunctionReturnHelper } from "./utils/statusGenerator";

/**
 * @returns {FunctionReturn} HTTP response
 */
// eslint-disable-next-line import/prefer-default-export
export function loop(): FunctionReturn {
  if (
    AreCustomPrototypesInitialized().code === FunctionReturnCodes.NO_CONTENT
  ) {
    InitializeCustomPrototypes();
    const areCustomPrototypesInitialized = AreCustomPrototypesInitialized();
    if (areCustomPrototypesInitialized.code === FunctionReturnCodes.NO_CONTENT)
      return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
  }
  if (AreHeapVarsValid().code === FunctionReturnCodes.NO_CONTENT) {
    InitializeHeapVars();
    const areHeapVarsValid = AreHeapVarsValid();
    if (areHeapVarsValid.code === FunctionReturnCodes.NO_CONTENT)
      return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
  }
  if (IsGlobalMemoryInitialized().code === FunctionReturnCodes.NO_CONTENT) {
    InitializeGlobalMemory();
    const isGlobalMemoryInitialized = IsGlobalMemoryInitialized();
    if (isGlobalMemoryInitialized.code === FunctionReturnCodes.NO_CONTENT)
      return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
  }

  Update();
  const globalStatsPreProcessing = GlobalStatsPreProcessing();
  RunRooms();
  if (globalStatsPreProcessing.code === FunctionReturnCodes.OK) GlobalStats();

  return FunctionReturnHelper(FunctionReturnCodes.OK);
}
