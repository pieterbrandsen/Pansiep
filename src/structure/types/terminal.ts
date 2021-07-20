import JobHandler from "../../room/jobs/handler";
import FuncWrapper from "../../utils/wrapper";
import StructureHelper from "../helper";

/**
 * Execute an terminal
 */
export default FuncWrapper(function ExecuteTerminal(
  str: StructureTerminal
): void {
  if (
    StructureHelper.IsStructureDamaged(str) &&
     JobHandler.GetJob(JobHandler.CreateJob.GetRepairJobId(str), str.room.name) === null
  )
    JobHandler.CreateJob.CreateRepairJob(str);
  StructureHelper.ControlStorageOfTerminal(str);
});
