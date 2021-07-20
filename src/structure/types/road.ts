import JobHandler from "../../room/jobs/handler";
import FuncWrapper from "../../utils/wrapper";
import StructureHelper from "../helper";

/**
 * Execute an road
 */
export default FuncWrapper(function ExecuteRoad(str: StructureRoad): void {
  if (
    StructureHelper.IsStructureDamaged(str) &&
     JobHandler.GetJob(JobHandler.CreateJob.GetRepairJobId(str), str.room.name) === null
  )
    JobHandler.CreateJob.CreateRepairJob(str);
});
