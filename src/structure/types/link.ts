import StructureHelper from "../helper";
import JobHandler from "../../room/jobs/handler";
import WrapperHandler from "../../utils/wrapper";

/**
 * Execute an link
 */
export default WrapperHandler.FuncWrapper(function ExecuteLink(
  str: StructureLink
): void {
  if (
    StructureHelper.IsStructureDamaged(str) &&
    JobHandler.GetJob(
      JobHandler.CreateJob.GetRepairJobId(str),
      str.room.name
    ) === null
  )
    JobHandler.CreateJob.CreateRepairJob(str);
  StructureHelper.ControlStorageOfLink(str);
});
