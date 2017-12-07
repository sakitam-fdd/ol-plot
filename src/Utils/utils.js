import * as Constants from '../Constants'
/**
 * 计算两个坐标之间的距离
 * @param pnt1
 * @param pnt2
 * @returns {number}
 * @constructor
 */
export const MathDistance = (pnt1, pnt2) => {
  return (Math.sqrt(Math.pow((pnt1[0] - pnt2[0]), 2) + Math.pow((pnt1[1] - pnt2[1]), 2)))
}

/**
 * 计算点集合的总距离
 * @param points
 * @returns {number}
 */
export const wholeDistance = (points) => {
  let distance = 0
  if (points && Array.isArray(points) && points.length > 0) {
    points.forEach((item, index) => {
      if (index < points.length - 1) {
        distance += (MathDistance(item, points[index + 1]))
      }
    })
  }
  return distance
}
/**
 * 获取基础长度
 * @param points
 * @returns {number}
 */
export const getBaseLength = (points) => {
  return Math.pow(wholeDistance(points), 0.99)
}

/**
 * 求取两个坐标的中间值
 * @param point1
 * @param point2
 * @returns {[*,*]}
 * @constructor
 */
export const Mid = (point1, point2) => {
  return [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2]
}

/**
 * 通过三个点确定一个圆的中心点
 * @param point1
 * @param point2
 * @param point3
 */
export const getCircleCenterOfThreePoints = (point1, point2, point3) => {
  let pntA = [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2]
  let pntB = [pntA[0] - point1[1] + point2[1], pntA[1] + point1[0] - point2[0]]
  let pntC = [(point1[0] + point3[0]) / 2, (point1[1] + point3[1]) / 2]
  let pntD = [pntC[0] - point1[1] + point3[1], pntC[1] + point1[0] - point3[0]]
  return getIntersectPoint(pntA, pntB, pntC, pntD)
}

/**
 * 获取交集的点
 * @param pntA
 * @param pntB
 * @param pntC
 * @param pntD
 * @returns {[*,*]}
 */
export const getIntersectPoint = (pntA, pntB, pntC, pntD) => {
  if (pntA[1] === pntB[1]) {
    let f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1])
    let x = f * (pntA[1] - pntC[1]) + pntC[0]
    let y = pntA[1]
    return [x, y]
  }
  if (pntC[1] === pntD[1]) {
    let e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1])
    let x = e * (pntC[1] - pntA[1]) + pntA[0]
    let y = pntC[1]
    return [x, y]
  }
  let e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1])
  let f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1])
  let y = (e * pntA[1] - pntA[0] - f * pntC[1] + pntC[0]) / (e - f)
  let x = e * y - e * pntA[1] + pntA[0]
  return [x, y]
}

/**
 * 获取方位角（地平经度）
 * @param startPoint
 * @param endPoint
 * @returns {*}
 */
export const getAzimuth = (startPoint, endPoint) => {
  let azimuth
  let angle = Math.asin(Math.abs(endPoint[1] - startPoint[1]) / (MathDistance(startPoint, endPoint)))
  if (endPoint[1] >= startPoint[1] && endPoint[0] >= startPoint[0]) {
    azimuth = angle + Math.PI
  } else if (endPoint[1] >= startPoint[1] && endPoint[0] < startPoint[0]) {
    azimuth = Math.PI * 2 - angle
  } else if (endPoint[1] < startPoint[1] && endPoint[0] < startPoint[0]) {
    azimuth = angle
  } else if (endPoint[1] < startPoint[1] && endPoint[0] >= startPoint[0]) {
    azimuth = Math.PI - angle
  }
  return azimuth
}

/**
 * 通过三个点获取方位角
 * @param pntA
 * @param pntB
 * @param pntC
 * @returns {number}
 */
export const getAngleOfThreePoints = (pntA, pntB, pntC) => {
  let angle = getAzimuth(pntB, pntA) - getAzimuth(pntB, pntC)
  return ((angle < 0) ? (angle + Math.PI * 2) : angle)
}

/**
 * 判断是否是顺时针
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {boolean}
 */
export const isClockWise = (pnt1, pnt2, pnt3) => {
  return ((pnt3[1] - pnt1[1]) * (pnt2[0] - pnt1[0]) > (pnt2[1] - pnt1[1]) * (pnt3[0] - pnt1[0]))
}

/**
 * 获取线上的点
 * @param t
 * @param startPnt
 * @param endPnt
 * @returns {[*,*]}
 */
export const getPointOnLine = (t, startPnt, endPnt) => {
  let x = startPnt[0] + (t * (endPnt[0] - startPnt[0]))
  let y = startPnt[1] + (t * (endPnt[1] - startPnt[1]))
  return [x, y]
}

/**
 * 获取立方值
 * @param t
 * @param startPnt
 * @param cPnt1
 * @param cPnt2
 * @param endPnt
 * @returns {[*,*]}
 */
export const getCubicValue = (t, startPnt, cPnt1, cPnt2, endPnt) => {
  t = Math.max(Math.min(t, 1), 0)
  let [tp, t2] = [(1 - t), (t * t)]
  let t3 = t2 * t
  let tp2 = tp * tp
  let tp3 = tp2 * tp
  let x = (tp3 * startPnt[0]) + (3 * tp2 * t * cPnt1[0]) + (3 * tp * t2 * cPnt2[0]) + (t3 * endPnt[0])
  let y = (tp3 * startPnt[1]) + (3 * tp2 * t * cPnt1[1]) + (3 * tp * t2 * cPnt2[1]) + (t3 * endPnt[1])
  return [x, y]
}

/**
 * 根据起止点和旋转方向求取第三个点
 * @param startPnt
 * @param endPnt
 * @param angle
 * @param distance
 * @param clockWise
 * @returns {[*,*]}
 */
export const getThirdPoint = (startPnt, endPnt, angle, distance, clockWise) => {
  let azimuth = getAzimuth(startPnt, endPnt)
  let alpha = clockWise ? (azimuth + angle) : (azimuth - angle)
  let dx = distance * Math.cos(alpha)
  let dy = distance * Math.sin(alpha)
  return ([endPnt[0] + dx, endPnt[1] + dy])
}

/**
 * 函数继承
 * @param childCtor
 * @param parentCtor
 */
export const inherits = (childCtor, parentCtor) => {
  /** @constructor */
  function TempCtor () {
  }

  TempCtor.prototype = parentCtor.prototype
  childCtor.superClass_ = parentCtor.prototype
  childCtor.prototype = new TempCtor()
  /** @override */
  childCtor.prototype.constructor = childCtor
  childCtor.base = function (me, methodName, varArgs) {
    let args = Array.prototype.slice.call(arguments, 2)
    return parentCtor.prototype[methodName].apply(me, args)
  }
}

/**
 * 插值弓形线段点
 * @param center
 * @param radius
 * @param startAngle
 * @param endAngle
 * @returns {null}
 */
export const getArcPoints = (center, radius, startAngle, endAngle) => {
  let [x, y, pnts, angleDiff] = [null, null, [], (endAngle - startAngle)]
  angleDiff = ((angleDiff < 0) ? (angleDiff + (Math.PI * 2)) : angleDiff)
  for (let i = 0; i <= 100; i++) {
    let angle = startAngle + angleDiff * i / 100
    x = center[0] + radius * Math.cos(angle)
    y = center[1] + radius * Math.sin(angle)
    pnts.push([x, y])
  }
  return pnts
}

/**
 * getBisectorNormals
 * @param t
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {[*,*]}
 */
export const getBisectorNormals = (t, pnt1, pnt2, pnt3) => {
  let normal = getNormal(pnt1, pnt2, pnt3)
  let [bisectorNormalRight, bisectorNormalLeft, dt, x, y] = [null, null, null, null, null]
  let dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1])
  let uX = normal[0] / dist
  let uY = normal[1] / dist
  let d1 = MathDistance(pnt1, pnt2)
  let d2 = MathDistance(pnt2, pnt3)
  if (dist > Constants.ZERO_TOLERANCE) {
    if (isClockWise(pnt1, pnt2, pnt3)) {
      dt = t * d1
      x = pnt2[0] - dt * uY
      y = pnt2[1] + dt * uX
      bisectorNormalRight = [x, y]
      dt = t * d2
      x = pnt2[0] + dt * uY
      y = pnt2[1] - dt * uX
      bisectorNormalLeft = [x, y]
    } else {
      dt = t * d1
      x = pnt2[0] + dt * uY
      y = pnt2[1] - dt * uX
      bisectorNormalRight = [x, y]
      dt = t * d2
      x = pnt2[0] - dt * uY
      y = pnt2[1] + dt * uX
      bisectorNormalLeft = [x, y]
    }
  } else {
    x = pnt2[0] + t * (pnt1[0] - pnt2[0])
    y = pnt2[1] + t * (pnt1[1] - pnt2[1])
    bisectorNormalRight = [x, y]
    x = pnt2[0] + t * (pnt3[0] - pnt2[0])
    y = pnt2[1] + t * (pnt3[1] - pnt2[1])
    bisectorNormalLeft = [x, y]
  }
  return [bisectorNormalRight, bisectorNormalLeft]
}

/**
 * 获取默认三点的内切圆
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {[*,*]}
 */
export const getNormal = (pnt1, pnt2, pnt3) => {
  let dX1 = pnt1[0] - pnt2[0]
  let dY1 = pnt1[1] - pnt2[1]
  let d1 = Math.sqrt(dX1 * dX1 + dY1 * dY1)
  dX1 /= d1
  dY1 /= d1
  let dX2 = pnt3[0] - pnt2[0]
  let dY2 = pnt3[1] - pnt2[1]
  let d2 = Math.sqrt(dX2 * dX2 + dY2 * dY2)
  dX2 /= d2
  dY2 /= d2
  let uX = dX1 + dX2
  let uY = dY1 + dY2
  return [uX, uY]
}

/**
 * 获取左边控制点
 * @param controlPoints
 * @returns {[*,*]}
 */
export const getLeftMostControlPoint = (controlPoints, t) => {
  let [pnt1, pnt2, pnt3, controlX, controlY] = [controlPoints[0], controlPoints[1], controlPoints[2], null, null]
  let pnts = getBisectorNormals(0, pnt1, pnt2, pnt3)
  let normalRight = pnts[0]
  let normal = getNormal(pnt1, pnt2, pnt3)
  let dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1])
  if (dist > Constants.ZERO_TOLERANCE) {
    let mid = Mid(pnt1, pnt2)
    let pX = pnt1[0] - mid[0]
    let pY = pnt1[1] - mid[1]
    let d1 = MathDistance(pnt1, pnt2)
    let n = 2.0 / d1
    let nX = -n * pY
    let nY = n * pX
    let a11 = nX * nX - nY * nY
    let a12 = 2 * nX * nY
    let a22 = nY * nY - nX * nX
    let dX = normalRight[0] - mid[0]
    let dY = normalRight[1] - mid[1]
    controlX = mid[0] + a11 * dX + a12 * dY
    controlY = mid[1] + a12 * dX + a22 * dY
  } else {
    controlX = pnt1[0] + t * (pnt2[0] - pnt1[0])
    controlY = pnt1[1] + t * (pnt2[1] - pnt1[1])
  }
  return [controlX, controlY]
}

/**
 * 获取右边控制点
 * @param controlPoints
 * @param t
 * @returns {[*,*]}
 */
export const getRightMostControlPoint = (controlPoints, t) => {
  let count = controlPoints.length
  let pnt1 = controlPoints[count - 3]
  let pnt2 = controlPoints[count - 2]
  let pnt3 = controlPoints[count - 1]
  let pnts = getBisectorNormals(0, pnt1, pnt2, pnt3)
  let normalLeft = pnts[1]
  let normal = getNormal(pnt1, pnt2, pnt3)
  let dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1])
  let [controlX, controlY] = [null, null]
  if (dist > Constants.ZERO_TOLERANCE) {
    let mid = Mid(pnt2, pnt3)
    let pX = pnt3[0] - mid[0]
    let pY = pnt3[1] - mid[1]
    let d1 = MathDistance(pnt2, pnt3)
    let n = 2.0 / d1
    let nX = -n * pY
    let nY = n * pX
    let a11 = nX * nX - nY * nY
    let a12 = 2 * nX * nY
    let a22 = nY * nY - nX * nX
    let dX = normalLeft[0] - mid[0]
    let dY = normalLeft[1] - mid[1]
    controlX = mid[0] + a11 * dX + a12 * dY
    controlY = mid[1] + a12 * dX + a22 * dY
  } else {
    controlX = pnt3[0] + t * (pnt2[0] - pnt3[0])
    controlY = pnt3[1] + t * (pnt2[1] - pnt3[1])
  }
  return [controlX, controlY]
}

/**
 * 插值曲线点
 * @param t
 * @param controlPoints
 * @returns {null}
 */
export const getCurvePoints = (t, controlPoints) => {
  let leftControl = getLeftMostControlPoint(controlPoints, t)
  let [pnt1, pnt2, pnt3, normals, points] = [null, null, null, [leftControl], []]
  for (let i = 0; i < controlPoints.length - 2; i++) {
    [pnt1, pnt2, pnt3] = [controlPoints[i], controlPoints[i + 1], controlPoints[i + 2]]
    let normalPoints = getBisectorNormals(t, pnt1, pnt2, pnt3)
    normals = normals.concat(normalPoints)
  }
  let rightControl = getRightMostControlPoint(controlPoints, t)
  if (rightControl) {
    normals.push(rightControl)
  }
  for (let i = 0; i < controlPoints.length - 1; i++) {
    pnt1 = controlPoints[i]
    pnt2 = controlPoints[i + 1]
    points.push(pnt1)
    for (let t = 0; t < Constants.FITTING_COUNT; t++) {
      let pnt = getCubicValue(t / Constants.FITTING_COUNT, pnt1, normals[i * 2], normals[i * 2 + 1], pnt2)
      points.push(pnt)
    }
    points.push(pnt2)
  }
  return points
}

/**
 * 贝塞尔曲线
 * @param points
 * @returns {*}
 */
export const getBezierPoints = function (points) {
  if (points.length <= 2) {
    return points
  } else {
    let bezierPoints = []
    let n = points.length - 1
    for (let t = 0; t <= 1; t += 0.01) {
      let [x, y] = [0, 0]
      for (let index = 0; index <= n; index++) {
        let factor = getBinomialFactor(n, index)
        let a = Math.pow(t, index)
        let b = Math.pow((1 - t), (n - index))
        x += factor * a * b * points[index][0]
        y += factor * a * b * points[index][1]
      }
      bezierPoints.push([x, y])
    }
    bezierPoints.push(points[n])
    return bezierPoints
  }
}

/**
 * 获取阶乘数据
 * @param n
 * @returns {number}
 */
export const getFactorial = (n) => {
  let result = 1
  switch (n) {
    case (n <= 1):
      result = 1
      break
    case (n === 2):
      result = 2
      break
    case (n === 3):
      result = 6
      break
    case (n === 24):
      result = 24
      break
    case (n === 5):
      result = 120
      break
    default:
      for (let i = 1; i <= n; i++) {
        result *= i
      }
      break
  }
  return result
}

/**
 * 获取二项分布
 * @param n
 * @param index
 * @returns {number}
 */
export const getBinomialFactor = (n, index) => {
  return (getFactorial(n) / (getFactorial(index) * getFactorial(n - index)))
}

/**
 * 插值线性点
 * @param points
 * @returns {*}
 */
export const getQBSplinePoints = points => {
  if (points.length <= 2) {
    return points
  } else {
    let [n, bSplinePoints] = [2, []]
    let m = points.length - n - 1
    bSplinePoints.push(points[0])
    for (let i = 0; i <= m; i++) {
      for (let t = 0; t <= 1; t += 0.05) {
        let [x, y] = [0, 0]
        for (let k = 0; k <= n; k++) {
          let factor = getQuadricBSplineFactor(k, t)
          x += factor * points[i + k][0]
          y += factor * points[i + k][1]
        }
        bSplinePoints.push([x, y])
      }
    }
    bSplinePoints.push(points[points.length - 1])
    return bSplinePoints
  }
}

/**
 * 得到二次线性因子
 * @param k
 * @param t
 * @returns {number}
 */
export const getQuadricBSplineFactor = (k, t) => {
  let res = 0
  if (k === 0) {
    res = Math.pow(t - 1, 2) / 2
  } else if (k === 1) {
    res = (-2 * Math.pow(t, 2) + 2 * t + 1) / 2
  } else if (k === 2) {
    res = Math.pow(t, 2) / 2
  }
  return res
}
