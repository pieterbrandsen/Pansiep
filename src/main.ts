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
  if (AreCustomPrototypesInitialized().code !== FunctionReturnCodes.OK) {
    const initializeCustomPrototypes = InitializeCustomPrototypes();
    if (initializeCustomPrototypes.code !== FunctionReturnCodes.NOT_MODIFIED)
      return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
  }
  if (AreHeapVarsValid().code !== FunctionReturnCodes.OK) {
    const initializeHeapVars = InitializeHeapVars();
    if (initializeHeapVars.code !== FunctionReturnCodes.NOT_MODIFIED)
      return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
  }
  if (IsGlobalMemoryInitialized().code !== FunctionReturnCodes.OK) {
    const initializeGlobalMemory = InitializeGlobalMemory();
    if (initializeGlobalMemory.code !== FunctionReturnCodes.NOT_MODIFIED)
      return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
  }

  Update();
  const globalStatsPreProcessing = GlobalStatsPreProcessing();
  RunRooms();
  if (globalStatsPreProcessing.code === FunctionReturnCodes.OK) GlobalStats();

  return FunctionReturnHelper(FunctionReturnCodes.OK);
}
