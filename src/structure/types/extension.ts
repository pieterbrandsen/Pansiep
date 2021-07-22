import JobHandler from "../../room/jobs/handler";
import FuncWrapper from "../../utils/wrapper";
import StructureHelper from "../helper";

/**
 * Execute an extension
 */
export default FuncWrapper(function ExecuteExtension(
  str: StructureExtension
): void {
  if (
    StructureHelper.IsStructureDamaged(str) &&
    JobHandler.GetJob(
      JobHandler.CreateJob.GetRepairJobId(str),
      str.room.name
    ) === null
  )
    JobHandler.CreateJob.CreateRepairJob(str);
  StructureHelper.KeepStructureFullEnough(str, 100);
});
