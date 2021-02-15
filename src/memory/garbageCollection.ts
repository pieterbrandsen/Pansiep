import _ from "lodash";

interface IGarbageCollection {}

export default class GarbageCollection implements IGarbageCollection {
  // When do you know when a room/structure should not be saved anymore?
  public static CheckCreeps():boolean {
    try {
      for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
          delete Memory.creeps[name];
        }
      } 
      return true;
    } catch (error) {
      console.log(error);
      Game.notify(error);
      return false;
    }
  }
}
