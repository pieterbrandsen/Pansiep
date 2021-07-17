import { first, forEach, union } from "lodash";
import { FunctionReturnCodes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/functionStatusGenerator";
import { FuncWrapper } from "../utils/wrapper";
import { GetObjectsFromIDs } from "./helper";
import {
  DangerousStructureTypes,
  WalkableStructureTypes,
} from "../utils/constants/structure";

/**
 * Return the terrain of the room
 *
 * @param {Room} room - Room where terrain is requested
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetTerrain = FuncWrapper(function GetTerrain(
  room: Room
): FunctionReturn {
  const terrain: RoomTerrain = room.getTerrain();
  return FunctionReturnHelper(FunctionReturnCodes.OK, terrain);
});

/**
 * Return all structures in range of the inputted position
 *
 * @param {RoomPosition} pos - Middle position
 * @param {number} range - Range from middle
 * @param {Room} room - Room where the structures are requested
 * @param {StructureConstant[]} [filterOnStrType] - Return only structures types based on this array
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetStructuresInRange = FuncWrapper(function GetStructuresInRange(
  pos: RoomPosition,
  range: number,
  room: Room,
  filterOnStrType?: StructureConstant[]
): FunctionReturn {
  const structures = room
    .lookForAtArea(
      LOOK_STRUCTURES,
      pos.y - range,
      pos.x - range,
      pos.y + range,
      pos.x + range,
      true
    )
    .filter((s) =>
      filterOnStrType
        ? filterOnStrType.includes(s.structure.structureType)
        : true
    )
    .map((s) => s.structure);
  return FunctionReturnHelper(FunctionReturnCodes.OK, structures);
});

/**
 * Return all construction sites in range of the inputted position
 *
 * @param {RoomPosition} pos - Middle position
 * @param {number} range - Range from middle
 * @param {Room} room - Room where the construction sites are requested
 * @param {StructureConstant[]} [filterOnStrType] - Return only structures types based on this array
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetConstructionSitesInRange = FuncWrapper(
  function GetConstructionSitesInRange(
    pos: RoomPosition,
    range: number,
    room: Room,
    filterOnStrType?: StructureConstant[]
  ): FunctionReturn {
    const constructionSites = room
      .lookForAtArea(
        LOOK_CONSTRUCTION_SITES,
        pos.y - range,
        pos.x - range,
        pos.y + range,
        pos.x + range,
        true
      )
      .filter((s) =>
        filterOnStrType
          ? filterOnStrType.includes(s.constructionSite.structureType)
          : true
      )
      .map((s) => s.constructionSite);
    return FunctionReturnHelper(FunctionReturnCodes.OK, constructionSites);
  }
);

/**
 * Return all sources in range of the inputted position
 *
 * @param {RoomPosition} pos - Middle position
 * @param {number} range - Range from middle
 * @param {Room} room - Room where the sources are requested
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetSourcesInRange = FuncWrapper(function GetSourcesInRange(
  pos: RoomPosition,
  range: number,
  room: Room
): FunctionReturn {
  const sources = room
    .lookForAtArea(
      LOOK_SOURCES,
      pos.y - range,
      pos.x - range,
      pos.y + range,
      pos.x + range,
      true
    )
    .map((s) => s.source);
  return FunctionReturnHelper(FunctionReturnCodes.OK, sources);
});

/**
 * Return all terrain in range of the inputted position
 *
 * @param {RoomPosition} pos - Middle position
 * @param {number} range - Range from middle
 * @param {Room} room - Room where the sources are requested
 * @param {Terrain[]} [filterOnTerrainType] - Return only terrain types based on this array
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetTerrainInRange = FuncWrapper(function GetTerrainInRange(
  pos: RoomPosition,
  range: number,
  room: Room,
  filterOnTerrainType?: Terrain[]
): FunctionReturn {
  const terrain = room
    .lookForAtArea(
      LOOK_TERRAIN,
      pos.y - range,
      pos.x - range,
      pos.y + range,
      pos.x + range,
      true
    )
    .filter((t) =>
      filterOnTerrainType ? filterOnTerrainType.includes(t.terrain) : true
    )
    .map((t) => new RoomPosition(t.x, t.y, room.name));

  return FunctionReturnHelper(FunctionReturnCodes.OK, terrain);
});

/**
 * Return all structures of inputted room
 *
 * @param {Room} room - Room where the structures are requested
 * @param {StructureConstant[]} [filterOnStrTypes] - Return only structures types based on this array
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetStructures = FuncWrapper(function GetStructures(
  roomName: string,
  filterOnStrTypes?: StructureConstant[]
): FunctionReturn {
  if (Memory.cache.structures.data[roomName] !== undefined)
    return GetObjectsFromIDs<Structure>(
      Memory.cache.structures.data[roomName]
        .filter((s) =>
          filterOnStrTypes ? filterOnStrTypes.includes(s.structureType) : true
        )
        .map((s) => s.id)
    );

  return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
});

export const GetDangerousStructures = FuncWrapper(
  function GetDangerousStructures(roomName: string): FunctionReturn {
    const structures = GetStructures(roomName).response;

    return FunctionReturnHelper(
      FunctionReturnCodes.OK,
      structures.filter((s: Structure) =>
        DangerousStructureTypes.includes(s.structureType)
      )
    );
  }
);

/**
 * Find all exits in an room
 *
 * @param {Room} room - Room with exits
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const FindExits = FuncWrapper(function FindExits(
  room: Room
): FunctionReturn {
  return FunctionReturnHelper(FunctionReturnCodes.OK, room.find(FIND_EXIT));
});

/**
 * Find all exits in an room
 *
 * @param {string} roomName - Room name
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetAccessibleSurroundingRoomNames = FuncWrapper(
  function GetAccessibleSurroundingRoomNames(roomName: string): FunctionReturn {
    const exits = Game.map.describeExits(roomName);
    const surroundingRoomNames: string[] = Object.values(exits) as string[];
    return FunctionReturnHelper(FunctionReturnCodes.OK, surroundingRoomNames);
  }
);

/**
 * returns an boolean indicating if position is surrounded
 *
 * @param {RoomPosition} roomPos - Room position to check
 * @param {Room} room - Room of position
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const IsPositionDefended = FuncWrapper(function IsPositionDefended(
  roomPos: RoomPosition,
  room: Room
): FunctionReturn {
  const structures: Structure[] = GetStructuresInRange(roomPos, 2, room, [
    STRUCTURE_TOWER,
    STRUCTURE_SPAWN,
    STRUCTURE_RAMPART,
    STRUCTURE_WALL,
    STRUCTURE_CONTROLLER,
  ]).response;
  const terrain: RoomPosition[] = GetTerrainInRange(roomPos, 2, room, ["wall"])
    .response;
  const positions = union(
    structures.map((s) => s.pos),
    terrain
  );

  let isStructureDefended = false;
  const strOpenSpotsClassifiedByRange = { 0: 1, 1: 8, 2: 16 };
  forEach(positions, (pos: RoomPosition) => {
    strOpenSpotsClassifiedByRange[pos.getRangeTo(roomPos)] -= 1;
  });

  forEach(Object.values(strOpenSpotsClassifiedByRange), (total: number) => {
    if (total === 0) isStructureDefended = true;
  });

  return FunctionReturnHelper(FunctionReturnCodes.OK, isStructureDefended);
});

/**
 * Return the mineral if its in the room
 *
 * @param {Room} room - Room where mineral should be located
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetMineral = FuncWrapper(function GetMineral(
  room: Room
): FunctionReturn {
  const minerals = room.find(FIND_MINERALS);
  if (minerals.length === 0)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);

  return FunctionReturnHelper(FunctionReturnCodes.OK, first(minerals));
});

/**
 * Return an boolean indicating if there is an extractor at the minerals position
 *
 * @param {Room} room - Room where mineral should be located
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const HasMineralStructure = FuncWrapper(function HasMineralStructure(
  room: Room
): FunctionReturn {
  const mineral: Mineral = GetMineral(room).response;
  const structures: Structure[] = GetStructuresInRange(mineral.pos, 0, room, [
    STRUCTURE_EXTRACTOR,
  ]).response;

  if (structures.length > 0) {
    return FunctionReturnHelper(FunctionReturnCodes.OK, first(structures));
  }
  return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
});

/**
 * Return all sources if they are found in the room
 *
 * @param {Room} room - Room where sources should be located
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetSources = FuncWrapper(function GetSources(
  room: Room
): FunctionReturn {
  const sources = room.find(FIND_SOURCES);
  if (sources.length === 0)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);

  return FunctionReturnHelper(FunctionReturnCodes.OK, sources);
});

/**
 * Return an boolean indicating if the the position has an structure where it energy can be dispensed in
 *
 * @param {Room} room - Room where sources should be located
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const HasPositionEnergyStructures = FuncWrapper(
  function HasPositionEnergyStructures(room: Room, pos: RoomPosition) {
    const structures: Array<
      StructureContainer | StructureLink | StructureStorage | StructureTerminal
    > = GetStructuresInRange(pos, 2, room, [
      STRUCTURE_CONTAINER,
      STRUCTURE_LINK,
      STRUCTURE_STORAGE,
      STRUCTURE_TERMINAL,
    ]).response;
    if (structures.length === 1) {
      return FunctionReturnHelper(FunctionReturnCodes.OK, first(structures));
    }
    if (structures.length > 1) {
      return FunctionReturnHelper(
        FunctionReturnCodes.OK,
        first(structures.sort((a, b) => a.store.energy - b.store.energy))
      );
    }
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  }
);

/**
 * Get the amount of acces points that are around the position
 *
 * @param {Room} room - Room to check in
 * @param {RoomPosition} pos - Middle position of check point
 * @param {1 | 2} range - All positions in a 1 or 2 range of position
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetAccesSpotsAroundPosition = FuncWrapper(
  function GetAccesSpotsAroundPosition(
    room: Room,
    pos: RoomPosition,
    range: 1 | 2
  ): FunctionReturn {
    let openSpots = range === 1 ? 8 : 24;
    openSpots += 2;
    const blockedTerrain: RoomPosition[] = GetTerrainInRange(pos, range, room, [
      "wall",
    ]).response.filter((p: RoomPosition) => p.getRangeTo(pos) > 0);

    openSpots -= blockedTerrain.length;
    const structures = GetStructuresInRange(pos, range, room);
    forEach(structures, (str: Structure) => {
      openSpots -= 1;
      if (WalkableStructureTypes.includes(str.structureType)) {
        if (
          str.structureType === STRUCTURE_RAMPART &&
          (str as StructureRampart).my
        ) {
          openSpots += 1;
        }
      }

      if (str.pos === pos) openSpots += 1;
    });
    return FunctionReturnHelper(FunctionReturnCodes.OK, openSpots);
  }
);

/**
 * Return the best position where an energy structure should be placed. This calculation is done based on acces points and range away from position
 *
 * @param {Room} room - Room to check in
 * @param {RoomPosition} pos - Middle position of check point
 * @param {1 | 2} range - All positions in a 1 or 2 range of position
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetBestEnergyStructurePosAroundPosition = FuncWrapper(
  function GetBestEnergyStructurePosAroundPosition(
    room: Room,
    position: RoomPosition,
    range: 1 | 2
  ): FunctionReturn {
    const positions: RoomPosition[] = GetTerrainInRange(position, range, room, [
      "plain",
      "swamp",
    ]).response;
    let bestPos: { pos: RoomPosition; accesSpots: number; distance: number } = {
      pos: position,
      accesSpots: 99,
      distance: 99,
    };
    forEach(positions, (pos: RoomPosition) => {
      const accesSpots = GetAccesSpotsAroundPosition(room, pos, 1).response;
      const distance = pos.getRangeTo(position);
      if (
        distance > 0 &&
        bestPos.distance >= distance &&
        bestPos.accesSpots >= accesSpots
      ) {
        bestPos = { pos, accesSpots, distance };
      }
    });
    return FunctionReturnHelper(FunctionReturnCodes.OK, bestPos.pos);
  }
);

// export const GetBestWallSpots = FuncWrapper(function GetBestWallSpots(room: Room): FunctionReturn {
//   const getTerrain = GetTerrain(room);
//   if (getTerrain.code !== FunctionReturnCodes.OK)
//     return FunctionReturnHelper(FunctionReturnCodes.INTERNAL_SERVER_ERROR);
//   const terrain = getTerrain.response;

//   const findExits = FindExits(room);
//   if (findExits.code !== FunctionReturnCodes.OK)
//     return FunctionReturnHelper(FunctionReturnCodes.INTERNAL_SERVER_ERROR);
//   const exits = findExits.response;

//   const combinedExits:RoomPosition[] = [];
//   let lastPos:RoomPosition = new RoomPosition(25,25,room.name);
//   forEach(exits, (pos:RoomPosition) => {
//     if (pos.getRangeTo(lastPos) > 1) combinedExits.push(pos);
//     lastPos = pos;
//   });

//   AddTextWPos(room, "🟥", room.controller!.pos, VisualDisplayLevels.Debug, { align: "left" });
//   return FunctionReturnHelper(FunctionReturnCodes.OK);
// })
