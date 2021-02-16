import _ from "lodash";
import Logger from "../utils/logger";

interface IGarbageCollection {}

export default class GarbageCollection implements IGarbageCollection {
  public static RemoveCreep(name: string): boolean {
    try {
      delete Memory.creeps[name];
      Logger.Debug(
        "memory/garbageCollection:RemoveCreep",
        "Deleted Creep memory",
        name
      );
      return true;
    } catch (error) {
      Logger.Error("memory/garbageCollection:RemoveCreep", error, name);
      return false;
    }
  }

  public static RemoveStructure(id: string): boolean {
    try {
      delete Memory.structures[id];
      Logger.Debug(
        "memory/garbageCollection:RemoveStructure",
        "Deleted Structure memory",
        id
      );
      return true;
    } catch (error) {
      Logger.Error("memory/garbageCollection:RemoveStructure", error, id);
      return false;
    }
  }

  public static RemoveRoom(roomName: string): boolean {
    try {
      Object.keys(Memory.creeps).forEach((creepName) => {
        const creep = Memory.creeps[creepName];
        if (creep.spawnRoom === roomName) {
          this.RemoveCreep(creepName);
        }
      });

      Object.keys(Memory.structures).forEach((id) => {
        const structure = Memory.structures[id];
        if (structure.room === roomName) {
          this.RemoveStructure(id);
        }
      });

      delete Memory.rooms[roomName];
      Logger.Debug(
        "memory/garbageCollection:RemoveRoom",
        "Deleted Room memory",
        roomName
      );
      return true;
    } catch (error) {
      Logger.Error("memory/garbageCollection:RemoveRoom", error, roomName);
      return false;
    }
  }
}
