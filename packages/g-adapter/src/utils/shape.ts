import { isFunction, isString } from '@antv/util';
import { SYMBOL_PATH_FUNC_MAP } from '../constants';

const getPathBySymbol = (attrs) => {
  let path;
  const { r = 5, x = 0, y = 0, symbol } = attrs;
  if (!symbol) return;
  if (isFunction(symbol)) {
    path = symbol(x, y, r);
  } else if (isString(symbol)) {
    path = SYMBOL_PATH_FUNC_MAP[symbol]?.(x, y, r);
  } 
  return path;
}

export { getPathBySymbol }