import JobHandler from "../../room/jobs/handler";
import UtilsHelper from "../../utils/helper";
import WrapperHandler from "../../utils/wrapper";

import StructureHelper from "../helper";

export default class TowerHandler {
  /**
   * Execute an attack job for a tower
   */
  private static ExecuteTowerAttack = WrapperHandler.FuncWrapper(
    function ExecuteTowerAttack(str: StructureTower, job: Job): void {
      const object = UtilsHelper.GetObject(job.objId) as Creep;

      switch (str.attack(object)) {
        case ERR_INVALID_TARGET:
          JobHandler.DeleteJob(str.room.name, job.id);
          break;
        default:
          break;
      }
    }
  );

  /**
   * Execute an heal job for a tower
   */
  private static ExecuteTowerHeal = WrapperHandler.FuncWrapper(
    function ExecuteTowerHeal(str: StructureTower, job: Job): void {
      const creep = UtilsHelper.GetObject(job.objId) as Creep;

      switch (str.heal(creep)) {
        case ERR_INVALID_TARGET:
          JobHandler.DeleteJob(str.room.name, job.id);
          break;
        default:
          break;
      }
    }
  );

  /**
   * Execute an repair job for a tower
   */
  private static ExecuteTowerRepair = WrapperHandler.FuncWrapper(
    function ExecuteTowerRepair(str: StructureTower, job: Job): void {
      const targetStructure = UtilsHelper.GetObject(job.objId) as Structure;

      if (!StructureHelper.IsStructureDamaged(targetStructure)) {
        return JobHandler.DeleteJob(job.roomName, job.id);
      }

      switch (str.repair(targetStructure)) {
        case ERR_INVALID_TARGET:
          JobHandler.DeleteJob(str.room.name, job.id);
          break;
        default:
          break;
      }
    }
  );

  private static GetNewTowerJob = WrapperHandler.FuncWrapper(
    function GetNewTowerJob(str: StructureTower): Job {
      return JobHandler.AssignNewJobForStructure(str) as Job;
    }
  );

  /**
   * Execute an tower
   */
  public static ExecuteTower = WrapperHandler.FuncWrapper(function ExecuteTower(
    str: StructureTower
  ): void {
    StructureHelper.ControlDamagedStructures(str, true);
    StructureHelper.KeepStructureFullEnough(
      str,
      100,
      RESOURCE_ENERGY,
      "transfer",
      true
    );

    const structureMemory = StructureHelper.GetStructureMemory(str.id);
    if (structureMemory.jobId) {
      let job = JobHandler.GetJob(
        structureMemory.jobId as Id<Job>,
        str.room.name
      );
      if (job === null) {
        job = TowerHandler.GetNewTowerJob(str);
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
