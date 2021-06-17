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
import { FunctionReturnHelper } from "./utils/functionStatusGenerator";
import { ErrorMapper } from './utils/external/errorMapper';

/**
 * @returns {FunctionReturn} HTTP response with code and data
 */
// eslint-disable-next-line import/prefer-default-export
export const loop = ErrorMapper.wrapLoop(() => {
// export function loop(): FunctionReturn {
  let areCustomPrototypesInitialized = AreCustomPrototypesInitialized();
  if (areCustomPrototypesInitialized.code === FunctionReturnCodes.NO_CONTENT) {
    InitializeCustomPrototypes();
    areCustomPrototypesInitialized = AreCustomPrototypesInitialized();
    if (areCustomPrototypesInitialized.code === FunctionReturnCodes.NO_CONTENT)
      return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
  }

  let areHeapVarsValid = AreHeapVarsValid();
  if (areHeapVarsValid.code === FunctionReturnCodes.NO_CONTENT) {
    InitializeHeapVars();
    areHeapVarsValid = AreHeapVarsValid();
    if (areHeapVarsValid.code === FunctionReturnCodes.NO_CONTENT)
      return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
  }

  let isGlobalMemoryInitialized = IsGlobalMemoryInitialized();
  if (isGlobalMemoryInitialized.code === FunctionReturnCodes.NO_CONTENT) {
    InitializeGlobalMemory();
    isGlobalMemoryInitialized = IsGlobalMemoryInitialized();
    if (isGlobalMemoryInitialized.code === FunctionReturnCodes.NO_CONTENT)
      return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
  }

  Update();
  const globalStatsPreProcessing = GlobalStatsPreProcessing();
  RunRooms();
  if (globalStatsPreProcessing.code === FunctionReturnCodes.OK) GlobalStats();

  return FunctionReturnHelper(FunctionReturnCodes.OK);
// }
});
