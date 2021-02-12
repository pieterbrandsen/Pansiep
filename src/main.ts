import ErrorMapper from "./utils/errorMapper";

// eslint-disable-next-line import/prefer-default-export
export const loop = ErrorMapper.wrapLoop(() => {
  console.log("true");
});
