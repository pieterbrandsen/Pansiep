import { isUndefined } from "lodash";
import { FunctionReturnCodes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FuncWrapper } from "../utils/wrapper";

export const GetStructure = FuncWrapper(function GetStructure(
  id: string
): FunctionReturn {
  const structure: Structure | undefined = Game.structures[id];
  if (isUndefined(structure))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper<Structure>(FunctionReturnCodes.OK, structure);
});

export const GetAllStructureIds = FuncWrapper(function GetAllStructureIds(
  id: string
): FunctionReturn {
  const structureIds: string[] | undefined = Memory.cache.structures.data[id]
    ? Memory.cache.structures.data[id].map((c) => c.id)
    : undefined;
  if (isUndefined(structureIds))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, structureIds);
});
