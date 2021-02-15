import ErrorMapper from "./utils/errorMapper";

/**
 * Run the complete bot without ErrorMapper
 */
function unwrappedLoop(): void {}

const loop = ErrorMapper.wrapLoop(unwrappedLoop);

export { loop, unwrappedLoop };
