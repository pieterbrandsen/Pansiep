import { isUndefined, min } from "lodash";

import UtilsHelper from "../../utils/helper";
import JobHandler from "../../room/jobs/handler";
import CreepActions from "./actionsGroup";
import CreepHelper from "../helper";
import StructureHelper from "../../structure/helper";
import WrapperHandler from "../../utils/wrapper";

// eslint-disable-next-line
export default WrapperHandler.FuncWrapper(function ExecuteWithdraw(
  creep: Creep,
  job: Job
): void {
  const creepMemory = CreepHelper.GetCreepMemory(creep.name);

  if (creep.store.getFreeCapacity(job.resourceType) === 0) {
    if (job.action === "withdrawController") {
      JobHandler.SwitchCreepSavedJobIds(creepMemory);
      JobHandler.UnassignJob(job.id, creep.name, job.roomName);
    } else {
      JobHandler.AssignNewJobForCreep(
        creep,
        ["work", "pioneer"].includes(creepMemory.type)
          ? ["withdraw", "harvest"]
          : ["withdraw"]
      );
      JobHandler.UnassignJob(job.id, creep.name, job.roomName);
    }
    return;
  }

  if (job.energyRequired === undefined || job.energyRequired <= 0) {
    JobHandler.DeleteJob(job.roomName, job.id);
    return;
  }

  const resourceType = job.resourceType as ResourceConstant;
  const structure = UtilsHelper.GetObject(job.objId) as Structure;
  const strUsedCapacity = StructureHelper.GetUsedCapacity(
    structure,
    resourceType
  );
  const creepFreeCapacity = creep.store.getFreeCapacity(resourceType);
  const withdrawAmount: number = min([
    creepFreeCapacity,
    strUsedCapacity,
  ]) as number;

  switch (creep.withdraw(structure, resourceType, withdrawAmount)) {
    case OK:
      creep.say("withdraw");
      job.energyRequired -= withdrawAmount;
      break;
    case ERR_FULL:
      JobHandler.UnassignJob(job.id, creep.name, job.roomName);
      if (isUndefined(creepMemory.secondJobId)) {
        JobHandler.AssignNewJobForCreep(
          creep,
          creepMemory.type === "transferring" ? ["transfer"] : undefined
        );
      } else {
        JobHandler.SwitchCreepSavedJobIds(creepMemory);
      }
      break;
    case ERR_NOT_IN_RANGE:
      CreepActions.Move(creep, job);
      break;
    case ERR_INVALID_TARGET:
      if (structure.room) JobHandler.DeleteJob(job.roomName, job.id);
      else CreepActions.Move(creep, job);
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
      JobHandler.DeleteJob(job.roomName, job.id);
      break;
    default:
      break;
  }
});
