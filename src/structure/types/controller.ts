import JobHandler from "../../room/jobs/handler";
import FuncWrapper from "../../utils/wrapper";

/**
 * Execute an controller
 */
export default FuncWrapper(function ExecuteController(
  str: StructureController
): void {
  const spendJobs = JobHandler.GetAllJobs(str.room.name, [
    "build",
    "dismantle",
    "upgrade",
  ]);
  const upgradeJobs: Job[] = spendJobs.filter((j) => j.action === "upgrade");

  if (upgradeJobs.length === 0) {
    JobHandler.CreateJob.CreateUpgradeJob(str.room, true);
  } else if (spendJobs.length === 0) {
    JobHandler.CreateJob.CreateUpgradeJob(str.room);
  } else if (
    (str.room.controller as StructureController).ticksToDowngrade <
    10 * 1000
  ) {
    const deletedJob = JobHandler.DeleteJob(spendJobs[0].id, str.room.name);
    if (deletedJob) {
      JobHandler.CreateJob.CreateUpgradeJob(str.room, true);
    }
  }
});
