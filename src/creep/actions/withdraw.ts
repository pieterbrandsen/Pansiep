import { isUndefined } from "lodash";
import FuncWrapper from "../../utils/wrapper";
import UtilsHelper from "../../utils/helper";
import JobHandler from "../../room/jobs/handler";
import CreepActions from "./actions";
import CreepHelper from "../helper";
import StructureHelper from "../../structure/helper";

// eslint-disable-next-line
export default FuncWrapper(function ExecuteWithdraw(
  creep: Creep,
  job: Job
): void {
  const creepMemory = CreepHelper.GetCreepMemory(creep.name);
  if (job.energyRequired === undefined || job.energyRequired <= 0) {
    JobHandler.DeleteJob(job.id, job.roomName);
    return;
  }

  const resourceType = job.resourceType as ResourceConstant;
  const structure = UtilsHelper.GetObject(job.objId) as Structure;
  const strUsedCapacity = StructureHelper.GetUsedCapacity(
    structure,
    resourceType
  );
  const creepFreeCapacity = creep.store.getFreeCapacity(resourceType);
  const withdrawAmount: number =
    strUsedCapacity > creepFreeCapacity ? creepFreeCapacity : strUsedCapacity;

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
    case ERR_NOT_ENOUGH_RESOURCES:
    case ERR_INVALID_TARGET:
      JobHandler.DeleteJob(job.id, job.roomName);
      break;
    default:
      break;
  }
});
