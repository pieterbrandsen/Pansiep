import { UnassignJob } from "../../room/jobs/handler";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { CreateRoomPosition } from "../../utils/helper";
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
    ? CreateRoomPosition(job.position).response
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
      creep.say("move");
      break;
    case ERR_NO_PATH:
      UnassignJob(job.id, creep.name, job.roomName);
      break;
    default:
      break;
  }

  // creepMem.walkPath = GetPath(creep,targetPos).response;
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
