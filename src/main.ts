import ErrorMapper from "./utils/errorMapper";

function unwrappedLoop(): void {}

const loop = ErrorMapper.wrapLoop(unwrappedLoop);

export { loop, unwrappedLoop };
