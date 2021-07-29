import { isUndefined } from "lodash";
import JobHandler from "../../room/jobs/handler";
import WrapperHandler from "../../utils/wrapper";

import CreepHelper from "../helper";
import CreepActions from "./actionsGroup";

// eslint-disable-next-line
export default WrapperHandler.FuncWrapper(function ExecuteUpgrade(
  creep: Creep,
  job: Job
): void {
  const creepMemory = CreepHelper.GetCreepMemory(creep.name);
  if (
    isUndefined(creep.room.controller) ||
    isUndefined(job.energyRequired) ||
    job.energyRequired <= 0
  ) {
    JobHandler.DeleteJob(job.roomName, job.id);
    return;
  }
  const { controller } = creep.room;
  switch (creep.upgradeController(controller)) {
    case OK:
      creep.say("upgrade");
      job.energyRequired -= creep.getActiveBodyparts(WORK) * 2;

      if (isUndefined(creepMemory.parts[WORK]))
        creepMemory.parts[WORK] = creep.getActiveBodyparts(WORK);
      global.preProcessingStats.rooms[creep.room.name].energyExpenses.upgrade +=
        creepMemory.parts[WORK];
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
      if (JobHandler.AssignNewJobForCreep(creep, ["withdrawController"])) {
        JobHandler.UnassignJob(job.id, creep.name, job.roomName);
        JobHandler.AssignNewJobForCreep(
          creep,
          creepMemory.type === "work" || creepMemory.type === "pioneer"
            ? ["withdraw", "harvest"]
            : ["withdraw"]
        );
      } else {
        creepMemory.secondJobId = job.id;
      }
      break;
    case ERR_NOT_IN_RANGE:
      CreepActions.Move(creep, job);
      break;
    case ERR_INVALID_TARGET:
      JobHandler.DeleteJob(job.roomName, job.id);
      break;
    default:
      break;
  }
});
