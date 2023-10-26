export function buildErrorPath(path: (string | number)[]) {
  return path.reduce((acc, cur, i) => {
    const isCurNumber = typeof cur === 'number';
    acc = `${acc}${isCurNumber ? `[${cur}]` : `${i ? '.' : ''}${cur}`}`;
    return acc;
  }, '');
}
