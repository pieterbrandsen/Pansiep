import UtilsHelper from "../../utils/helper";

import JobHandler from "../../room/jobs/handler";
import CreepActions from "./actionsGroup";
import CreepHelper from "../helper";
import StructureHelper from "../../structure/helper";
import WrapperHandler from "../../utils/wrapper";

// eslint-disable-next-line
export default WrapperHandler.FuncWrapper(function ExecuteTransfer(
  creep: Creep,
  job: Job
): void {
  const creepMemory = CreepHelper.GetCreepMemory(creep.name);

  if (
    creep.store.getUsedCapacity(job.resourceType) <
    creep.store.getCapacity(job.resourceType) / 10
  ) {
    if (job.action === "transferSource") {
      JobHandler.SwitchCreepSavedJobIds(creepMemory);
      JobHandler.UnassignJob(job.id, creep.name, job.roomName);
    } else if (
      JobHandler.AssignNewJobForCreep(
        creep,
        creepMemory.type === "work" || creepMemory.type === "pioneer"
          ? ["withdraw", "harvest"]
          : ["withdraw"]
      )
    ) {
      JobHandler.UnassignJob(job.id, creep.name, job.roomName);
    }
    return;
  }

  if (job.energyRequired === undefined || job.energyRequired <= 0) {
    JobHandler.DeleteJob(job.roomName, job.id);
    return;
  }

  const resourceType = job.resourceType as ResourceConstant;
  const str: Structure = UtilsHelper.GetObject(job.objId) as Structure;

  const strFreeCapacity = StructureHelper.GetFreeCapacity(str, resourceType);
  const creepUsedCapacity = creep.store.getUsedCapacity(resourceType);
  const transferAmount: number =
    strFreeCapacity > creepUsedCapacity ? creepUsedCapacity : strFreeCapacity;
  switch (creep.transfer(str, resourceType, transferAmount)) {
    case OK:
      creep.say("transfer");
      job.energyRequired -= transferAmount;
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
      if (
        JobHandler.AssignNewJobForCreep(
          creep,
          creepMemory.type === "work" || creepMemory.type === "pioneer"
            ? ["withdraw", "harvest"]
            : ["withdraw"]
        )
      )
        JobHandler.UnassignJob(job.id, creep.name, job.roomName);
      break;
    case ERR_NOT_IN_RANGE:
      CreepActions.Move(creep, job);
      break;
    case ERR_INVALID_TARGET:
    case ERR_FULL:
      JobHandler.DeleteJob(job.roomName, job.id);
      break;
    default:
      break;
  }
});
