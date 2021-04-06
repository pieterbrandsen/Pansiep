import { forEach } from "lodash";
import { GetAllStructureIds, GetObject, ExecuteStructure } from "./helper";
import { IsStructureMemoryInitialized } from "../memory/initialization";
import { StructureStatsPreProcessing } from "../memory/stats";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnCodes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";

export const RunStructure = FuncWrapper(function RunStructure(
  id: Id<Structure>
): FunctionReturn {
  const getObject = GetObject(id);
  if (getObject.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  const str = getObject.response as Structure;

  StructureStatsPreProcessing(str);
  ExecuteStructure(str);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const Run = FuncWrapper(function RunStructures(
  roomId: string
): FunctionReturn {
  const getStructureIds = GetAllStructureIds(roomId);
  if (getStructureIds.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);

  forEach(getStructureIds.response, (id: Id<Structure>) => {
    const isStructureMemoryInitialized = IsStructureMemoryInitialized(id);
    if (isStructureMemoryInitialized.code === FunctionReturnCodes.OK)
      RunStructure(id);
  });

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
