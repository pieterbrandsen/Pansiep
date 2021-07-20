import { forEach, intersectionWith, isUndefined, sortBy } from "lodash";
import StructureHelper from "../../structure/helper";
import RoomConstants from "../../utils/constants/room";
import UtilsHelper from "../../utils/helper";
import FuncWrapper from "../../utils/wrapper";
import RoomHelper from "../helper";
import JobHandler from "../jobs/handler";

export default class RoomPlannerHandler {
  /**
   * Checks if source is missing energy structure, if this is true then try to build an link if the controller level is high enough otherwise an container.
   */
  public static PlanSources = FuncWrapper(function Sources(room: Room): void {
    const sources = RoomHelper.Reader.GetSources(room);
    forEach(sources, (source: Source) => {
      const harvestJobId: Id<Job> = `harvest-${source.pos.x}/${source.pos.y}` as Id<Job>;
      if (JobHandler.GetJob(harvestJobId, room.name) === null) {
        JobHandler.CreateJob.CreateHarvestJob(harvestJobId, source);
      }

      const maxLinkCount =
        CONTROLLER_STRUCTURES[STRUCTURE_LINK][
          room.controller ? room.controller.level : 1
        ];
      const strType: StructureConstant =
        maxLinkCount >= 3 ? STRUCTURE_LINK : STRUCTURE_CONTAINER;
      const energyStructure = RoomHelper.Reader.GetPositionEnergyStructure(
        room,
        source.pos
      );
      if (energyStructure !== null) {
        if (energyStructure.structureType !== strType)
          energyStructure.destroy();
      }
      const range = strType === STRUCTURE_LINK ? 2 : 1;
      const pos: RoomPosition = RoomHelper.Reader.GetBestEnergyStructurePosAroundPosition(
        room,
        source.pos,
        range
      );
      StructureHelper.BuildStructure(room, pos, strType, true);
    });
  });

  /**
   * Checks if controller is missing energy structure, if this is true then try to build an link if the controller level is high enough otherwise an container.
   */
  public static PlanController = FuncWrapper(function Controller(
    room: Room
  ): void {
    if (isUndefined(room.controller) || room.controller.level === 1) {
      return;
    }

    const maxLinkCount =
      CONTROLLER_STRUCTURES[STRUCTURE_LINK][room.controller.level];
    const strType: StructureConstant =
      maxLinkCount >= 3 ? STRUCTURE_LINK : STRUCTURE_CONTAINER;
    const energyStructure = RoomHelper.Reader.GetPositionEnergyStructure(
      room,
      room.controller.pos
    );
    if (energyStructure !== null) {
      if (energyStructure.structureType !== strType) energyStructure.destroy();
    }
    const range = 2;
    const pos: RoomPosition = RoomHelper.Reader.GetBestEnergyStructurePosAroundPosition(
      room,
      room.controller.pos,
      range
    );
    StructureHelper.BuildStructure(room, pos, strType, true);
  });

  /**
   * Return an planned extension part to use in base building
   */
  public static GetExtensionPartOfBase = FuncWrapper(
    function GetExtensionPartOfBase(
      pos: RoomPosition,
      filterOnStrTypes?: StructureConstant[]
    ): BaseStructure[] {
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
      return structures;
    }
  );

  /**
   * Return an planned lab part to use in base building
   */
  public static GetLabPartOfBase = FuncWrapper(function GetLabPartOfBase(
    pos: RoomPosition,
    filterOnStrType?: StructureConstant[]
  ): BaseStructure[] {
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
    ].filter((s) =>
      filterOnStrType ? filterOnStrType.includes(s.type) : true
    );
    return structures;
  });

  /**
   * Return an planned heart part to use in base building
   */
  public static GetHearthOfBase = FuncWrapper(function GetHearthOfBase(
    pos: RoomPosition,
    filterOnStrType?: StructureConstant[]
  ): BaseStructure[] {
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
    ].filter((s) =>
      filterOnStrType ? filterOnStrType.includes(s.type) : true
    );
    return structures;
  });

  /**
   * Return an boolean indicating if the inputted positions will fit in the currently placed base
   */
  public static DoesPositionsOfBaseFit = FuncWrapper(
    function DoesPositionsOfBaseFit(
      room: Room,
      positions: RoomPosition[],
      blackListedPositions?: RoomPosition[]
    ): boolean {
      let doesFit = true;
      for (let i = 0; i < positions.length; i += 1) {
        const pos = positions[i];
        const terrain: RoomPosition[] = RoomHelper.Reader.GetTerrainInRange(
          pos,
          0,
          room,
          ["wall"]
        );
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

      return doesFit;
    }
  );

  /**
   * Return room position array where parts can be placed around this position
   */
  public static GetSurroundingRoomPositions = FuncWrapper(
    function GetSurroundingRoomPositions(
      pos: RoomPosition,
      height: number,
      directionDistance: { n: number; e: number; s: number; w: number }
    ): RoomPosition[] {
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
      return positions;
    }
  );

  /**
   * Return all positions in diagonal direction.
   */
  public static GetDiagonalExtensionRoomPositions = FuncWrapper(
    function GetDiagonalExtensionRoomPositions(
      pos: RoomPosition,
      height: number,
      width: number
    ): RoomPosition[] {
      const positions: RoomPosition[] = [
        new RoomPosition(pos.x - width + 1, pos.y + height - 1, pos.roomName),
        new RoomPosition(pos.x + width - 1, pos.y + height - 1, pos.roomName),
        new RoomPosition(pos.x - width + 1, pos.y - height + 1, pos.roomName),
        new RoomPosition(pos.x + width - 1, pos.y - height + 1, pos.roomName),
      ];
      return positions;
    }
  );

  /**
   * Sets hearth, labs and hearth part in memory
   */
  public static GetCompleteBasePlanned = FuncWrapper(
    function GetCompleteBasePlanned(room: Room): void {
      const freePositions = RoomHelper.Reader.GetTerrainInRange(
        new RoomPosition(25, 25, room.name),
        10,
        room,
        ["plain", "swamp"]
      );
      const positions: RoomPosition[] = [];

      forEach(freePositions, (pos: RoomPosition) => {
        const walls = RoomHelper.Reader.GetTerrainInRange(pos, 2, room, [
          "wall",
        ]);
        if (walls.length === 0) positions.push(pos);
      });

      let usedPositions: RoomPosition[] = [];
      const mem = RoomHelper.GetRoomMemory(room.name);

      const spawns = RoomHelper.Reader.GetStructures(room.name, [
        STRUCTURE_SPAWN,
      ]) as StructureSpawn[];

      if (isUndefined(mem.base)) mem.base = { extension: [] };
      if (spawns.length > 0)
        mem.base.hearth = sortBy(spawns, (s) => s.name)[0].pos;
      else {
        // eslint-disable-next-line consistent-return
        forEach(positions, (pos: RoomPosition) => {
          const baseStructures = RoomPlannerHandler.GetHearthOfBase(pos, [
            STRUCTURE_ROAD,
          ]);
          if (
            mem.base &&
            RoomPlannerHandler.DoesPositionsOfBaseFit(
              room,
              baseStructures.map((s) => s.pos),
              usedPositions
            )
          ) {
            const baseStructurePositions = baseStructures.map(
              (s: BaseStructure) => s.pos
            );
            usedPositions = usedPositions.concat(baseStructurePositions);
            mem.base.hearth = pos;
          }
        });
      }

      if (isUndefined(mem.base.hearth)) return;

      const labPositions = RoomPlannerHandler.GetSurroundingRoomPositions(
        mem.base.hearth,
        3,
        { n: 5, e: 5, s: 5, w: 6 }
      );

      for (let i = 0; i < labPositions.length; i += 1) {
        const pos = labPositions[i];
        const labStructures = RoomPlannerHandler.GetLabPartOfBase(pos, [
          STRUCTURE_ROAD,
        ]);
        if (
          RoomPlannerHandler.DoesPositionsOfBaseFit(
            room,
            labStructures.map((s) => s.pos)
          )
        ) {
          usedPositions = usedPositions.concat(labStructures.map((s) => s.pos));
          mem.base.lab = pos;
          break;
        }
      }

      mem.base.extension = [];
      const hearthExtensionPositions = RoomPlannerHandler.GetSurroundingRoomPositions(
        mem.base.hearth,
        4,
        { n: 5, e: 4, s: 5, w: 5 }
      );

      for (let i = 0; i < hearthExtensionPositions.length; i += 1) {
        if (mem.base && mem.base.extension.length === 12) {
          break;
        }

        const extensionHearthPos = hearthExtensionPositions[i];
        let extensionStructures = RoomPlannerHandler.GetExtensionPartOfBase(
          extensionHearthPos
        ).filter((s) => s.type !== STRUCTURE_ROAD);
        if (
          mem.base &&
          RoomPlannerHandler.DoesPositionsOfBaseFit(
            room,
            extensionStructures.map((s) => s.pos),
            usedPositions
          )
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
            const extensionPositions = RoomPlannerHandler.GetDiagonalExtensionRoomPositions(
              extensionHearthPos,
              3,
              3
            );
            for (let j = 0; j < extensionPositions.length; j += 1) {
              const posJ = extensionPositions[j];
              extensionStructures = RoomPlannerHandler.GetExtensionPartOfBase(
                posJ,
                [STRUCTURE_ROAD]
              );
              if (
                RoomPlannerHandler.DoesPositionsOfBaseFit(
                  room,
                  extensionStructures.map((s) => s.pos),
                  usedPositions
                )
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
    }
  );

  /**
   * Build base parts what needs to be build
   */
  public static GetBaseBuild = FuncWrapper(function GetBaseBuild(
    room: Room
  ): void {
    const mem = RoomHelper.GetRoomMemory(room.name);

    if (mem.base && room.controller) {
      if (mem.base.hearth) {
        const hearthBaseStructures = RoomPlannerHandler.GetHearthOfBase(
          mem.base.hearth
        );
        forEach(hearthBaseStructures, (str: BaseStructure) => {
          StructureHelper.BuildStructure(room, str.pos, str.type);
        });
      }
      const controllerLevel = room.controller.level;
      if (mem.base.lab && controllerLevel >= 6) {
        const labBaseStructures = RoomPlannerHandler.GetLabPartOfBase(
          mem.base.lab
        );
        forEach(labBaseStructures, (str: BaseStructure) => {
          StructureHelper.BuildStructure(room, str.pos, str.type);
        });
      }

      for (
        let i = 0;
        i < CONTROLLER_STRUCTURES.extension[controllerLevel] / 5;
        i += 1
      ) {
        const extensionPartPos = mem.base.extension[i];
        const extensionBaseStructures = RoomPlannerHandler.GetExtensionPartOfBase(
          extensionPartPos
        );
        forEach(extensionBaseStructures, (str) => {
          StructureHelper.BuildStructure(room, str.pos, str.type);
        });
      }
    }
  });

  /**
   * If the base is planned, build the base to current max stage
   */
  public static ExecuteBasePlanner = FuncWrapper(function ExecuteRoomPlanner(
    room: Room
  ): void {
    const mem = RoomHelper.GetRoomMemory(room.name);

    if (isUndefined(mem.base)) {
      RoomPlannerHandler.GetCompleteBasePlanned(room);
    }
    RoomPlannerHandler.GetBaseBuild(room);
  });

  /**
   * Execute room planner, if its supposed too it executes it.
   */
  public static TryToExecuteRoomPlanner = FuncWrapper(
    function TryToExecuteRoomPlanner(room: Room, forceExecute = false): void {
      if (
        UtilsHelper.ExecuteEachTick(
          RoomConstants.RoomSourcePlannerDelay,
          forceExecute
        )
      ) {
        RoomPlannerHandler.PlanSources(room);
      }
      if (RoomHelper.IsMyOwnedRoom(room) && room.controller) {
        if (
          UtilsHelper.ExecuteEachTick(
            RoomConstants.RoomControllerPlannerDelay,
            forceExecute
          )
        ) {
          RoomPlannerHandler.PlanController(room);
        }
        const mem = RoomHelper.GetRoomMemory(room.name);

        const controllerLevel = room.controller.level;
        const lastControllerLevel = mem.lastControllerLevelAtRoomPlanner
          ? mem.lastControllerLevelAtRoomPlanner
          : 0;
        if (
          UtilsHelper.ExecuteEachTick(
            RoomConstants.RoomBasePlannerDelay,
            lastControllerLevel < controllerLevel
          )
        ) {
          RoomPlannerHandler.ExecuteBasePlanner(room);
        }
        mem.lastControllerLevelAtRoomPlanner = controllerLevel;
      }
    }
  );
}
