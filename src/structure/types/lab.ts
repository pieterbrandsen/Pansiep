import JobHandler from "../../room/jobs/handler";
import FuncWrapper from "../../utils/wrapper";
import StructureHelper from "../helper";

/**
 * Execute an lab
 */
export default FuncWrapper(function ExecuteLab(str: StructureLab): void {
  const structureMemory = StructureHelper.GetStructureMemory(str.id);
  if (
    StructureHelper.IsStructureDamaged(str) &&
    structureMemory.jobId === undefined
  )
    JobHandler.CreateJob.CreateRepairJob(str);
  StructureHelper.KeepStructureFullEnough(str, 100);
});
