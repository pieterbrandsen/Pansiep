import { forEach } from "lodash";
import UtilsHelper from "../utils/helper";
import StructureHelper from "./helper";
import MemoryInitializationHandler from "../memory/initialization";
import StatsHandler from "../memory/stats";
import WrapperHandler from "../utils/wrapper";

export default class StructureManager {
  /**
   * Execute an structure using its ID.
   */
  public static RunStructure = WrapperHandler.FuncWrapper(function RunStructure(
    id: Id<Structure>
  ): void {
    const structure = StructureHelper.GetStructure(id);
    if(structure === undefined) return;
    
    StatsHandler.StructureStatsPreProcessing(structure);
    StructureHelper.ExecuteStructure(structure);
  });

  /**
   * Execute all structures in room using room name as id.
   */
  public static Run = WrapperHandler.FuncWrapper(function RunStructures(
    roomId: string
  ): void {
    const structureIds = StructureHelper.GetAllStructureIds(roomId);
    forEach(structureIds, (id: Id<Structure>) => {
      if (MemoryInitializationHandler.IsStructureMemoryInitialized(id))
        StructureManager.RunStructure(id);
    });
  });
}
