import {
  forEach,
  intersection,
  intersectionBy,
  intersectionWith,
  isEqual,
  isUndefined,
} from "lodash";
import { BuildStructure } from "../structure/helper";
import { FunctionReturnCodes, Username } from "../utils/constants/global";
import {
  RoomBasePlannerDelay,
  RoomControllerPlannerDelay,
  RoomSourcePlannerDelay,
  VisualDisplayLevels,
} from "../utils/constants/room";
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
import { AddCircleWPos, AddTextWCoords, AddTextWPos } from "./visuals";

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

export const GetExtensionPartOfBase = FuncWrapper(
  function GetExtensionPartOfBase(pos: RoomPosition): FunctionReturn {
    const extension: BaseStructure = {
      type: STRUCTURE_EXTENSION,
      pos: new RoomPosition(pos.x, pos.y, pos.roomName),
    };
    const extension2: BaseStructure = {
      type: STRUCTURE_EXTENSION,
      pos: new RoomPosition(pos.x + 1, pos.y, pos.roomName),
    };
    const extension3: BaseStructure = {
      type: STRUCTURE_EXTENSION,
      pos: new RoomPosition(pos.x - 1, pos.y, pos.roomName),
    };
    const extension4: BaseStructure = {
      type: STRUCTURE_EXTENSION,
      pos: new RoomPosition(pos.x, pos.y + 1, pos.roomName),
    };
    const extension5: BaseStructure = {
      type: STRUCTURE_EXTENSION,
      pos: new RoomPosition(pos.x, pos.y - 1, pos.roomName),
    };

    const road: BaseStructure = {
      type: STRUCTURE_ROAD,
      pos: new RoomPosition(pos.x + 2, pos.y, pos.roomName),
    };
    const road2: BaseStructure = {
      type: STRUCTURE_ROAD,
      pos: new RoomPosition(pos.x + 1, pos.y + 1, pos.roomName),
    };
    const road3: BaseStructure = {
      type: STRUCTURE_ROAD,
      pos: new RoomPosition(pos.x, pos.y + 2, pos.roomName),
    };
    const road4: BaseStructure = {
      type: STRUCTURE_ROAD,
      pos: new RoomPosition(pos.x - 1, pos.y + 1, pos.roomName),
    };
    const road5: BaseStructure = {
      type: STRUCTURE_ROAD,
      pos: new RoomPosition(pos.x - 2, pos.y, pos.roomName),
    };
    const road6: BaseStructure = {
      type: STRUCTURE_ROAD,
      pos: new RoomPosition(pos.x - 1, pos.y - 1, pos.roomName),
    };
    const road7: BaseStructure = {
      type: STRUCTURE_ROAD,
      pos: new RoomPosition(pos.x, pos.y - 2, pos.roomName),
    };
    const road8: BaseStructure = {
      type: STRUCTURE_ROAD,
      pos: new RoomPosition(pos.x + 1, pos.y - 1, pos.roomName),
    };

    const structures: BaseStructure[] = [
      extension,
      extension2,
      extension3,
      extension4,
      extension5,
      road,
      road2,
      road3,
      road4,
      road5,
      road6,
      road7,
      road8,
    ];
    return FunctionReturnHelper(FunctionReturnCodes.OK, structures);
  }
);

export const GetLabPartOfBase = FuncWrapper(function GetLabPartOfBase(
  pos: RoomPosition
): FunctionReturn {
  const lab: BaseStructure = {
    type: STRUCTURE_LAB,
    pos: new RoomPosition(pos.x, pos.y, pos.roomName),
  };
  const lab2: BaseStructure = {
    type: STRUCTURE_LAB,
    pos: new RoomPosition(pos.x, pos.y - 1, pos.roomName),
  };
  const lab3: BaseStructure = {
    type: STRUCTURE_LAB,
    pos: new RoomPosition(pos.x - 1, pos.y - 1, pos.roomName),
  };
  const lab4: BaseStructure = {
    type: STRUCTURE_LAB,
    pos: new RoomPosition(pos.x + 1, pos.y - 1, pos.roomName),
  };
  const lab5: BaseStructure = {
    type: STRUCTURE_LAB,
    pos: new RoomPosition(pos.x - 2, pos.y, pos.roomName),
  };
  const lab6: BaseStructure = {
    type: STRUCTURE_LAB,
    pos: new RoomPosition(pos.x + 2, pos.y, pos.roomName),
  };
  const lab7: BaseStructure = {
    type: STRUCTURE_LAB,
    pos: new RoomPosition(pos.x - 2, pos.y + 1, pos.roomName),
  };
  const lab8: BaseStructure = {
    type: STRUCTURE_LAB,
    pos: new RoomPosition(pos.x - 1, pos.y + 1, pos.roomName),
  };
  const lab9: BaseStructure = {
    type: STRUCTURE_LAB,
    pos: new RoomPosition(pos.x + 2, pos.y + 1, pos.roomName),
  };
  const lab10: BaseStructure = {
    type: STRUCTURE_LAB,
    pos: new RoomPosition(pos.x + 1, pos.y + 1, pos.roomName),
  };

  const road: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x, pos.y + 1, pos.roomName),
  };
  const road2: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x - 1, pos.y, pos.roomName),
  };
  const road3: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x + 1, pos.y, pos.roomName),
  };
  const road4: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x - 2, pos.y - 1, pos.roomName),
  };
  const road5: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x + 2, pos.y - 1, pos.roomName),
  };

  const structures: BaseStructure[] = [
    lab,
    lab2,
    lab3,
    lab4,
    lab5,
    lab6,
    lab7,
    lab8,
    lab9,
    lab10,
    road,
    road2,
    road3,
    road4,
    road5,
  ];
  return FunctionReturnHelper(FunctionReturnCodes.OK, structures);
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

  const road: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x + 1, pos.y, pos.roomName),
  };
  const road2: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x + 2, pos.y, pos.roomName),
  };
  const road4: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x + 2, pos.y + 1, pos.roomName),
  };
  const road5: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x + 2, pos.y + 2, pos.roomName),
  };
  const road6: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x + 2, pos.y + 3, pos.roomName),
  };
  const road8: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x + 1, pos.y + 3, pos.roomName),
  };
  const road9: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x, pos.y + 3, pos.roomName),
  };
  const road10: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x - 1, pos.y + 3, pos.roomName),
  };
  const road11: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x - 2, pos.y + 3, pos.roomName),
  };
  const road12: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x - 3, pos.y + 3, pos.roomName),
  };
  const road13: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x - 3, pos.y + 2, pos.roomName),
  };
  const road14: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x - 3, pos.y + 1, pos.roomName),
  };
  const road15: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x - 3, pos.y, pos.roomName),
  };
  const road16: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x - 3, pos.y - 1, pos.roomName),
  };
  const road17: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x - 3, pos.y - 2, pos.roomName),
  };
  const road18: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x - 3, pos.y - 3, pos.roomName),
  };
  const road19: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x - 2, pos.y - 3, pos.roomName),
  };
  const road20: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x - 1, pos.y - 3, pos.roomName),
  };
  const road21: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x, pos.y - 3, pos.roomName),
  };
  const road22: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x + 1, pos.y - 3, pos.roomName),
  };
  const road24: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x + 2, pos.y - 3, pos.roomName),
  };
  const road25: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x + 2, pos.y - 2, pos.roomName),
  };
  const road26: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x + 2, pos.y - 1, pos.roomName),
  };
  const road27: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x - 2, pos.y - 2, pos.roomName),
  };
  const road28: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x - 1, pos.y, pos.roomName),
  };
  const road29: BaseStructure = {
    type: STRUCTURE_ROAD,
    pos: new RoomPosition(pos.x - 2, pos.y, pos.roomName),
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
    road,
    road2,
    road4,
    road5,
    road6,
    road8,
    road9,
    road10,
    road11,
    road12,
    road13,
    road14,
    road15,
    road16,
    road17,
    road18,
    road19,
    road20,
    road21,
    road22,
    road24,
    road25,
    road26,
    road27,
    road28,
    road29,
  ];
  return FunctionReturnHelper(FunctionReturnCodes.OK, structures);
});

export const DoesPositionsOfBaseFit = FuncWrapper(
  function DoesPositionsOfBaseFit(
    room: Room,
    positions: RoomPosition[],
    blackListedPositions?: RoomPosition[]
  ): FunctionReturn {
    let doesFit = true;
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const terrain: RoomPosition[] = GetTerrainInRange(pos, 0, room, ["wall"])
        .response;
      if (terrain.length > 0) {
        doesFit = false;
        break;
      }
    }

    if (
      blackListedPositions &&
      intersectionWith(
        positions,
        blackListedPositions,
        (a: RoomPosition, b: RoomPosition) => a.x === b.x && a.y === b.y
      ).length > 0
    )
      doesFit = false;

    if (!doesFit) return FunctionReturnHelper(FunctionReturnCodes.NOT_FITTING);
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const GetSurroundingRoomPositions = FuncWrapper(
  function GetSurroundingRoomPositions(
    pos: RoomPosition,
    height: number,
    width: number,
    directionDistance: { n: number; e: number; s: number; w: number }
  ): FunctionReturn {
    const positions: RoomPosition[] = [];
    let lastY = 0;
    // North
    positions.push(
      new RoomPosition(pos.x, pos.y - directionDistance.n, pos.roomName)
    );

    // East
    const lowestEastY = pos.y + directionDistance.s;
    lastY = pos.y - directionDistance.n;
    while (lastY <= lowestEastY) {
      positions.push(
        new RoomPosition(pos.x + directionDistance.e, lastY, pos.roomName)
      );
      lastY += height;
    }

    // South
    positions.push(
      new RoomPosition(pos.x, pos.y + directionDistance.s, pos.roomName)
    );

    // West
    const lowestWestY = pos.y + directionDistance.s;
    lastY = pos.y - directionDistance.n;
    while (lastY <= lowestWestY) {
      positions.push(
        new RoomPosition(pos.x - +directionDistance.w, lastY, pos.roomName)
      );
      lastY += height;
    }
    return FunctionReturnHelper(FunctionReturnCodes.OK, positions);
  }
);

export const GetDiagonalExtensionRoomPositions = FuncWrapper(
  function GetDiagonalExtensionRoomPositions(
    pos: RoomPosition,
    height: number,
    width: number
  ): FunctionReturn {
    const positions: RoomPosition[] = [];
    positions.push(
      new RoomPosition(pos.x - width + 1, pos.y + height - 1, pos.roomName)
    );
    positions.push(
      new RoomPosition(pos.x + width - 1, pos.y + height - 1, pos.roomName)
    );
    positions.push(
      new RoomPosition(pos.x - width + 1, pos.y - height + 1, pos.roomName)
    );
    positions.push(
      new RoomPosition(pos.x + width - 1, pos.y - height + 1, pos.roomName)
    );
    return FunctionReturnHelper(FunctionReturnCodes.OK, positions);
  }
);

export const GetCompleteBasePlanned = FuncWrapper(
  function GetCompleteBasePlanned(room: Room): FunctionReturn {
    const freePositions: RoomPosition[] = GetTerrainInRange(
      new RoomPosition(25, 25, room.name),
      10,
      room,
      ["plain", "swamp"]
    ).response;
    const positions: RoomPosition[] = [];
    forEach(freePositions, (pos: RoomPosition) => {
      const walls: RoomPosition[] = GetTerrainInRange(pos, 3, room, ["wall"])
        .response;
      if (walls.length === 0) positions.push(pos);
    });

    let usedPositions: RoomPosition[] = [];
    const mem: RoomMemory = GetRoomMemoryUsingName(room.name).response;
    if (isUndefined(mem.base)) mem.base = { extension: [] };
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const baseStructures = GetHearthOfBase(pos).response.filter(
        (s) => s.type !== STRUCTURE_ROAD
      );
      if (
        mem.base &&
        DoesPositionsOfBaseFit(
          room,
          baseStructures.map((i) => i.pos),
          usedPositions
        ).code === FunctionReturnCodes.OK
      ) {
        usedPositions = usedPositions.concat(
          baseStructures.map((s: BaseStructure) => s.pos)
        );
        mem.base.hearth = pos;
        break;
      }
    }

    if (mem.base.hearth) {
      const hearthPos: RoomPosition = mem.base.hearth;
      const labPositions: RoomPosition[] = GetSurroundingRoomPositions(
        hearthPos,
        3,
        5,
        { n: 5, e: 5, s: 5, w: 6 }
      ).response;
      for (let i = 0; i < labPositions.length; i++) {
        const pos = labPositions[i];
        const labStructures: BaseStructure[] = GetLabPartOfBase(
          pos
        ).response.filter((s) => s.type !== STRUCTURE_ROAD);
        if (
          DoesPositionsOfBaseFit(
            room,
            labStructures.map((s) => s.pos)
          ).code === FunctionReturnCodes.OK
        ) {
          usedPositions = usedPositions.concat(
            labStructures.map((s: BaseStructure) => s.pos)
          );
          mem.base.lab = pos;
          break;
        }
      }
    }

    if (mem.base.hearth) {
      const hearthPos: RoomPosition = mem.base.hearth;
      mem.base.extension = [];

      const hearthExtensionPositions: RoomPosition[] = GetSurroundingRoomPositions(
        hearthPos,
        4,
        4,
        { n: 5, e: 4, s: 5, w: 5 }
      ).response;
      for (let i = 0; i < hearthExtensionPositions.length; i++) {
        if (mem.base.extension.length === 12) {
          break;
        }

        const pos = hearthExtensionPositions[i];
        let extensionStructures: BaseStructure[] = GetExtensionPartOfBase(
          pos
        ).response.filter((s) => s.type !== STRUCTURE_ROAD);
        if (
          DoesPositionsOfBaseFit(
            room,
            extensionStructures.map((s) => s.pos),
            usedPositions
          ).code === FunctionReturnCodes.OK
        ) {
          usedPositions = usedPositions.concat(
            extensionStructures.map((s: BaseStructure) => s.pos)
          );
          mem.base.extension.push(pos);

          if (mem.base.extension.length === 12) {
            break;
          }

          if (pos.x > 5 && pos.x < 45 && pos.y > 5 && pos.y < 45) {
            const extensionPositions: RoomPosition[] = GetDiagonalExtensionRoomPositions(
              pos,
              3,
              3
            ).response.filter((s) => s.type !== STRUCTURE_ROAD);
            for (let j = 0; j < extensionPositions.length; j++) {
              const pos = extensionPositions[j];
              extensionStructures = GetExtensionPartOfBase(pos).response.filter(
                (s) => s.type !== STRUCTURE_ROAD
              );
              if (
                DoesPositionsOfBaseFit(
                  room,
                  extensionStructures.map((s) => s.pos),
                  usedPositions
                ).code === FunctionReturnCodes.OK
              ) {
                usedPositions = usedPositions.concat(
                  extensionStructures.map((s: BaseStructure) => s.pos)
                );
                mem.base.extension.push(pos);
                if (mem.base.extension.length === 12) {
                  break;
                }
              }
            }
          }
        }
      }
    }

    return FunctionReturnHelper(FunctionReturnCodes.OK, {});
  }
);

export const GetBasePlanned = FuncWrapper(function Base(
  room: Room
): FunctionReturn {
  const mem: RoomMemory = GetRoomMemoryUsingName(room.name).response;
  if (isUndefined(mem.base)) {
    GetCompleteBasePlanned(room);
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const GetBaseBuild = FuncWrapper(function GetBaseBuild(
  room: Room
): FunctionReturn {
  const mem: RoomMemory = GetRoomMemoryUsingName(room.name).response;
  if (mem.base && room.controller) {
    if (mem.base.hearth) {
      const hearthBaseStructures: BaseStructure[] = GetHearthOfBase(
        mem.base.hearth
      ).response;
      forEach(hearthBaseStructures, (str: BaseStructure) => {
          BuildStructure(room, str.pos, str.type);
      });
    }
    const controllerLevel = room.controller.level;
    if (mem.base.lab && controllerLevel >=6) {
      const labBaseStructures: BaseStructure[] = GetLabPartOfBase(
        mem.base.lab
      ).response;
      forEach(labBaseStructures, (str: BaseStructure) => {
        BuildStructure(room, str.pos, str.type);
      });
    }

    for (let i = 0; i < (CONTROLLER_STRUCTURES["extension"][controllerLevel] / 5); i++) {
      const extensionPartPos = mem.base.extension[i];
      const extensionBaseStructures: BaseStructure[] = GetExtensionPartOfBase(
        extensionPartPos
      ).response;
      forEach(extensionBaseStructures, (str: BaseStructure) => {
        BuildStructure(room, str.pos, str.type);
      });
    }
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const ExecuteBasePlanner = FuncWrapper(function ExecuteRoomPlanner(
  room: Room
): FunctionReturn {
  GetBasePlanned(room);
    GetBaseBuild(room);

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const TryToExecuteRoomPlanner = FuncWrapper(
  function TryToExecuteRoomPlanner(room: Room,forceExecute = false): FunctionReturn {
    if (ExecuteEachTick(RoomSourcePlannerDelay,forceExecute).response) {
      Sources(room);
    }
    if (
      room.controller && (room.controller.owner
        ? room.controller.owner.username === Username
        : false)
    ) {
      if (ExecuteEachTick(RoomControllerPlannerDelay,forceExecute).response) {
        Controller(room);
      }
      const mem: RoomMemory= GetRoomMemoryUsingName(room.name).response;
      const controllerLevel = room.controller.level;
      const lastControllerLevel = mem.lastControllerLevelAtRoomPlanner ? mem.lastControllerLevelAtRoomPlanner : 0;
      if (ExecuteEachTick(RoomBasePlannerDelay, forceExecute ? forceExecute : lastControllerLevel < controllerLevel).response) {
        ExecuteBasePlanner(room);
      }
      mem.lastControllerLevelAtRoomPlanner = controllerLevel;
      UpdateRoomMemory(mem, room.name);
    }
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);
