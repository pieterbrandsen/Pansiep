import JobHandler from "../../room/jobs/handler";
import FuncWrapper from "../../utils/wrapper";
import StructureHelper from "../helper";

/**
 * Execute an storage
 */
export default FuncWrapper(function ExecuteStorage(
  str: StructureStorage
): void {
  const structureMemory = StructureHelper.GetStructureMemory(str.id);
  if (
    StructureHelper.IsStructureDamaged(str) &&
    structureMemory.jobId === undefined
  )
    JobHandler.CreateJob.CreateRepairJob(str);
  StructureHelper.ControlStorageOfStorage(str);
});
