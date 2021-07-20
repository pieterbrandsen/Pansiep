import { isUndefined } from "lodash";
import UtilsHelper from "../../utils/helper";
import { IsStructureDamaged } from "../../structure/types/helper";
import FuncWrapper from "../../utils/wrapper";
import JobHandler from "../../room/jobs/handler";
import CreepActions from "./actions";
import CreepHelper from "../helper";

// eslint-disable-next-line
export default FuncWrapper(function ExecuteRepair(
  creep: Creep,
  job: Job
): void {
  const creepMemory = CreepHelper.GetCreepMemory(creep.name);
  const structure = UtilsHelper.GetObject(job.objId) as Structure;
  if (!IsStructureDamaged(structure)) {
    JobHandler.DeleteJob(job.id, job.roomName);
    return;
  }

  switch (creep.repair(structure)) {
    case OK:
      creep.say("Repair");
      if (isUndefined(creepMemory.parts[WORK]))
        creepMemory.parts[WORK] = creep.getActiveBodyparts(WORK);
      global.preProcessingStats.rooms[creep.room.name].energyExpenses.repair +=
        creepMemory.parts[WORK];
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
      JobHandler.DeleteJob(job.id, job.roomName);
      break;
    default:
      break;
  }
});
