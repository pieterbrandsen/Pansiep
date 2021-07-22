import FuncWrapper from "../../utils/wrapper";
import StructureHelper from "../helper";
import JobHandler from "../../room/jobs/handler";

/**
 * Execute an container
 */
export default FuncWrapper(function ExecuteContainer(
  str: StructureContainer
): void {
  if (
    StructureHelper.IsStructureDamaged(str) &&
    JobHandler.GetJob(
      JobHandler.CreateJob.GetRepairJobId(str),
      str.room.name
    ) === null
  )
    JobHandler.CreateJob.CreateRepairJob(str);
  StructureHelper.ControlStorageOfContainer(str);
});
