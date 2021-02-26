import Vec3 from "./vec3"


export function sweepSphereToPlane(
	spherePos: Vec3,
	sphereSpeed: Vec3,
	sphereRadius: number,
	pointOnPlane: Vec3,
	planeNormal: Vec3)
	: number
{
	// from WolframAlpha
	// solve for t: {n, m, o} . ({x, y, z} + {u, v, w} * t) + d = r

	const x = spherePos.x
	const y = spherePos.y
	const z = spherePos.z

	const u = sphereSpeed.x
	const v = sphereSpeed.y
	const w = sphereSpeed.z

	const r = sphereRadius

	const n = planeNormal.x
	const m = planeNormal.y
	const o = planeNormal.z

	const d = -pointOnPlane.dot(planeNormal)

	const div = (m * v + n * u + o * w)
	if (div == 0)
		return Infinity

	const t = -(d + m * y + n * x + o * z - r) / div
	//if (t < 0 || t > 1)
	//	return Infinity

	return t
}


export function sweepSphereToSegment(
	spherePos: Vec3,
	sphereSpeed: Vec3,
	sphereRadius: number,
	pointInLine: Vec3,
	lineVector: Vec3)
	: number
{
	const t = sweepSphereToLine(spherePos, sphereSpeed, sphereRadius, pointInLine, lineVector.normalized())
	if (!isFinite(t))
		return Infinity

	const newPos = spherePos.add(sphereSpeed.scale(t))
	const contact = newPos.add(newPos.directionToLine(lineVector, pointInLine))
	const lineT = contact.sub(pointInLine).projectT(lineVector)

	if (lineT < 0 || lineT > 1)
		return Infinity

	return t
}


export function sweepSphereToLine(
	spherePos: Vec3,
	sphereSpeed: Vec3,
	sphereRadius: number,
	pointInLine: Vec3,
	lineVector: Vec3)
	: number
{
	// from WolframAlpha
	// solve for t: ||{x + u * t, y + v * t, z + w * t} cross {n, m, o}|| = r

	const x = spherePos.x - pointInLine.x
	const y = spherePos.y - pointInLine.y
	const z = spherePos.z - pointInLine.z

	const u = sphereSpeed.x
	const v = sphereSpeed.y
	const w = sphereSpeed.z

	const n = lineVector.x
	const m = lineVector.y
	const o = lineVector.z

	const r = sphereRadius

	const root1 =
		2 * m * m * u * x +
		2 * m * m * w * z -
		2 * m * n * u * y -
		2 * m * n * v * x -
		2 * m * o * v * z -
		2 * m * o * w * y +
		2 * n * n * v * y +
		2 * n * n * w * z -
		2 * n * o * u * z -
		2 * n * o * w * x +
		2 * o * o * u * x +
		2 * o * o * v * y

	const root2 =
		m * m * u * u +
		m * m * w * w -
		2 * m * n * u * v -
		2 * m * o * v * w +
		n * n * v * v +
		n * n * w * w -
		2 * n * o * u * w +
		o * o * u * u +
		o * o * v * v

	const root3 =
		m * m * x * x +
		m * m * z * z -
		2 * m * n * x * y -
		2 * m * o * y * z +
		n * n * y * y +
		n * n * z * z -
		2 * n * o * x * z +
		o * o * x * x +
		o * o * y * y -
		r * r

	const rootInner = root1 * root1 - 4 * root2 * root3
	if (rootInner < 0)
		return Infinity

	const root = Math.sqrt(rootInner)

	const div = (2 * root2)
	if (div == 0)
		return Infinity

	const t1 = (-root - root1) / div
	const t2 = ( root - root1) / div

	const t = Math.min(t1, t2)
	//if (t < 0 || t > 1)
	//	return Infinity

	return t
}


export function sweepSphereToPoint(
	spherePos: Vec3,
	sphereSpeed: Vec3,
	sphereRadius: number,
	point: Vec3)
	: number
{
	// from WolframAlpha
	// solve for t: ||{x, y, z} + {u, v, w} * t|| = r

	const x = spherePos.x - point.x
	const y = spherePos.y - point.y
	const z = spherePos.z - point.z

	const u = sphereSpeed.x
	const v = sphereSpeed.y
	const w = sphereSpeed.z

	const r = sphereRadius

	const div = 2 * (u * u + v * v + w * w)
	if (div == 0)
		return Infinity

	const root =
		Math.pow(2 * u * x + 2 * v * y + 2 * w * z, 2) -
		4 * (u * u + v * v + w * w) *
		(-(r * r) + x * x + y * y + z * z)

	if (root < 0)
		return Infinity

	const t1 = 1 / div * (-Math.sqrt(root) - 2 * u * x - 2 * v * y - 2 * w * z)
	const t2 = 1 / div * ( Math.sqrt(root) - 2 * u * x - 2 * v * y - 2 * w * z)

	const t = Math.min(t1, t2)
	//if (t < 0 || t > 1)
	//	return Infinity

	return t
}


/*export function linePointMinimumVec(origin, direction, point)
{
	let pointFromOrigin = point.sub(origin)
	let pointOverDirection = pointFromOrigin.project(direction)
	
	return pointFromOrigin.sub(pointOverDirection)
}


export function linePointDistance(origin, direction, point)
{
	return Geometry.linePointMinimumVec(origin, direction, point).magn()
}


export function lineLineDistance(origin1, direction1, origin2, direction2)
{
	let cross = direction1.cross(direction2)
	let crossMagn = cross.magn()
	
	if (crossMagn < 0.001)
		return Infinity // wrong but works
	
	return Math.abs(cross.scale(1 / crossMagn).dot(origin2.sub(origin1)))
}


export function lineZPlaneIntersection(origin, direction, planeZ)
{
	return origin.add(direction.scale((planeZ - origin.z) / direction.z))
}*/