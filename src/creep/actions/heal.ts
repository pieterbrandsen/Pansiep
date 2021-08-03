import UtilsHelper from "../../utils/helper";

import JobHandler from "../../room/jobs/handler";
import CreepActions from "./actionsGroup";
import CreepHelper from "../helper";
import WrapperHandler from "../../utils/wrapper";

// eslint-disable-next-line
export default WrapperHandler.FuncWrapper(function ExecuteHeal(
  creep: Creep,
  job: Job
): void {
  const targetCreep = UtilsHelper.GetObject(job.objId) as Creep;

  if (!job.stopHealingAtMaxHits && !CreepHelper.IsCreepDamaged(targetCreep)) {
    JobHandler.DeleteJob(job.roomName, job.id);
    return;
  }

  switch (creep.heal(targetCreep)) {
    case OK:
      creep.say("heal");
      break;
    case ERR_NOT_IN_RANGE:
      CreepActions.Move(creep, job);
      break;
    case ERR_INVALID_TARGET:
      if (targetCreep === null || targetCreep.room) JobHandler.DeleteJob(job.roomName, job.id);
      else CreepActions.Move(creep, job);
      break;
    default:
      break;
  }
});
