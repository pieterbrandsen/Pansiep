import { first, forEach, union } from "lodash";
import StructureConstants from "../utils/constants/structure";
import FuncWrapper from "../utils/wrapper";
import RoomHelper from "./helper";

export default class RoomReadingHelper {
  /**
   * Return the terrain of the room
   */
  public static GetTerrain = FuncWrapper(function GetTerrain(
    room: Room
  ): RoomTerrain {
    const terrain: RoomTerrain = room.getTerrain();
    return terrain;
  });

  /**
   * Return all structures in range of the inputted position
   */
  public static GetStructuresInRange = FuncWrapper(
    function GetStructuresInRange(
      pos: RoomPosition,
      range: number,
      room: Room,
      filterOnStrType?: StructureConstant[]
    ): Structure<StructureConstant>[] {
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
      return structures;
    }
  );

  /**
   * Return all construction sites in range of the inputted position
   */
  public static GetConstructionSitesInRange = FuncWrapper(
    function GetConstructionSitesInRange(
      pos: RoomPosition,
      range: number,
      room: Room,
      filterOnStrType?: StructureConstant[]
    ): ConstructionSite<BuildableStructureConstant>[] {
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
      return constructionSites;
    }
  );

  /**
   * Return all sources in range of the inputted position
   */
  public static GetSourcesInRange = FuncWrapper(function GetSourcesInRange(
    pos: RoomPosition,
    range: number,
    room: Room
  ): Source[] {
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
    return sources;
  });

  /**
   * Return all terrain in range of the inputted position
   */
  public static GetTerrainInRange = FuncWrapper(function GetTerrainInRange(
    pos: RoomPosition,
    range: number,
    room: Room,
    filterOnTerrainType?: Terrain[]
  ): RoomPosition[] {
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

    return terrain;
  });

  /**
   * Return all structures of inputted room
   */
  public static GetStructures = FuncWrapper(function GetStructures(
    roomName: string,
    filterOnStrTypes?: StructureConstant[]
  ): Structure<StructureConstant>[] {
    if (Memory.cache.structures.data[roomName] === undefined) return [];
    return RoomHelper.GetObjectsFromIDs<Structure>(
      Memory.cache.structures.data[roomName]
        .filter((s) =>
          filterOnStrTypes ? filterOnStrTypes.includes(s.structureType) : true
        )
        .map((s) => s.id)
    );
  });

  public static GetDangerousStructures = FuncWrapper(
    function GetDangerousStructures(
      roomName: string
    ): Structure<StructureConstant>[] {
      const structures = RoomReadingHelper.GetStructures(roomName);

      return structures.filter((s: Structure) =>
        StructureConstants.DangerousStructureTypes.includes(s.structureType)
      );
    }
  );

  /**
   * Find all exits in an room
   */
  public static FindExits = FuncWrapper(function FindExits(
    room: Room
  ): RoomPosition[] {
    return room.find(FIND_EXIT);
  });

  /**
   * Find all exits in an room
   */
  public static GetAccessibleSurroundingRoomNames = FuncWrapper(
    function GetAccessibleSurroundingRoomNames(roomName: string): string[] {
      const exits = Game.map.describeExits(roomName);
      const surroundingRoomNames: string[] = Object.values(exits) as string[];
      return surroundingRoomNames;
    }
  );

  /**
   * Returns an boolean indicating if position is surrounded
   */
  public static IsPositionDefended = FuncWrapper(function IsPositionDefended(
    roomPos: RoomPosition,
    room: Room
  ): boolean {
    const structures: Structure[] = RoomReadingHelper.GetStructuresInRange(
      roomPos,
      2,
      room,
      [
        STRUCTURE_TOWER,
        STRUCTURE_SPAWN,
        STRUCTURE_RAMPART,
        STRUCTURE_WALL,
        STRUCTURE_CONTROLLER,
      ]
    );
    const terrain: RoomPosition[] = RoomReadingHelper.GetTerrainInRange(
      roomPos,
      2,
      room,
      ["wall"]
    );
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

    return isStructureDefended;
  });

  /**
   * Return the mineral if its in the room
   */
  public static GetMineral = FuncWrapper(function GetMineral(
    room: Room
  ): Mineral | null {
    const minerals = room.find(FIND_MINERALS);
    return minerals.length > 0 ? minerals[0] : null;
  });

  /**
   * Return an boolean indicating if there is an extractor at the minerals position
   */
  public static GetMineralStructure = FuncWrapper(function GetMineralStructure(
    mineral: Mineral
  ): StructureExtractor | null {
    const structures: Structure[] = RoomReadingHelper.GetStructuresInRange(
      mineral.pos,
      0,
      mineral.room as Room,
      [STRUCTURE_EXTRACTOR]
    );

    return structures.length > 0 ? (structures[0] as StructureExtractor) : null;
  });

  /**
   * Return all sources if they are found in the room
   */
  public static GetSources = FuncWrapper(function GetSources(
    room: Room
  ): Source[] {
    const sources = room.find(FIND_SOURCES);
    return sources;
  });

  /**
   * Return an boolean indicating if the the position has an structure where it energy can be dispensed in
   */
  public static GetPositionEnergyStructure = FuncWrapper(
    function GetPositionEnergyStructure(
      room: Room,
      pos: RoomPosition
    ): Structure | null {
      const structures = RoomReadingHelper.GetStructuresInRange(pos, 2, room, [
        STRUCTURE_CONTAINER,
        STRUCTURE_LINK,
        STRUCTURE_STORAGE,
        STRUCTURE_TERMINAL,
      ]) as Array<
        | StructureContainer
        | StructureLink
        | StructureStorage
        | StructureTerminal
      >;
      if (structures.length === 1) {
        return structures[0];
      }
      if (structures.length > 1) {
        return first(
          structures.sort((a, b) => a.store.energy - b.store.energy)
        ) as Structure;
      }
      return null;
    }
  );

  /**
   * Get the amount of acces points that are around the position
   */
  public static GetAccesSpotsAroundPosition = FuncWrapper(
    function GetAccesSpotsAroundPosition(
      room: Room,
      pos: RoomPosition,
      range: 1 | 2
    ): number {
      let openSpots = range === 1 ? 8 : 24;
      openSpots += 2;
      const blockedTerrain: RoomPosition[] = RoomReadingHelper.GetTerrainInRange(
        pos,
        range,
        room,
        ["wall"]
      ).filter((p: RoomPosition) => p.getRangeTo(pos) > 0);

      openSpots -= blockedTerrain.length;
      const structures = RoomReadingHelper.GetStructuresInRange(
        pos,
        range,
        room
      );
      forEach(structures, (str: Structure) => {
        openSpots -= 1;
        if (
          StructureConstants.WalkableStructureTypes.includes(str.structureType)
        ) {
          if (
            str.structureType === STRUCTURE_RAMPART &&
            (str as StructureRampart).my
          ) {
            openSpots += 1;
          }
        }

        if (str.pos === pos) openSpots += 1;
      });

      return openSpots;
    }
  );

  /**
   * Return the best position where an energy structure should be placed. This calculation is done based on acces points and range away from position
   *
   * @param {Room} room - Room to check in
   * @param {RoomPosition} pos - Middle position of check point
   * @param {1 | 2} range - All positions in a 1 or 2 range of position
   * @return {boolean} HTTP response with code and data
   *
   */
  public static GetBestEnergyStructurePosAroundPosition = FuncWrapper(
    function GetBestEnergyStructurePosAroundPosition(
      room: Room,
      position: RoomPosition,
      range: 1 | 2
    ): RoomPosition {
      const positions: RoomPosition[] = RoomReadingHelper.GetTerrainInRange(
        position,
        range,
        room,
        ["plain", "swamp"]
      );
      let bestPos: {
        pos: RoomPosition;
        accesSpots: number;
        distance: number;
      } = {
        pos: position,
        accesSpots: 99,
        distance: 99,
      };
      forEach(positions, (pos: RoomPosition) => {
        const accesSpots = RoomReadingHelper.GetAccesSpotsAroundPosition(
          room,
          pos,
          1
        );
        const distance = pos.getRangeTo(position);
        if (
          distance > 0 &&
          bestPos.distance >= distance &&
          bestPos.accesSpots >= accesSpots
        ) {
          bestPos = { pos, accesSpots, distance };
        }
      });
      return bestPos.pos;
    }
  );

  // public static GetBestWallSpots = FuncWrapper(function GetBestWallSpots(room: Room): boolean {
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
}
