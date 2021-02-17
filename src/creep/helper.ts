export default class CreepHelper {
  public static GetCreep(creepName: string): Creep | null {
    return Game.creeps[creepName];
  }

  public static GetAllCreepNames(roomName: string): string[] {
    return Memory.cache.creeps.data[roomName] ? Memory.cache.creeps.data[roomName] : [];
  }
}
