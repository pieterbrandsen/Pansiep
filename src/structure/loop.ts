import StructureHelper from "./helper";
import Initialization from "../memory/initialization";

export default class CreepLoop {
  public static Run(roomName: string): boolean {
    const structureNames = StructureHelper.GetAllStructureNames(roomName);

    if (structureNames.length === 0) return true;
    structureNames.forEach((id) => {
      if (Initialization.IsStructureMemoryInitialized(id)) {
        this.RunStructure(id);
      } else Initialization.InitializeStructureMemory(id, roomName);
    });

    return true;
  }

  private static RunStructure(id: string): boolean {
    const structure = StructureHelper.GetStructure(id);
    console.log(structure);
    return true;
  }
}
