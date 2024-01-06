export const checkPointInRect = (
  x: number,
  y: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
) => {
  return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
};
