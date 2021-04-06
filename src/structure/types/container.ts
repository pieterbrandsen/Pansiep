import { GetSourcesInRange } from "../../room/reading";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { ControllerEnergyStructureRange } from "../../utils/constants/structure";
import {
  TryToCreateWithdrawJob,
  TryToCreateRepairJob,
  TryToCreateTransferJob,
} from "./helper";

// eslint-disable-next-line
export const ExecuteContainer = FuncWrapper(function ExecuteContainer(
  str: StructureContainer
): FunctionReturn {
  TryToCreateRepairJob(str);
  const sourcesInRange: Source[] = GetSourcesInRange(str.pos, 2, str.room)
    .response;
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
