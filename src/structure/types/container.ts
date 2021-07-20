import FuncWrapper from "../../utils/wrapper";
import {
  TryToCreateWithdrawJob,
  RepairIfDamagedStructure,
  TryToCreateTransferJob,
} from "./helper";
import RoomHelper from "../../room/helper";
import StructureConstants from "../../utils/constants/structure";

/**
 * Execute an container
 */
export default FuncWrapper(function ExecuteContainer(
  str: StructureContainer
): void {
  RepairIfDamagedStructure(str);
  const sourcesInRange = RoomHelper.Reader.GetSourcesInRange(
    str.pos,
    2,
    str.room
  );
  if (
    str.room.controller &&
    str.pos.inRangeTo(
      str.room.controller,
      StructureConstants.ControllerEnergyStructureRange
    )
  ) {
    TryToCreateWithdrawJob(str, 0, RESOURCE_ENERGY, "withdrawController");
    TryToCreateTransferJob(str, 100, RESOURCE_ENERGY);
  } else if (sourcesInRange.length > 0) {
    TryToCreateWithdrawJob(str, 0);
    TryToCreateTransferJob(str, 100, RESOURCE_ENERGY, false, "transferSource");
  } else {
    TryToCreateWithdrawJob(str, 50);
  }
});
