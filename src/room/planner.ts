import { forEach, intersectionWith, isUndefined, sortBy } from "lodash";
import { BuildStructure } from "../structure/helper";
import { FunctionReturnCodes } from "../utils/constants/global";
import {
  RoomBasePlannerDelay,
  RoomControllerPlannerDelay,
  RoomSourcePlannerDelay,
} from "../utils/constants/room";
import { ExecuteEachTick } from "../utils/helper";
import { FunctionReturnHelper } from "../utils/functionStatusGenerator";
import { FuncWrapper } from "../utils/wrapper";
import {
  GetRoomMemoryUsingName,
  IsMyOwnedRoom,
  UpdateRoomMemory,
} from "./helper";
import { CreateHarvestJob } from "./jobs/create";
import { GetJobById } from "./jobs/handler";
import {
  GetSources,
  HasPositionEnergyStructures,
  GetBestEnergyStructurePosAroundPosition,
  GetTerrainInRange,
  GetStructures,
} from "./reading";

/**
 * Checks if source is missing energy structure, if this is true then try to build an link if the controller level is high enough otherwise an container.
 *
 * @param {Room} room - Check sources in this room
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const Sources = FuncWrapper(function Sources(
  room: Room
): FunctionReturn {
  const getSources = GetSources(room);
  if (getSources.code) return FunctionReturnHelper(getSources.code);
  const sources: Source[] = getSources.response;
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

/**
 * Checks if controller is missing energy structure, if this is true then try to build an link if the controller level is high enough otherwise an container.
 *
 * @param {Room} room - Check sources in this room
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
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

/**
 * Return an planned extension part to use in base building
 *
 * @param {RoomPosition} pos - Middle position of part
 * @param {StructureConstant[]} [filterOnStrTypes] - Filter on structureTypes if inputted
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetExtensionPartOfBase = FuncWrapper(
  function GetExtensionPartOfBase(
    pos: RoomPosition,
    filterOnStrTypes?: StructureConstant[]
  ): FunctionReturn {
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
    ].filter((s) =>
      filterOnStrTypes ? filterOnStrTypes.includes(s.type) : true
    );
    return FunctionReturnHelper(FunctionReturnCodes.OK, structures);
  }
);

/**
 * Return an planned lab part to use in base building
 *
 * @param {RoomPosition} pos - Middle position of part
 * @param {StructureConstant[]} [filterOnStrTypes] - Filter on structureTypes if inputted
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetLabPartOfBase = FuncWrapper(function GetLabPartOfBase(
  pos: RoomPosition,
  filterOnStrType?: StructureConstant[]
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
  ].filter((s) => (filterOnStrType ? filterOnStrType.includes(s.type) : true));
  return FunctionReturnHelper(FunctionReturnCodes.OK, structures);
});

/**
 * Return an planned heart part to use in base building
 *
 * @param {RoomPosition} pos - Middle position of part
 * @param {StructureConstant[]} [filterOnStrTypes] - Filter on structureTypes if inputted
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetHearthOfBase = FuncWrapper(function GetHearthOfBase(
  pos: RoomPosition,
  filterOnStrType?: StructureConstant[]
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
  ].filter((s) => (filterOnStrType ? filterOnStrType.includes(s.type) : true));
  return FunctionReturnHelper(FunctionReturnCodes.OK, structures);
});

/**
 * Return an boolean indicating if the inputted positions will fit in the currently placed base
 *
 * @param {Room} room - Room of part
 * @param {RoomPosition[]} positions - Positions to check
 * @param {RoomPosition[]} [blackListedPositions] - Already placed positions from parts
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const DoesPositionsOfBaseFit = FuncWrapper(
  function DoesPositionsOfBaseFit(
    room: Room,
    positions: RoomPosition[],
    blackListedPositions?: RoomPosition[]
  ): FunctionReturn {
    let doesFit = true;
    for (let i = 0; i < positions.length; i += 1) {
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

/**
 * Return room position array where parts can be placed around this position
 *
 * @param {RoomPosition} pos - Middle position
 * @param {number} height - Height of part
 * @param {{ n: number; e: number; s: number; w: number }} directionDistance - Minimum distance for each direction
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetSurroundingRoomPositions = FuncWrapper(
  function GetSurroundingRoomPositions(
    pos: RoomPosition,
    height: number,
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

/**
 * Return all positions in diagonal direction.
 *
 * @param {RoomPosition} pos - Middle position
 * @param {number} height - Height away from middle
 * @param {number} width - Width away from middle
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetDiagonalExtensionRoomPositions = FuncWrapper(
  function GetDiagonalExtensionRoomPositions(
    pos: RoomPosition,
    height: number,
    width: number
  ): FunctionReturn {
    const positions: RoomPosition[] = [
      new RoomPosition(pos.x - width + 1, pos.y + height - 1, pos.roomName),
      new RoomPosition(pos.x + width - 1, pos.y + height - 1, pos.roomName),
      new RoomPosition(pos.x - width + 1, pos.y - height + 1, pos.roomName),
      new RoomPosition(pos.x + width - 1, pos.y - height + 1, pos.roomName),
    ];
    return FunctionReturnHelper(FunctionReturnCodes.OK, positions);
  }
);

/**
 * Sets hearth, labs and hearth part in memory
 *
 * @param {Room} room - Room supposed to be planned
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetCompleteBasePlanned = FuncWrapper(
  function GetCompleteBasePlanned(room: Room): FunctionReturn {
    let getTerrainInRange = GetTerrainInRange(
      new RoomPosition(25, 25, room.name),
      10,
      room,
      ["plain", "swamp"]
    );
    if (getTerrainInRange.code !== FunctionReturnCodes.OK)
      return FunctionReturnHelper(getTerrainInRange.code);
    const freePositions: RoomPosition[] = getTerrainInRange.response;
    const positions: RoomPosition[] = [];

    forEach(freePositions, (pos: RoomPosition) => {
      getTerrainInRange = GetTerrainInRange(pos, 2, room, ["wall"]);
      const walls: RoomPosition[] = getTerrainInRange.response;
      if (walls.length === 0) positions.push(pos);
    });

    let usedPositions: RoomPosition[] = [];
    const getRoomMemoryUsingName = GetRoomMemoryUsingName(room.name);
    if (getRoomMemoryUsingName.code !== FunctionReturnCodes.OK)
      return FunctionReturnHelper(getRoomMemoryUsingName.code);
    const mem: RoomMemory = getRoomMemoryUsingName.response;

    const getStructures = GetStructures(room.name, [STRUCTURE_SPAWN]);
    if (getStructures.code !== FunctionReturnCodes.OK)
      return FunctionReturnHelper(getStructures.code);
    const spawns: StructureSpawn[] = getStructures.response;

    if (isUndefined(mem.base)) mem.base = { extension: [] };
    if (spawns.length > 0)
      mem.base.hearth = sortBy(spawns, (s) => s.name)[0].pos;
    else {
      // eslint-disable-next-line consistent-return
      forEach(positions, (pos: RoomPosition) => {
        const getHearthOfBase = GetHearthOfBase(pos, [STRUCTURE_ROAD]);
        if (getHearthOfBase.code !== FunctionReturnCodes.OK)
          return FunctionReturnHelper(getHearthOfBase.code);
        const baseStructures: BaseStructure[] = getHearthOfBase.response;
        if (
          mem.base &&
          DoesPositionsOfBaseFit(
            room,
            baseStructures.map((s) => s.pos),
            usedPositions
          ).code === FunctionReturnCodes.OK
        ) {
          const baseStructurePositions = baseStructures.map(
            (s: BaseStructure) => s.pos
          );
          usedPositions = usedPositions.concat(baseStructurePositions);
          mem.base.hearth = pos;
        }
      });
    }

    if (isUndefined(mem.base.hearth))
      return FunctionReturnHelper(FunctionReturnCodes.NOT_FITTING);

    let getSurroundingRoomPositions = GetSurroundingRoomPositions(
      mem.base.hearth,
      3,
      { n: 5, e: 5, s: 5, w: 6 }
    );
    if (getSurroundingRoomPositions.code !== FunctionReturnCodes.OK)
      return FunctionReturnHelper(getSurroundingRoomPositions.code);
    const labPositions: RoomPosition[] = getSurroundingRoomPositions.response;

    for (let i = 0; i < labPositions.length; i += 1) {
      const pos = labPositions[i];
      const getLabPartOfBase = GetLabPartOfBase(pos, [STRUCTURE_ROAD]);
      if (getLabPartOfBase.code !== FunctionReturnCodes.OK)
        return FunctionReturnHelper(getLabPartOfBase.code);
      const labStructures: BaseStructure[] = getLabPartOfBase.response;
      if (
        DoesPositionsOfBaseFit(
          room,
          labStructures.map((s) => s.pos)
        ).code === FunctionReturnCodes.OK
      ) {
        usedPositions = usedPositions.concat(labStructures.map((s) => s.pos));
        mem.base.lab = pos;
        break;
      }
    }

    mem.base.extension = [];
    getSurroundingRoomPositions = GetSurroundingRoomPositions(
      mem.base.hearth,
      4,
      { n: 5, e: 4, s: 5, w: 5 }
    );
    if (getSurroundingRoomPositions.code !== FunctionReturnCodes.OK)
      return FunctionReturnHelper(getSurroundingRoomPositions.code);
    const hearthExtensionPositions: RoomPosition[] =
      getSurroundingRoomPositions.response;

    for (let i = 0; i < hearthExtensionPositions.length; i += 1) {
      if (mem.base && mem.base.extension.length === 12) {
        break;
      }

      const extensionHearthPos = hearthExtensionPositions[i];
      let getExtensionPartOfBase = GetExtensionPartOfBase(extensionHearthPos);
      if (getExtensionPartOfBase.code !== FunctionReturnCodes.OK)
        return FunctionReturnHelper(getExtensionPartOfBase.code);
      let extensionStructures: BaseStructure[] = getExtensionPartOfBase.response.filter(
        (s) => s.type !== STRUCTURE_ROAD
      );
      if (
        mem.base &&
        DoesPositionsOfBaseFit(
          room,
          extensionStructures.map((s) => s.pos),
          usedPositions
        ).code === FunctionReturnCodes.OK
      ) {
        usedPositions = usedPositions.concat(
          extensionStructures.map((s) => s.pos)
        );
        mem.base.extension.push(extensionHearthPos);

        if (mem.base.extension.length === 12) {
          break;
        }

        if (
          extensionHearthPos.x > 5 &&
          extensionHearthPos.x < 45 &&
          extensionHearthPos.y > 5 &&
          extensionHearthPos.y < 45
        ) {
          const getDiagonalExtensionRoomPositions = GetDiagonalExtensionRoomPositions(
            extensionHearthPos,
            3,
            3
          );
          if (getDiagonalExtensionRoomPositions.code !== FunctionReturnCodes.OK)
            return FunctionReturnHelper(getDiagonalExtensionRoomPositions.code);
          const extensionPositions: RoomPosition[] =
            getDiagonalExtensionRoomPositions.response;
          for (let j = 0; j < extensionPositions.length; j += 1) {
            const posJ = extensionPositions[j];
            getExtensionPartOfBase = GetExtensionPartOfBase(posJ, [
              STRUCTURE_ROAD,
            ]);
            if (getExtensionPartOfBase.code !== FunctionReturnCodes.OK) break;
            extensionStructures = getExtensionPartOfBase.response;
            if (
              DoesPositionsOfBaseFit(
                room,
                extensionStructures.map((s) => s.pos),
                usedPositions
              ).code === FunctionReturnCodes.OK
            ) {
              usedPositions = usedPositions.concat(
                extensionStructures.map((s) => s.pos)
              );
              mem.base.extension.push(posJ);
              if (mem.base.extension.length === 12) {
                break;
              }
            }
          }
        }
      }
    }

    return FunctionReturnHelper(FunctionReturnCodes.OK, {});
  }
);

/**
 * Execute complete base planner if its not yet known in the memory
 *
 * @param {Room} room - Room supposed to be planned
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetBasePlanned = FuncWrapper(function Base(
  room: Room
): FunctionReturn {
  const getRoomMemoryUsingName = GetRoomMemoryUsingName(room.name);
  if (getRoomMemoryUsingName.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getRoomMemoryUsingName.code);
  const mem: RoomMemory = getRoomMemoryUsingName.response;

  if (isUndefined(mem.base)) {
    GetCompleteBasePlanned(room);
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

/**
 * Build base parts what needs to be build
 *
 * @param {Room} room - Room supposed to be planned
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetBaseBuild = FuncWrapper(function GetBaseBuild(
  room: Room
): FunctionReturn {
  const getRoomMemoryUsingName = GetRoomMemoryUsingName(room.name);
  if (getRoomMemoryUsingName.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getRoomMemoryUsingName.code);
  const mem: RoomMemory = getRoomMemoryUsingName.response;

  if (mem.base && room.controller) {
    if (mem.base.hearth) {
      const getHearthOfBase = GetHearthOfBase(mem.base.hearth);
      if (getHearthOfBase.code !== FunctionReturnCodes.OK)
        return FunctionReturnHelper(getHearthOfBase.code);
      const hearthBaseStructures: BaseStructure[] = getHearthOfBase.response;
      forEach(hearthBaseStructures, (str: BaseStructure) => {
        BuildStructure(room, str.pos, str.type);
      });
    }
    const controllerLevel = room.controller.level;
    if (mem.base.lab && controllerLevel >= 6) {
      const getLabPartOfBase = GetLabPartOfBase(mem.base.lab);
      if (getLabPartOfBase.code !== FunctionReturnCodes.OK)
        return FunctionReturnHelper(getLabPartOfBase.code);
      const labBaseStructures: BaseStructure[] = getLabPartOfBase.response;
      forEach(labBaseStructures, (str: BaseStructure) => {
        BuildStructure(room, str.pos, str.type);
      });
    }

    for (
      let i = 0;
      i < CONTROLLER_STRUCTURES.extension[controllerLevel] / 5;
      i += 1
    ) {
      const extensionPartPos = mem.base.extension[i];
      const getExtensionPartOfBase = GetExtensionPartOfBase(extensionPartPos);
      if (getExtensionPartOfBase.code !== FunctionReturnCodes.OK)
        return FunctionReturnHelper(getExtensionPartOfBase.code);
      const extensionBaseStructures: BaseStructure[] =
        getExtensionPartOfBase.response;
      forEach(extensionBaseStructures, (str) => {
        BuildStructure(room, str.pos, str.type);
      });
    }
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

/**
 * If the base is planned, build the base to current max stage
 *
 * @param {Room} room - Room supposed to be planned
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const ExecuteBasePlanner = FuncWrapper(function ExecuteRoomPlanner(
  room: Room
): FunctionReturn {
  if (GetBasePlanned(room).code === FunctionReturnCodes.OK) GetBaseBuild(room);

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

/**
 * Execute room planner, if its supposed too it executes it.
 *
 * @param {Room} room - Room supposed to be planned
 * @param {Boolean} [forceExecute=false] - Force execute module without waiting for right tick value
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const TryToExecuteRoomPlanner = FuncWrapper(
  function TryToExecuteRoomPlanner(
    room: Room,
    forceExecute = false
  ): FunctionReturn {
    if (ExecuteEachTick(RoomSourcePlannerDelay, forceExecute).response) {
      Sources(room);
    }
    if (
      IsMyOwnedRoom(room).code === FunctionReturnCodes.OK &&
      room.controller
    ) {
      if (ExecuteEachTick(RoomControllerPlannerDelay, forceExecute).response) {
        Controller(room);
      }
      const getRoomMemoryUsingName = GetRoomMemoryUsingName(room.name);
      if (getRoomMemoryUsingName.code !== FunctionReturnCodes.OK)
        return FunctionReturnHelper(getRoomMemoryUsingName.code);
      const mem: RoomMemory = getRoomMemoryUsingName.response;

      const controllerLevel = room.controller.level;
      const lastControllerLevel = mem.lastControllerLevelAtRoomPlanner
        ? mem.lastControllerLevelAtRoomPlanner
        : 0;
      if (
        ExecuteEachTick(
          RoomBasePlannerDelay,
          lastControllerLevel < controllerLevel
        ).response
      ) {
        ExecuteBasePlanner(room);
      }
      mem.lastControllerLevelAtRoomPlanner = controllerLevel;
      UpdateRoomMemory(mem, room.name);
    }
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);
