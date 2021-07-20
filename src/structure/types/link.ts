import FuncWrapper from "../../utils/wrapper";
import StructureHelper from "../helper";
import JobHandler from "../../room/jobs/handler";

/**
 * Execute an link
 */
export default FuncWrapper(function ExecuteLink(str: StructureLink): void {
  const structureMemory = StructureHelper.GetStructureMemory(str.id);
  if (
    StructureHelper.IsStructureDamaged(str) &&
    structureMemory.jobId === undefined
  )
    JobHandler.CreateJob.CreateRepairJob(str);
  StructureHelper.ControlStorageOfLink(str);
});
