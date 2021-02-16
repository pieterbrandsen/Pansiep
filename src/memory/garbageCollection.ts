import _ from "lodash";

interface IGarbageCollection {}

export default class GarbageCollection implements IGarbageCollection {
  public static RemoveCreep(name: string): boolean {
    try {
      delete Memory.creeps[name];
      return true;
    } catch (error) {
      console.log(error);
      Game.notify(error);
      return false;
    }
  }

  public static RemoveStructure(id: string): boolean {
    try {
      delete Memory.structures[id];
      return true;
    } catch (error) {
      console.log(error);
      Game.notify(error);
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
      return true;
    } catch (error) {
      console.log(error);
      Game.notify(error);
      return false;
    }
  }
}
