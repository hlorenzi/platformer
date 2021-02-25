import Vec3 from "../math/vec3"
import * as Geometry from "../math/geometry"


interface Triangle
{
	index: number
	v1: Vec3
	v2: Vec3
	v3: Vec3
	v1to2: Vec3
	v1to3: Vec3
	v2to3: Vec3
	v3to1: Vec3
	normal: Vec3
	v1to2Normal: Vec3
	v2to3Normal: Vec3
	v3to1Normal: Vec3
	centroid: Vec3
	v1to2Center: Vec3
	v2to3Center: Vec3
	v3to1Center: Vec3
}


interface Resolution
{
	position: Vec3
	contact: Vec3
	normal: Vec3
}


export default class CollisionMesh
{
	triangles: Triangle[]


	constructor()
	{
		this.triangles = []
	}
	
	
	addTri(v1: Vec3, v2: Vec3, v3: Vec3)
	{
		const v1to2 = v2.sub(v1)
		const v1to3 = v3.sub(v1)
		const v2to3 = v3.sub(v2)
		const v3to1 = v1.sub(v3)

		const normal = v1to2.cross(v3to1).normalized()

		const v1to2Normal = normal.cross(v1to2).normalized()
		const v2to3Normal = normal.cross(v2to3).normalized()
		const v3to1Normal = normal.cross(v3to1).normalized()

		const centroid = new Vec3(
			(v1.x + v2.x + v3.x) / 3,
			(v1.y + v2.y + v3.y) / 3,
			(v1.z + v2.z + v3.z) / 3)

		const v1to2Center = v1.lerp(v2, 0.5)
		const v2to3Center = v2.lerp(v3, 0.5)
		const v3to1Center = v3.lerp(v1, 0.5)

		const tri: Triangle =
		{
			index: this.triangles.length,
			v1, v2, v3, v1to2, v1to3, v2to3, v3to1,
			normal, v1to2Normal, v3to1Normal, v2to3Normal,
			centroid, v1to2Center, v3to1Center, v2to3Center,
		}

		this.triangles.push(tri)
	}


	solve(posPrev: Vec3, pos: Vec3, radius: number): Resolution
	{
		let solvedPos = pos

		for (const tri of this.triangles)
		{
			const newPos = this.solveTriangle(tri, posPrev, pos, radius)
			if (!newPos)
				continue
			
			return newPos
		}

		return {
			position: pos,
			contact: pos,
			normal: new Vec3(0, 0, 0),
		}
	}


	solveTriangle(tri: Triangle, posPrev: Vec3, pos: Vec3, radius: number): Resolution | null
	{
		const radiusNormal = tri.normal.scale(radius)
		const speed = pos.sub(posPrev)

		const dotPrevNormal = tri.normal.dot(posPrev.sub(radiusNormal).sub(tri.v1))
		//console.log("dotPrevNormal", dotPrevNormal)
		if (dotPrevNormal < -0.01)
			return null

		const dotNormal = tri.normal.dot(pos.sub(radiusNormal).sub(tri.v1))
		//console.log("dotNormal", dotNormal)
		if (dotNormal >= -0.01)
			return null

		let tPlane = Geometry.sweepSphereToPlane(posPrev, speed, radius, tri.v1, tri.normal)
		const pPlane = posPrev.sub(tri.normal.scale(radius)).add(speed.scale(tPlane))
		const dotPlane1 = pPlane.sub(tri.v1).dot(tri.v1to2Normal)
		const dotPlane2 = pPlane.sub(tri.v2).dot(tri.v2to3Normal)
		const dotPlane3 = pPlane.sub(tri.v3).dot(tri.v3to1Normal)

		if (dotPlane1 > 0 || dotPlane2 > 0 || dotPlane3 > 0)
			tPlane = Infinity

		const tE1 = Geometry.sweepSphereToSegment(posPrev, speed, radius, tri.v1, tri.v1to2)
		const tE2 = Geometry.sweepSphereToSegment(posPrev, speed, radius, tri.v2, tri.v2to3)
		const tE3 = Geometry.sweepSphereToSegment(posPrev, speed, radius, tri.v3, tri.v3to1)
	
		const tV1 = Geometry.sweepSphereToPoint(posPrev, speed, radius, tri.v1)
		const tV2 = Geometry.sweepSphereToPoint(posPrev, speed, radius, tri.v2)
		const tV3 = Geometry.sweepSphereToPoint(posPrev, speed, radius, tri.v3)

		const t = Math.min(tPlane, tE1, tE2, tE3, tV1, tV2, tV3)

		if (!isFinite(t))
			return null
		
		return {
			position: posPrev.add(speed.scale(t)),
			contact: posPrev.sub(tri.normal.scale(radius)).add(speed.scale(t)),
			normal: tri.normal,
		}


		/*
			
		const pointOnSurface = pos.sub(tri.v1)
			.projectOnPlane(tri.normal)
			.add(tri.v1)
		
		const solvedOnSurface = pointOnSurface.add(radiusNormal)

		const vs = [tri.v1, tri.v2, tri.v3]
		const vedge = [tri.v1to2, tri.v2to3, tri.v3to1]
		const vnormal = [tri.v1to2Normal, tri.v2to3Normal, tri.v3to1Normal]

		let inside = true
		for (let v = 0; v < 3; v++)
		{
			const vsToPointOnSurface = pointOnSurface.sub(vs[v])

			const dotEdge = vsToPointOnSurface.dot(vnormal[v])
			if (dotEdge <= 0)
				continue
				
			const distEdge = vsToPointOnSurface.sub(vsToPointOnSurface.project(vedge[v])).magn()
			if (distEdge >= radius)
				inside = false
		}

		if (!inside)
			return pos

		for (let v = 0; v < 3; v++)
		{
			const vsToPointOnSurface = pointOnSurface.sub(vs[v])

			const dotEdge = vsToPointOnSurface.dot(vnormal[v])
			if (dotEdge <= 0)
				continue
				
			const distEdge = vsToPointOnSurface.sub(vsToPointOnSurface.project(vedge[v])).magn()
			if (distEdge >= radius)
				continue

			const distEdgeT = distEdge / radius
			const edgeOffset = 1 - Math.sqrt(1 - distEdgeT * distEdgeT)
			//console.log(tri.index, v, "edge", dotEdge)
			//console.log(tri.index, v, "distEdge", distEdge)
			//console.log(tri.index, v, "distEdgeT", distEdgeT)
			//console.log(tri.index, v, "edgeOffset", edgeOffset)
			return solvedOnSurface
				.sub(tri.normal.scale(edgeOffset * radius))
		}

		return solvedOnSurface*/
	}
}