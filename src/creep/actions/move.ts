import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FuncWrapper } from "../../utils/wrapper";

// export const GetPath = FuncWrapper(function GetPath(creep:Creep,targetPos:RoomPosition): FunctionReturn {
//   const path = creep.pos.findPathTo(targetPos);
//   return FunctionReturnHelper(FunctionReturnCodes.OK,path);
// })

// eslint-disable-next-line
export const ExecuteMove = FuncWrapper(function ExecuteMove(
  creep: Creep,
  job: Job
  // range = 2
): FunctionReturn {
  // const creepMem: CreepMemory = GetCreepMemory(creep.id).response;
  const targetPos: RoomPosition = job.position
    ? new RoomPosition(job.position.x, job.position.y, job.roomName)
    : new RoomPosition(25, 25, job.roomName);

  if (
    creep.moveTo(targetPos, {
      visualizePathStyle: {
        fill: "transparent",
        stroke: "#fff",
        lineStyle: "dashed",
        strokeWidth: 0.15,
        opacity: 0.1,
      },
    }) === OK
  ) {
    creep.say("move");
  }

  // creepMem.walkPath = GetPath(creep,targetPos).response;
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
