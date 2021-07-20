import { forEach } from "lodash";
import FuncWrapper from "../utils/wrapper";
import UtilsHelper from "../utils/helper";
import StructureHelper from "./helper";
import MemoryInitializationHandler from "../memory/initialization";
import StatsHandler from "../memory/stats";

export default class StructureManager {
  /**
   * Execute an structure using its ID.
   */
  private static RunStructure = FuncWrapper(function RunStructure(
    id: Id<Structure>
  ): void {
    const structure = UtilsHelper.GetObject(id) as Structure;
    StatsHandler.StructureStatsPreProcessing(structure);
    StructureHelper.ExecuteStructure(structure);
  });

  /**
   * Execute all structures in room using room name as id.
   */
  public static Run = FuncWrapper(function RunStructures(roomId: string): void {
    const structureIds = StructureHelper.GetAllStructureIds(roomId);
    forEach(structureIds, (id: Id<Structure>) => {
      if (MemoryInitializationHandler.IsStructureMemoryInitialized(id))
        StructureManager.RunStructure(id);
    });
  });
}
