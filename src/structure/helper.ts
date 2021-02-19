export default class StructureHelper {
  public static GetStructure(id: string): Structure | null {
    return Game.structures[id] !== undefined ? Game.structures[id] : null;
  }

  public static GetAllStructureNames(roomName: string): string[] {
    return Memory.cache.structures.data[roomName]
      ? Memory.cache.structures.data[roomName].map((s) => s.id)
      : [];
  }
}
