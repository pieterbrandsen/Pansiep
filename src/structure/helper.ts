import { isUndefined } from "lodash";
import { UpdateJobById } from "../room/jobs";
import { GetAccesSpotsAroundPosition } from "../room/reading";
import { FunctionReturnCodes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FuncWrapper } from "../utils/wrapper";

export const GetStructure = FuncWrapper(function GetStructure(
  id: string
): FunctionReturn {
  const structure: Structure | undefined = Game.structures[id];
  if (isUndefined(structure))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper<Structure>(FunctionReturnCodes.OK, structure);
});

export const GetAllStructureIds = FuncWrapper(function GetAllStructureIds(
  id: string
): FunctionReturn {
  const structureIds: string[] | undefined = Memory.cache.structures.data[id]
    ? Memory.cache.structures.data[id].map((c) => c.id)
    : undefined;
  if (isUndefined(structureIds))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, structureIds);
});

export const BuildStructure = FuncWrapper(function BuildStructure(
  room: Room,
  pos: RoomPosition,
  structureType: StructureConstant
): FunctionReturn {
  const createConstructionSite = room.createConstructionSite(
    pos,
    structureType
  );
  if (createConstructionSite !== OK)
    return FunctionReturnHelper(
      FunctionReturnCodes.NOT_MODIFIED,
      createConstructionSite
    );

  const jobId: Id<Job> = `${pos.x}/${pos.y}-${structureType}` as Id<Job>;
  const job: Job = {
    id: jobId,
    action: "build",
    updateJobAtTick: Game.time + 1,
    assignedCreepsIds: [],
    maxCreeps: GetAccesSpotsAroundPosition(room, pos, 2).response,
    assignedStructuresIds: [],
    maxStructures: 0,
    roomName: room.name,
    objId: "undefined" as Id<ConstructionSite>,
    position: { x: pos.x, y: pos.y },
    energyRequired: CONSTRUCTION_COST[structureType],
  };
  UpdateJobById(jobId, job, room.name);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
