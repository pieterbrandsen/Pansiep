import CreepHelper from "./helper";
import Initialization from "../memory/initialization";
import Stats from "../memory/stats";

export default class CreepLoop {
  public static Run(roomName: string): boolean {
    const creepNames = CreepHelper.GetAllCreepNames(roomName);

    if (creepNames.length === 0) return true;
    creepNames.forEach((name) => {
      if (Initialization.IsCreepMemoryInitialized(name)) {
        this.RunCreep(name);
      } else Initialization.InitializeCreepMemory(name, roomName);
    });

    return true;
  }

  private static RunCreep(name: string): boolean {
    const creep = CreepHelper.GetCreep(name);
    if (creep === null) return true;

    Stats.CreepStatsPreProcessing(creep);
    return true;
  }
}
