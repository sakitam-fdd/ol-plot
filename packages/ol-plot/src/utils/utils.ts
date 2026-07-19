import * as Constants from '../constants';

export type Point = [number, number];

/** Squared distance avoids a square root in hot pointer-move paths. */
export const squaredDistance = (pnt1: Point, pnt2: Point): number => {
  const dx = pnt1[0] - pnt2[0];
  const dy = pnt1[1] - pnt2[1];
  return dx * dx + dy * dy;
};

/**
 * 计算两个坐标之间的距离
 * @param pnt1
 * @param pnt2
 * @returns {number}
 * @constructor
 */
export const MathDistance = (pnt1: Point, pnt2: Point): number => Math.sqrt(squaredDistance(pnt1, pnt2));

/**
 * 计算点集合的总距离
 * @param points
 * @returns {number}
 */
export const wholeDistance = (points: Point[]): number => {
  let distance = 0;
  if (Array.isArray(points)) {
    for (let index = 1; index < points.length; index += 1) {
      distance += MathDistance(points[index - 1], points[index]);
    }
  }
  return distance;
};
/**
 * 获取基础长度
 * @param points
 * @returns {number}
 */
export const getBaseLength = (points: Point[]): number => wholeDistance(points) ** 0.99;

/**
 * 求取两个坐标的中间坐标
 * @param point1
 * @param point2
 * @returns {[*,*]}
 * @constructor
 */
export const Mid = (point1: Point, point2: Point): Point => [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];

/**
 * 通过三个点确定一个圆的中心点
 * @param point1
 * @param point2
 * @param point3
 */
export const getCircleCenterOfThreePoints = (point1: Point, point2: Point, point3: Point): Point => {
  const pntA = [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2] as Point;
  const pntB = [pntA[0] - point1[1] + point2[1], pntA[1] + point1[0] - point2[0]] as Point;
  const pntC = [(point1[0] + point3[0]) / 2, (point1[1] + point3[1]) / 2] as Point;
  const pntD = [pntC[0] - point1[1] + point3[1], pntC[1] + point1[0] - point3[0]] as Point;
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return getIntersectPoint(pntA, pntB, pntC, pntD);
};

/**
 * 获取交集的点
 * @param pntA
 * @param pntB
 * @param pntC
 * @param pntD
 * @returns {[*,*]}
 */
export const getIntersectPoint = (pntA: Point, pntB: Point, pntC: Point, pntD: Point): Point => {
  const x1 = pntA[0];
  const y1 = pntA[1];
  const x2 = pntB[0];
  const y2 = pntB[1];
  const x3 = pntC[0];
  const y3 = pntC[1];
  const x4 = pntD[0];
  const y4 = pntD[1];
  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (Math.abs(denominator) <= Constants.ZERO_TOLERANCE) {
    return Mid(pntA, pntC);
  }

  const determinant1 = x1 * y2 - y1 * x2;
  const determinant2 = x3 * y4 - y3 * x4;
  return [
    (determinant1 * (x3 - x4) - (x1 - x2) * determinant2) / denominator,
    (determinant1 * (y3 - y4) - (y1 - y2) * determinant2) / denominator,
  ];
};

/**
 * 获取方位角（地平经度）
 * @param startPoint
 * @param endPoint
 * @returns {*}
 */
export const getAzimuth = (startPoint: Point, endPoint: Point): number => {
  const distance = MathDistance(startPoint, endPoint);
  if (distance <= Constants.ZERO_TOLERANCE) return 0;
  let azimuth = 0;
  const angle = Math.asin(Math.min(1, Math.abs(endPoint[1] - startPoint[1]) / distance));
  if (endPoint[1] >= startPoint[1] && endPoint[0] >= startPoint[0]) {
    azimuth = angle + Math.PI;
  } else if (endPoint[1] >= startPoint[1] && endPoint[0] < startPoint[0]) {
    azimuth = Math.PI * 2 - angle;
  } else if (endPoint[1] < startPoint[1] && endPoint[0] < startPoint[0]) {
    azimuth = angle;
  } else if (endPoint[1] < startPoint[1] && endPoint[0] >= startPoint[0]) {
    azimuth = Math.PI - angle;
  }
  return azimuth;
};

/**
 * 通过三个点获取方位角
 * @param pntA
 * @param pntB
 * @param pntC
 * @returns {number}
 */
export const getAngleOfThreePoints = (pntA: Point, pntB: Point, pntC: Point): number => {
  const angle = getAzimuth(pntB, pntA) - getAzimuth(pntB, pntC);
  return angle < 0 ? angle + Math.PI * 2 : angle;
};

/**
 * 判断是否是顺时针
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {boolean}
 */
export const isClockWise = (pnt1: Point, pnt2: Point, pnt3: Point): boolean =>
  (pnt3[1] - pnt1[1]) * (pnt2[0] - pnt1[0]) > (pnt2[1] - pnt1[1]) * (pnt3[0] - pnt1[0]);

/**
 * 获取线上的点
 * @param t
 * @param startPnt
 * @param endPnt
 * @returns {[*,*]}
 */
export const getPointOnLine = (t: number, startPnt: Point, endPnt: Point): Point => {
  const x = startPnt[0] + t * (endPnt[0] - startPnt[0]);
  const y = startPnt[1] + t * (endPnt[1] - startPnt[1]);
  return [x, y];
};

/**
 * 获取立方值
 * @param t
 * @param startPnt
 * @param cPnt1
 * @param cPnt2
 * @param endPnt
 * @returns {[*,*]}
 */
export const getCubicValue = (t: number, startPnt: Point, cPnt1: Point, cPnt2: Point, endPnt: Point): Point => {
  const ratio = Math.max(Math.min(t, 1), 0);
  const tp = 1 - ratio;
  const t2 = ratio * ratio;
  const t3 = t2 * ratio;
  const tp2 = tp * tp;
  const tp3 = tp2 * tp;
  const x = tp3 * startPnt[0] + 3 * tp2 * ratio * cPnt1[0] + 3 * tp * t2 * cPnt2[0] + t3 * endPnt[0];
  const y = tp3 * startPnt[1] + 3 * tp2 * ratio * cPnt1[1] + 3 * tp * t2 * cPnt2[1] + t3 * endPnt[1];
  return [x, y];
};

/**
 * 根据起止点和旋转方向求取第三个点
 * @param startPnt
 * @param endPnt
 * @param angle
 * @param distance
 * @param clockWise
 * @returns {[*,*]}
 */
export const getThirdPoint = (
  startPnt: Point,
  endPnt: Point,
  angle: number,
  distance: number,
  clockWise?: boolean,
): Point => {
  const azimuth = getAzimuth(startPnt, endPnt);
  const alpha = clockWise ? azimuth + angle : azimuth - angle;
  const dx = distance * Math.cos(alpha);
  const dy = distance * Math.sin(alpha);
  return [endPnt[0] + dx, endPnt[1] + dy];
};

/**
 * 插值弓形线段点
 * @param center
 * @param radius
 * @param startAngle
 * @param endAngle
 * @returns {null}
 */
export const getArcPoints = (center: Point, radius: number, startAngle: number, endAngle: number): Point[] => {
  const pnts = new Array<Point>(Constants.FITTING_COUNT + 1);
  let angleDiff = endAngle - startAngle;
  angleDiff = angleDiff < 0 ? angleDiff + Math.PI * 2 : angleDiff;
  for (let i = 0; i <= Constants.FITTING_COUNT; i += 1) {
    const angle = startAngle + (angleDiff * i) / Constants.FITTING_COUNT;
    pnts[i] = [center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)];
  }
  return pnts;
};

/**
 * getBisectorNormals
 * @param t
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {[*,*]}
 */
export const getBisectorNormals = (t: number, pnt1: Point, pnt2: Point, pnt3: Point): Point[] => {
  // eslint-disable-next-line
  const normal = getNormal(pnt1, pnt2, pnt3);
  let [bisectorNormalRight, bisectorNormalLeft, dt, x, y]: [Point, Point, number, number, number] = [
    [0, 0],
    [0, 0],
    0,
    0,
    0,
  ];
  const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
  const uX = normal[0] / dist;
  const uY = normal[1] / dist;
  const d1 = MathDistance(pnt1, pnt2);
  const d2 = MathDistance(pnt2, pnt3);
  if (dist > Constants.ZERO_TOLERANCE) {
    if (isClockWise(pnt1, pnt2, pnt3)) {
      dt = t * d1;
      x = pnt2[0] - dt * uY;
      y = pnt2[1] + dt * uX;
      bisectorNormalRight = [x, y];
      dt = t * d2;
      x = pnt2[0] + dt * uY;
      y = pnt2[1] - dt * uX;
      bisectorNormalLeft = [x, y];
    } else {
      dt = t * d1;
      x = pnt2[0] + dt * uY;
      y = pnt2[1] - dt * uX;
      bisectorNormalRight = [x, y];
      dt = t * d2;
      x = pnt2[0] - dt * uY;
      y = pnt2[1] + dt * uX;
      bisectorNormalLeft = [x, y];
    }
  } else {
    x = pnt2[0] + t * (pnt1[0] - pnt2[0]);
    y = pnt2[1] + t * (pnt1[1] - pnt2[1]);
    bisectorNormalRight = [x, y];
    x = pnt2[0] + t * (pnt3[0] - pnt2[0]);
    y = pnt2[1] + t * (pnt3[1] - pnt2[1]);
    bisectorNormalLeft = [x, y];
  }
  return [bisectorNormalRight, bisectorNormalLeft];
};

/**
 * 获取默认三点的内切圆
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {[*,*]}
 */
export const getNormal = (pnt1: Point, pnt2: Point, pnt3: Point): Point => {
  let dX1 = pnt1[0] - pnt2[0];
  let dY1 = pnt1[1] - pnt2[1];
  const d1 = Math.sqrt(dX1 * dX1 + dY1 * dY1);
  if (d1 <= Constants.ZERO_TOLERANCE) return [0, 0];
  dX1 /= d1;
  dY1 /= d1;
  let dX2 = pnt3[0] - pnt2[0];
  let dY2 = pnt3[1] - pnt2[1];
  const d2 = Math.sqrt(dX2 * dX2 + dY2 * dY2);
  if (d2 <= Constants.ZERO_TOLERANCE) return [0, 0];
  dX2 /= d2;
  dY2 /= d2;
  const uX = dX1 + dX2;
  const uY = dY1 + dY2;
  return [uX, uY];
};

/**
 * 获取左边控制点
 * @param controlPoints
 * @param t
 * @returns {[*,*]}
 */
export const getLeftMostControlPoint = (controlPoints: Point[], t: number): Point => {
  // eslint-disable-next-line
  let [pnt1, pnt2, pnt3, controlX, controlY]: [Point, Point, Point, number, number] = [
    controlPoints[0],
    controlPoints[1],
    controlPoints[2],
    0,
    0,
  ];
  const pnts = getBisectorNormals(0, pnt1, pnt2, pnt3);
  const normalRight = pnts[0];
  const normal = getNormal(pnt1, pnt2, pnt3);
  const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
  if (dist > Constants.ZERO_TOLERANCE) {
    const mid = Mid(pnt1, pnt2);
    const pX = pnt1[0] - mid[0];
    const pY = pnt1[1] - mid[1];
    const d1 = MathDistance(pnt1, pnt2);
    const n = 2.0 / d1;
    const nX = -n * pY;
    const nY = n * pX;
    const a11 = nX * nX - nY * nY;
    const a12 = 2 * nX * nY;
    const a22 = nY * nY - nX * nX;
    const dX = normalRight[0] - mid[0];
    const dY = normalRight[1] - mid[1];
    controlX = mid[0] + a11 * dX + a12 * dY;
    controlY = mid[1] + a12 * dX + a22 * dY;
  } else {
    controlX = pnt1[0] + t * (pnt2[0] - pnt1[0]);
    controlY = pnt1[1] + t * (pnt2[1] - pnt1[1]);
  }
  return [controlX, controlY];
};

/**
 * 获取右边控制点
 * @param controlPoints
 * @param t
 * @returns {[*,*]}
 */
export const getRightMostControlPoint = (controlPoints: Point[], t: number): Point => {
  const count = controlPoints.length;
  const pnt1 = controlPoints[count - 3];
  const pnt2 = controlPoints[count - 2];
  const pnt3 = controlPoints[count - 1];
  const pnts = getBisectorNormals(0, pnt1, pnt2, pnt3);
  const normalLeft = pnts[1];
  const normal = getNormal(pnt1, pnt2, pnt3);
  const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
  let [controlX, controlY] = [0, 0];
  if (dist > Constants.ZERO_TOLERANCE) {
    const mid = Mid(pnt2, pnt3);
    const pX = pnt3[0] - mid[0];
    const pY = pnt3[1] - mid[1];
    const d1 = MathDistance(pnt2, pnt3);
    const n = 2.0 / d1;
    const nX = -n * pY;
    const nY = n * pX;
    const a11 = nX * nX - nY * nY;
    const a12 = 2 * nX * nY;
    const a22 = nY * nY - nX * nX;
    const dX = normalLeft[0] - mid[0];
    const dY = normalLeft[1] - mid[1];
    controlX = mid[0] + a11 * dX + a12 * dY;
    controlY = mid[1] + a12 * dX + a22 * dY;
  } else {
    controlX = pnt3[0] + t * (pnt2[0] - pnt3[0]);
    controlY = pnt3[1] + t * (pnt2[1] - pnt3[1]);
  }
  return [controlX, controlY];
};

/**
 * 插值曲线点
 * @param t
 * @param controlPoints
 * @returns {null}
 */
export const getCurvePoints = (t: number, controlPoints: Point[]): Point[] => {
  const leftControl = getLeftMostControlPoint(controlPoints, t);
  // eslint-disable-next-line
  // @ts-ignore
  let [pnt1, pnt2, pnt3, normals]: [Point, Point, Point, Point[], Point[]] = [null, null, null, [leftControl]];
  const points: Point[] = [];
  for (let i = 0; i < controlPoints.length - 2; i++) {
    [pnt1, pnt2, pnt3] = [controlPoints[i], controlPoints[i + 1], controlPoints[i + 2]];
    const normalPoints = getBisectorNormals(t, pnt1, pnt2, pnt3);
    normals = normals.concat(normalPoints);
  }
  const rightControl = getRightMostControlPoint(controlPoints, t);
  if (rightControl) {
    normals.push(rightControl);
  }
  for (let i = 0; i < controlPoints.length - 1; i++) {
    pnt1 = controlPoints[i];
    pnt2 = controlPoints[i + 1];
    points.push(pnt1);
    for (let j = 0; j < Constants.FITTING_COUNT; j++) {
      const pnt = getCubicValue(j / Constants.FITTING_COUNT, pnt1, normals[i * 2], normals[i * 2 + 1], pnt2);
      points.push(pnt);
    }
    points.push(pnt2);
  }
  return points;
};

/**
 * 贝塞尔曲线
 * @param points
 * @returns {*}
 */
export const getBezierPoints = function (points: Point[]): Point[] {
  if (points.length <= 2) {
    return points.slice();
  }
  const bezierPoints = new Array<Point>(Constants.FITTING_COUNT + 1);
  const n = points.length - 1;
  const factors = new Array<number>(n + 1);
  factors[0] = 1;
  for (let index = 1; index <= n; index += 1) {
    factors[index] = (factors[index - 1] * (n - index + 1)) / index;
  }
  for (let sample = 0; sample <= Constants.FITTING_COUNT; sample += 1) {
    const t = sample / Constants.FITTING_COUNT;
    let [x, y] = [0, 0];
    for (let index = 0; index <= n; index += 1) {
      const a = t ** index;
      const b = (1 - t) ** (n - index);
      const weight = factors[index] * a * b;
      x += weight * points[index][0];
      y += weight * points[index][1];
    }
    bezierPoints[sample] = [x, y];
  }
  bezierPoints[0] = points[0].slice() as Point;
  bezierPoints[Constants.FITTING_COUNT] = points[n].slice() as Point;
  return bezierPoints;
};

/**
 * 获取阶乘数据
 * @param n
 * @returns {number}
 */
export const getFactorial = (n: number): number => {
  let result = 1;
  switch (true) {
    case n <= 1:
      result = 1;
      break;
    case n === 2:
      result = 2;
      break;
    case n === 3:
      result = 6;
      break;
    case n === 4:
      result = 24;
      break;
    case n === 5:
      result = 120;
      break;
    default:
      for (let i = 1; i <= n; i++) {
        result *= i;
      }
      break;
  }
  return result;
};

/**
 * 获取二项分布
 * @param n
 * @param index
 * @returns {number}
 */
export const getBinomialFactor = (n: number, index: number): number =>
  getFactorial(n) / (getFactorial(index) * getFactorial(n - index));

/**
 * 插值线性点
 * @param points
 * @returns {*}
 */
export const getQBSplinePoints = (points: Point[]): Point[] => {
  if (points.length <= 2) {
    return points;
  }
  const [n, bSplinePoints]: [number, Point[]] = [2, []];
  const m = points.length - n - 1;
  bSplinePoints.push(points[0]);
  for (let i = 0; i <= m; i++) {
    for (let t = 0; t <= 1; t += 0.05) {
      let [x, y] = [0, 0];
      for (let k = 0; k <= n; k++) {
        // eslint-disable-next-line
        const factor = getQuadricBSplineFactor(k, t);
        x += factor * points[i + k][0];
        y += factor * points[i + k][1];
      }
      bSplinePoints.push([x, y]);
    }
  }
  bSplinePoints.push(points[points.length - 1]);
  return bSplinePoints;
};

/**
 * 得到二次线性因子
 * @param k
 * @param t
 * @returns {number}
 */
export const getQuadricBSplineFactor = (k: number, t: number): number => {
  let res = 0;
  if (k === 0) {
    res = (t - 1) ** 2 / 2;
  } else if (k === 1) {
    res = (-2 * t ** 2 + 2 * t + 1) / 2;
  } else if (k === 2) {
    res = t ** 2 / 2;
  }
  return res;
};

/**
 * 生成随机字符串
 * @returns {*}
 */
export function getuuid(noBit = false): string {
  const uuid =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
          const random = Math.floor(Math.random() * 16);
          const value = character === 'x' ? random : (random % 4) + 8;
          return value.toString(16);
        });
  return noBit ? uuid.replace(/-/g, '') : uuid;
}

/**
 * 添加标识
 * @param obj
 * @returns {*}
 */
export const stamp = function (obj) {
  const key = '_event_id_';
  obj[key] = obj[key] || getuuid();
  return obj[key];
};

/**
 * 去除字符串前后空格
 * @param str
 * @returns {*}
 */
export const trim = (str: string): string => (str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, ''));

/**
 * 将类名截取成数组
 * @param str
 */
export const splitWords = (str: string) => trim(str).split(/\s+/);

/**
 * 判断是否为对象
 * @param value
 * @returns {boolean}
 */
export const isObject = (value: any): value is object => {
  const type = typeof value;
  return value !== null && (type === 'object' || type === 'function');
};

/**
 * merge
 * @param a
 * @param b
 * @returns {*}
 */
export const merge = (a, b) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in b) {
    if (isObject(b[key]) && isObject(a[key])) {
      merge(a[key], b[key]);
    } else {
      a[key] = b[key];
    }
  }
  return a;
};

export function preventDefault(e) {
  // eslint-disable-next-line no-param-reassign
  e = e || window.event;
  if (e.preventDefault) {
    e.preventDefault();
  } else {
    e.returnValue = false;
  }
}

export function bindAll(fns, context) {
  fns.forEach((fn) => {
    if (!context[fn]) {
      return;
    }
    context[fn] = context[fn].bind(context);
  });
}
