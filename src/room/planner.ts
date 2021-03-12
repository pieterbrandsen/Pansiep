import { forEach, isUndefined } from "lodash";
import { BuildStructure } from "../structure/helper";
import { FunctionReturnCodes } from "../utils/constants/global";
import { RoomPlannerDelay, VisualDisplayLevels } from "../utils/constants/room";
import { ExecuteEachTick } from "../utils/helper";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FuncWrapper } from "../utils/wrapper";
import { GetRoomMemoryUsingName, UpdateRoomMemory } from "./helper";
import { CreateHarvestJob } from "./jobs/create";
import { GetJobById } from "./jobs/handler";
import {
  GetSources,
  HasPositionEnergyStructures,
  GetBestEnergyStructurePosAroundPosition,
  GetTerrainInRange,
} from "./reading";
import { AddTextWPos } from "./visuals";

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
  if (isUndefined(room.controller) || room.controller.level === 1) {
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

export const GetBaseHearthLocation = FuncWrapper(function GetBaseHearthLocation(
  room: Room
): FunctionReturn {
  return FunctionReturnHelper(
    FunctionReturnCodes.OK,
    new RoomPosition(20, 20, room.name)
  );
});

export const GetHearthOfBase = FuncWrapper(function GetHearthOfBase(
  pos: RoomPosition
): FunctionReturn {
  const link: BaseStructure = {
    type: STRUCTURE_LINK,
    pos: new RoomPosition(pos.x, pos.y, pos.roomName),
  };

  const storage: BaseStructure = {
    type: STRUCTURE_STORAGE,
    pos: new RoomPosition(pos.x, pos.y + 1, pos.roomName),
  };
  const terminal: BaseStructure = {
    type: STRUCTURE_TERMINAL,
    pos: new RoomPosition(pos.x, pos.y - 1, pos.roomName),
  };

  const spawn: BaseStructure = {
    type: STRUCTURE_SPAWN,
    pos: new RoomPosition(pos.x - 1, pos.y + 1, pos.roomName),
  };
  const spawn2: BaseStructure = {
    type: STRUCTURE_SPAWN,
    pos: new RoomPosition(pos.x - 1, pos.y - 1, pos.roomName),
  };
  const spawn3: BaseStructure = {
    type: STRUCTURE_SPAWN,
    pos: new RoomPosition(pos.x + 1, pos.y - 1, pos.roomName),
  };

  const factory: BaseStructure = {
    type: STRUCTURE_FACTORY,
    pos: new RoomPosition(pos.x + 1, pos.y + 1, pos.roomName),
  };

  const tower: BaseStructure = {
    type: STRUCTURE_TOWER,
    pos: new RoomPosition(pos.x - 1, pos.y - 2, pos.roomName),
  };
  const tower2: BaseStructure = {
    type: STRUCTURE_TOWER,
    pos: new RoomPosition(pos.x, pos.y - 2, pos.roomName),
  };
  const tower3: BaseStructure = {
    type: STRUCTURE_TOWER,
    pos: new RoomPosition(pos.x + 1, pos.y - 2, pos.roomName),
  };
  const tower4: BaseStructure = {
    type: STRUCTURE_TOWER,
    pos: new RoomPosition(pos.x - 1, pos.y + 2, pos.roomName),
  };
  const tower5: BaseStructure = {
    type: STRUCTURE_TOWER,
    pos: new RoomPosition(pos.x, pos.y + 2, pos.roomName),
  };
  const tower6: BaseStructure = {
    type: STRUCTURE_TOWER,
    pos: new RoomPosition(pos.x + 1, pos.y + 2, pos.roomName),
  };

  const nuker: BaseStructure = {
    type: STRUCTURE_NUKER,
    pos: new RoomPosition(pos.x - 2, pos.y + 2, pos.roomName),
  };
  const powerSpawn: BaseStructure = {
    type: STRUCTURE_POWER_SPAWN,
    pos: new RoomPosition(pos.x - 2, pos.y + 1, pos.roomName),
  };
  const observer: BaseStructure = {
    type: STRUCTURE_OBSERVER,
    pos: new RoomPosition(pos.x - 2, pos.y - 1, pos.roomName),
  };

  const structures: BaseStructure[] = [
    link,
    storage,
    terminal,
    spawn,
    spawn2,
    spawn3,
    factory,
    tower,
    tower2,
    tower3,
    tower4,
    tower5,
    tower6,
    nuker,
    powerSpawn,
    observer,
  ];
  return FunctionReturnHelper(FunctionReturnCodes.OK, structures);
});

export const DoesPositionsOfBaseFit = FuncWrapper(
  function DoesPositionsOfBaseFit(
    room: Room,
    positions: RoomPosition[]
  ): FunctionReturn {
    let doesFit = true;

    forEach(positions, (pos: RoomPosition) => {
      const terrain: RoomPosition[] = GetTerrainInRange(pos, 0, room, ["wall"])
        .response;
      if (terrain.length > 0) {
        doesFit = false;
      }
    });

    if (!doesFit) return FunctionReturnHelper(FunctionReturnCodes.NOT_FITTING);
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const GetCompleteBasePlanned = FuncWrapper(
  function GetCompleteBasePlanned(room: Room): FunctionReturn {
    const hearthPos = GetBaseHearthLocation(room).response;
    forEach(GetHearthOfBase(hearthPos).response, (str: BaseStructure) => {
      BuildStructure(room, str.pos, str.type);
      AddTextWPos(room, "🔴", str.pos, VisualDisplayLevels.Debug);
    });
    return FunctionReturnHelper(FunctionReturnCodes.OK, {});
  }
);

export const GetBasePlanned = FuncWrapper(function Base(
  room: Room
): FunctionReturn {
  if (isUndefined(room.controller))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);

  const mem: RoomMemory = GetRoomMemoryUsingName(room.name).response;
  if (isUndefined(mem.base)) {
    GetCompleteBasePlanned(room);
  }
  const controllerLevel = room.controller.level;
  mem.lastControllerLevelAtRoomPlanner = controllerLevel;
  UpdateRoomMemory(mem, room.name);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const ExecuteRoomPlanner = FuncWrapper(function ExecuteRoomPlanner(
  room: Room
): FunctionReturn {
  Sources(room);

  if (room.controller) GetBasePlanned(room);

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
