import WrapperHandler from "../../utils/wrapper";

export default class RoomPartGeneratorHandler {
  /**
   * Return an planned extension part to use in base building
   */
  public static GetExtensionPartOfBase = WrapperHandler.FuncWrapper(
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
  public static GetLabPartOfBase = WrapperHandler.FuncWrapper(
    function GetLabPartOfBase(
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
    }
  );

  /**
   * Return an planned heart part to use in base building
   */
  public static GetHearthOfBase = WrapperHandler.FuncWrapper(
    function GetHearthOfBase(
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
    }
  );
}
