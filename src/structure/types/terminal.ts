import JobHandler from "../../room/jobs/handler";
import FuncWrapper from "../../utils/wrapper";
import StructureHelper from "../helper";

/**
 * Execute an terminal
 */
export default FuncWrapper(function ExecuteTerminal(
  str: StructureTerminal
): void {
  const structureMemory = StructureHelper.GetStructureMemory(str.id);
  if (
    StructureHelper.IsStructureDamaged(str) &&
    structureMemory.jobId === undefined
  )
    JobHandler.CreateJob.CreateRepairJob(str);
  StructureHelper.ControlStorageOfTerminal(str);
});
