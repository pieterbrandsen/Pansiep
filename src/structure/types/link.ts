import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import {
  TryToCreateTransferJob,
  RepairIfDamagedStructure,
  TryToCreateWithdrawJob,
} from "./helper";
import { ControllerEnergyStructureRange } from "../../utils/constants/structure";
import { GetSourcesInRange } from "../../room/reading";

/**
 * Execute an link
 *
 * @param {StructureLink} str - link structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export default FuncWrapper(function ExecuteLink(
  str: StructureLink
): FunctionReturn {
  RepairIfDamagedStructure(str);

  const getSourcesInRange = GetSourcesInRange(str.pos, 2, str.room);
  if (getSourcesInRange.code !== FunctionReturnCodes.OK) return FunctionReturnHelper(getSourcesInRange.code);
  const sources: Source[] = getSourcesInRange.response;
  if (
    str.room.controller &&
    str.pos.inRangeTo(str.room.controller, ControllerEnergyStructureRange)
  ) {
    TryToCreateWithdrawJob(str, 0, RESOURCE_ENERGY, "withdrawController");
  } else if (sources.length > 0) {
    TryToCreateWithdrawJob(str, 0);
    TryToCreateTransferJob(str, 100, RESOURCE_ENERGY, false, "transferSource");
  } else {
    TryToCreateWithdrawJob(str, 100);
  }

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
