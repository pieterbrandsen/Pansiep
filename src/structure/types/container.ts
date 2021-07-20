import FuncWrapper from "../../utils/wrapper";
import StructureHelper from "../helper";
import JobHandler from "../../room/jobs/handler";

/**
 * Execute an container
 */
export default FuncWrapper(function ExecuteContainer(
  str: StructureContainer
): void {
  const structureMemory = StructureHelper.GetStructureMemory(str.id);
  if (
    StructureHelper.IsStructureDamaged(str) &&
    structureMemory.jobId === undefined
  )
    JobHandler.CreateJob.CreateRepairJob(str);
  StructureHelper.ControlStorageOfContainer(str);
});
