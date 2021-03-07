import { forEach, isUndefined } from "lodash";
import { BuildStructure } from "../structure/helper";
import { FunctionReturnCodes } from "../utils/constants/global";
import { RoomPlannerDelay } from "../utils/constants/room";
import { ExecuteEachTick } from "../utils/helper";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FuncWrapper } from "../utils/wrapper";
import { GetJobById, UpdateJobById } from "./jobs";
import {
  GetAccesSpotsAroundPosition,
  GetSources,
  HasPositionEnergyStructures,
  GetBestEnergyStructurePosAroundPosition,
} from "./reading";

export const CreateHarvestJob = FuncWrapper(function CreateHarvestJob(
  jobId: Id<Job>,
  source: Source
): FunctionReturn {
  const openSpots: number = GetAccesSpotsAroundPosition(
    source.room,
    source.pos,
    1
  ).response;
  const job: Job = {
    id: jobId,
    action: "harvest",
    updateJobAtTick: Game.time + 100,
    assignedCreepsIds: [],
    maxCreeps: openSpots,
    assignedStructuresIds: [],
    maxStructures: 99,
    roomName: source.room.name,
    objId: source.id,
    hasPriority: true,
    resourceType: RESOURCE_ENERGY,
    position: { x: source.pos.x, y: source.pos.y },
  };
  UpdateJobById(jobId, job, source.room.name);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const Sources = FuncWrapper(function Sources(
  room: Room
): FunctionReturn {
  const sources: Source[] = GetSources(room).response;
  forEach(sources, (source: Source) => {
    const harvestJobId: Id<Job> = `harvest-${source.pos.x}/${source.pos.y}` as Id<Job>;
    if (
      GetJobById(harvestJobId, room.name).code === FunctionReturnCodes.NOT_FOUND
    ) {
      CreateHarvestJob(harvestJobId, source);
    }

    const maxLinkCount =
      CONTROLLER_STRUCTURES[STRUCTURE_LINK][
        room.controller ? room.controller.level : 1
      ];
    const strType: StructureConstant =
      maxLinkCount >= 3 ? STRUCTURE_LINK : STRUCTURE_CONTAINER;
    const hasPositionEnergyStructures = HasPositionEnergyStructures(
      room,
      source.pos
    );
    if (hasPositionEnergyStructures.code === FunctionReturnCodes.OK) {
      const str: Structure = hasPositionEnergyStructures.response;
      if (str.structureType !== strType) str.destroy();
    }
    const range = strType === STRUCTURE_LINK ? 2 : 1;
    const pos: RoomPosition = GetBestEnergyStructurePosAroundPosition(
      room,
      source.pos,
      range
    ).response;
    BuildStructure(room, pos, strType, true);
  });

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const Controller = FuncWrapper(function Controller(
  room: Room
): FunctionReturn {
  if (isUndefined(room.controller)) {
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  }

  const maxLinkCount =
    CONTROLLER_STRUCTURES[STRUCTURE_LINK][room.controller.level];
  const strType: StructureConstant =
    maxLinkCount >= 3 ? STRUCTURE_LINK : STRUCTURE_CONTAINER;
  const hasPositionEnergyStructures = HasPositionEnergyStructures(
    room,
    room.controller.pos
  );
  if (hasPositionEnergyStructures.code === FunctionReturnCodes.OK) {
    const str: Structure = hasPositionEnergyStructures.response;
    if (str.structureType !== strType) str.destroy();
  }
  const range = 2;
  const pos: RoomPosition = GetBestEnergyStructurePosAroundPosition(
    room,
    room.controller.pos,
    range
  ).response;
  BuildStructure(room, pos, strType, true);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const ExecuteRoomPlanner = FuncWrapper(function ExecuteRoomPlanner(
  room: Room
): FunctionReturn {
  Sources(room);

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const TryToExecuteRoomPlanner = FuncWrapper(
  function TryToExecuteRoomPlanner(room: Room): FunctionReturn {
    if (ExecuteEachTick(RoomPlannerDelay).response) {
      ExecuteRoomPlanner(room);
      Controller(room);
      return FunctionReturnHelper(FunctionReturnCodes.OK);
    }
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);
  }
);
