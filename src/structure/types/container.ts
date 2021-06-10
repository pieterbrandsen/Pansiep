import { GetSourcesInRange } from "../../room/reading";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { ControllerEnergyStructureRange } from "../../utils/constants/structure";
import {
  TryToCreateWithdrawJob,
  RepairIfDamagedStructure,
  TryToCreateTransferJob,
} from "./helper";

/**
 * Execute an container
 *
 * @param {StructureContainer} str - Container structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export default FuncWrapper(function ExecuteContainer(
  str: StructureContainer
): FunctionReturn {
  RepairIfDamagedStructure(str);
  const getSourcesInRange = GetSourcesInRange(str.pos, 2, str.room);
  if (getSourcesInRange.code !== FunctionReturnCodes.OK) {
    return FunctionReturnHelper(getSourcesInRange.code);
  }

  const sourcesInRange: Source[] = getSourcesInRange.response;
  if (
    str.room.controller &&
    str.pos.inRangeTo(str.room.controller, ControllerEnergyStructureRange)
  ) {
    TryToCreateWithdrawJob(str, 0, RESOURCE_ENERGY, "withdrawController");
    TryToCreateTransferJob(str, 100, RESOURCE_ENERGY);
  } else if (sourcesInRange.length > 0) {
    TryToCreateWithdrawJob(str, 0);
    TryToCreateTransferJob(str, 100, RESOURCE_ENERGY, false, "transferSource");
  } else {
    TryToCreateWithdrawJob(str, 50);
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
