import JobHandler from "../../room/jobs/handler";
import UtilsHelper from "../../utils/helper";
import WrapperHandler from "../../utils/wrapper";

// export const GetPath = WrapperHandler.FuncWrapper(function GetPath(creep:Creep,targetPos:RoomPosition): FunctionReturn {
//   const path = creep.pos.findPathTo(targetPos);
//   return FunctionReturnHelper(FunctionReturnCodes.OK,path);
// })

// eslint-disable-next-line
export default WrapperHandler.FuncWrapper(function ExecuteMove(
  creep: Creep,
  job: Job
): void {
  const targetPos: RoomPosition = job.position
    ? UtilsHelper.RehydrateRoomPosition(job.position)
    : new RoomPosition(25, 25, job.roomName);

  switch (
    creep.moveTo(targetPos, {
      visualizePathStyle: {
        fill: "transparent",
        stroke: "#fff",
        lineStyle: "dashed",
        strokeWidth: 0.15,
        opacity: 0.1,
      },
    })
  ) {
    case OK:
      break;
    case ERR_NO_PATH:
      JobHandler.UnassignJob(job.id, creep.name, job.roomName);
      break;
    default:
      break;
  }

  // creepMem.walkPath = GetPath(creep,targetPos).response;
});
