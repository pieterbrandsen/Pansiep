import {
  AreHeapVarsValid,
  InitializeGlobalMemory,
  InitializeHeapVars,
  IsGlobalMemoryInitialized,
} from "./memory/initialization";
import { Update } from "./memory/updateCache";
import { Run as RunRooms } from "./room/loop";
import { GlobalStatsPreProcessing, GlobalStats } from "./memory/stats";
import { FunctionReturnCodes } from "./utils/constants/global";
import { FunctionReturnHelper } from "./utils/statusGenerator";

/**
 *
 */
// eslint-disable-next-line import/prefer-default-export
export function loop(): FunctionReturn {
  if (!AreHeapVarsValid()) InitializeHeapVars();
  if (!IsGlobalMemoryInitialized()) InitializeGlobalMemory();

  Update();
  GlobalStatsPreProcessing();
  RunRooms();
  GlobalStats();

  return FunctionReturnHelper(FunctionReturnCodes.OK);
}
