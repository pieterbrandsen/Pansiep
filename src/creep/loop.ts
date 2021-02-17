import CreepHelper from "./helper";
import Initialization from "../memory/initialization";

export default class CreepLoop {
  public static Run(roomName: string): boolean {
    const creepNames = CreepHelper.GetAllCreepNames(roomName);
    
    if (creepNames.length == 0) return true;
    creepNames.forEach((name) => {
      if (Initialization.IsCreepMemoryInitialized(name)) {
        this.RunCreep(name);
      } else Initialization.InitializeCreepMemory(name, roomName);
    });

    return true;
  }

  private static RunCreep(name: string): boolean {
    const creep = CreepHelper.GetCreep(name);
    console.log(creep);
    return true;
  }
}
