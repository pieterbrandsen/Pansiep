import _ from "lodash";
import { FunctionReturnCodes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FuncWrapper } from "../utils/wrapper";

export const GetStructure = FuncWrapper(function GetStructure(
  id: string
): FunctionReturn {
  const structure: Structure | undefined = Game.structures[id];
  if (_.isUndefined(structure))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper<Structure>(FunctionReturnCodes.OK, structure);
});

export const GetAllStructureNames = FuncWrapper(function GetAllStructureNames(
  id: string
): FunctionReturn {
  const structureIds: string[] | undefined = Memory.cache.structures.data[id]
    ? Memory.cache.structures.data[id].map((c) => c.id)
    : undefined;
  if (_.isUndefined(structureIds))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, structureIds);
});
