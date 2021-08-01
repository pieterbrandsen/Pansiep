import JobHandler from "../../room/jobs/handler";
import UtilsHelper from "../../utils/helper";
import WrapperHandler from "../../utils/wrapper";

import CreepActions from "./actionsGroup";

export default WrapperHandler.FuncWrapper(function ExecuteAttack(
  creep: Creep,
  job: Job
): void {
  const target = UtilsHelper.GetObject(job.objId) as Structure | Creep;

  switch (creep.attack(target)) {
    case OK:
      creep.say("attack");
      break;
    case ERR_NOT_IN_RANGE:
      CreepActions.Move(creep, job);
      break;
    case ERR_INVALID_TARGET:
      if (target.room) JobHandler.DeleteJob(job.roomName, job.id);
      else CreepActions.Move(creep, job);
      break;
    default:
      break;
  }
});
