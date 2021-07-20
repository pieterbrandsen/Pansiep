import JobHandler from "../../room/jobs/handler";
import FuncWrapper from "../../utils/wrapper";
import StructureHelper from "../helper";

/**
 * Execute an observer
 */
export default FuncWrapper(function ExecuteObserver(
  str: StructureObserver
): void {
  if (
    StructureHelper.IsStructureDamaged(str) &&
     JobHandler.GetJob(JobHandler.CreateJob.GetRepairJobId(str), str.room.name) === null
  )
    JobHandler.CreateJob.CreateRepairJob(str);
});
