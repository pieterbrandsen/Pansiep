import JobHandler from "../../room/jobs/handler";
import FuncWrapper from "../../utils/wrapper";
import StructureHelper from "../helper";

/**
 * Execute an road
 */
export default FuncWrapper(function ExecuteRoad(str: StructureRoad): void {
  const structureMemory = StructureHelper.GetStructureMemory(str.id);
  if (
    StructureHelper.IsStructureDamaged(str) &&
    structureMemory.jobId === undefined
  )
    JobHandler.CreateJob.CreateRepairJob(str);
});
