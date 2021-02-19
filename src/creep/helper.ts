export default class CreepHelper {
  public static GetCreep(id: string): Creep | null {
    return Game.creeps[id] !== undefined ? Game.creeps[id] : null;
  }

  public static GetAllCreepNames(roomName: string): string[] {
    return Memory.cache.creeps.data[roomName]
      ? Memory.cache.creeps.data[roomName].map((c) => c.id)
      : [];
  }
}
