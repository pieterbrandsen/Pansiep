import { forEach, intersectionWith, isUndefined, sortBy } from "lodash";
import StructureHelper from "../../structure/helper";
import RoomConstants from "../../utils/constants/room";
import UtilsHelper from "../../utils/helper";
import FuncWrapper from "../../utils/wrapper";
import RoomHelper from "../helper";
import JobHandler from "../jobs/handler";
import RoomPartGeneratorHandler from "./partGenerators";

export default class RoomPlannerHandler {
  /**
   * Checks if source is missing energy structure, if this is true then try to build an link if the controller level is high enough otherwise an container.
   */
  public static PlanSources = FuncWrapper(function Sources(room: Room): void {
    const sources = RoomHelper.Reader.GetSources(room);
    forEach(sources, (source: Source) => {
      const harvestJobId: Id<Job> = JobHandler.CreateJob.GetHarvestJobId(source.pos);
      if (JobHandler.GetJob(harvestJobId, room.name) === null) {
        JobHandler.CreateJob.CreateHarvestJob(source);
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
          const baseStructures = RoomPartGeneratorHandler.GetHearthOfBase(pos, [
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
        const labStructures = RoomPartGeneratorHandler.GetLabPartOfBase(pos, [
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
        let extensionStructures = RoomPartGeneratorHandler.GetExtensionPartOfBase(
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
              extensionStructures = RoomPartGeneratorHandler.GetExtensionPartOfBase(
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
        const hearthBaseStructures = RoomPartGeneratorHandler.GetHearthOfBase(
          mem.base.hearth
        );
        forEach(hearthBaseStructures, (str: BaseStructure) => {
          StructureHelper.BuildStructure(room, str.pos, str.type);
        });
      }
      const controllerLevel = room.controller.level;
      if (mem.base.lab && controllerLevel >= 6) {
        const labBaseStructures = RoomPartGeneratorHandler.GetLabPartOfBase(
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
        const extensionBaseStructures = RoomPartGeneratorHandler.GetExtensionPartOfBase(
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
