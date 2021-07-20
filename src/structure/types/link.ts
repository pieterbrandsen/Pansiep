import FuncWrapper from "../../utils/wrapper";
import {
  TryToCreateTransferJob,
  RepairIfDamagedStructure,
  TryToCreateWithdrawJob,
} from "./helper";
import RoomHelper from "../../room/helper";
import StructureConstants from "../../utils/constants/structure";

/**
 * Execute an link
 */
export default FuncWrapper(function ExecuteLink(str: StructureLink): void {
  RepairIfDamagedStructure(str);

  const sources = RoomHelper.Reader.GetSourcesInRange(str.pos, 2, str.room);
  if (
    str.room.controller &&
    str.pos.inRangeTo(
      str.room.controller,
      StructureConstants.ControllerEnergyStructureRange
    )
  ) {
    TryToCreateWithdrawJob(str, 0, RESOURCE_ENERGY, "withdrawController");
  } else if (sources.length > 0) {
    TryToCreateWithdrawJob(str, 0);
    TryToCreateTransferJob(str, 100, RESOURCE_ENERGY, false, "transferSource");
  } else {
    TryToCreateWithdrawJob(str, 100);
  }
});
