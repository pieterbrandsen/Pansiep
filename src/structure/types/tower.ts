import JobHandler from "../../room/jobs/handler";
import UtilsHelper from "../../utils/helper";
import FuncWrapper from "../../utils/wrapper";
import StructureHelper from "../helper";

export default class TowerHandler {
  /**
   * Execute an attack job for a tower
   */
  private static ExecuteTowerAttack = FuncWrapper(function ExecuteTowerAttack(
    str: StructureTower,
    job: Job
  ): void {
    const creep = UtilsHelper.GetObject(job.objId) as Creep;

    switch (str.attack(creep)) {
      case ERR_INVALID_TARGET:
        JobHandler.DeleteJob(job.id, str.room.name);
        break;
      default:
        break;
    }
  });

  /**
   * Execute an heal job for a tower
   */
  private static ExecuteTowerHeal = FuncWrapper(function ExecuteTowerHeal(
    str: StructureTower,
    job: Job
  ): void {
    const creep = UtilsHelper.GetObject(job.objId) as Creep;

    switch (str.heal(creep)) {
      case ERR_INVALID_TARGET:
        JobHandler.DeleteJob(job.id, str.room.name);
        break;
      default:
        break;
    }
  });

  /**
   * Execute an repair job for a tower
   */
  private static ExecuteTowerRepair = FuncWrapper(function ExecuteTowerRepair(
    str: StructureTower,
    job: Job
  ): void {
    const targetStructure = UtilsHelper.GetObject(job.objId) as Structure;

    if (!StructureHelper.IsStructureDamaged(targetStructure)) {
      JobHandler.DeleteJob(job.id, job.roomName);
      return;
    }

    switch (str.repair(targetStructure)) {
      case ERR_INVALID_TARGET:
        JobHandler.DeleteJob(job.id, str.room.name);
        break;
      default:
        break;
    }
  });

  private static GetNewTowerJob = FuncWrapper(function GetNewTowerJob(
    str: StructureTower
  ): void {
    JobHandler.AssignNewJobForStructure(str);
  });

  /**
   * Execute an tower
   */
  public static ExecuteTower = FuncWrapper(function ExecuteTower(
    str: StructureTower
  ): void {
    if (
      StructureHelper.IsStructureDamaged(str) &&
      JobHandler.GetJob(
        JobHandler.CreateJob.GetRepairJobId(str),
        str.room.name
      ) === null
    )
      JobHandler.CreateJob.CreateRepairJob(str);
    StructureHelper.KeepStructureFullEnough(str, 100, RESOURCE_ENERGY, true);

    const structureMemory = StructureHelper.GetStructureMemory(str.id);
    if (structureMemory.jobId) {
      const job = JobHandler.GetJob(
        structureMemory.jobId as Id<Job>,
        str.room.name
      );
      if (job === null) {
        TowerHandler.GetNewTowerJob(str);
        return;
      }
      switch (job.action) {
        case "attack":
          TowerHandler.ExecuteTowerAttack(str, job);
          break;
        case "heal":
          TowerHandler.ExecuteTowerHeal(str, job);
          break;
        case "repair":
          TowerHandler.ExecuteTowerRepair(str, job);
          break;
        default:
          break;
      }
    } else {
      TowerHandler.GetNewTowerJob(str);
    }
  });
}
