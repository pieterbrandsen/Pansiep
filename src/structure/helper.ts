export default class StructureHelper {
  public static GetAllStructureNames(roomName: string): string[] {
    return Memory.cache.structures.data[roomName];
  }
}