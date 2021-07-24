import StructureHelper from "../helper";
import JobHandler from "../../room/jobs/handler";
import WrapperHandler from "../../utils/wrapper";

/**
 * Execute an container
 */
export default WrapperHandler.FuncWrapper(function ExecuteContainer(
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
