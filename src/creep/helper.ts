export default class CreepHelper {
  public static GetAllCreepNames(roomName: string): string[] {
    return Memory.cache.creeps.data[roomName];
  }
}