import JobHandler from "../../room/jobs/handler";
import FuncWrapper from "../../utils/wrapper";
import StructureHelper from "../helper";

/**
 * Execute an observer
 */
export default FuncWrapper(function ExecuteObserver(
  str: StructureObserver
): void {
  const structureMemory = StructureHelper.GetStructureMemory(str.id);
  if (
    StructureHelper.IsStructureDamaged(str) &&
    structureMemory.jobId === undefined
  )
    JobHandler.CreateJob.CreateRepairJob(str);
});
