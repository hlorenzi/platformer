import Vec3 from "../math/vec3"


interface Triangle
{
	v1: Vec3
	v2: Vec3
	v3: Vec3
	v1to2: Vec3
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
			v1, v2, v3, v1to2, v2to3, v3to1,
			normal, v1to2Normal, v3to1Normal, v2to3Normal,
			centroid, v1to2Center, v3to1Center, v2to3Center,
		}

		this.triangles.push(tri)
	}


	solve(posPrev: Vec3, pos: Vec3, radius: number): Vec3
	{
		for (const tri of this.triangles)
		{
			pos = this.repelTriangle(tri, posPrev, pos, radius)
		}

		return pos
	}


	repelTriangle(tri: Triangle, posPrev: Vec3, pos: Vec3, radius: number): Vec3
	{
		const radiusNormal = tri.normal.scale(radius)

		const dotPrevNormal = tri.normal.dot(posPrev.sub(radiusNormal).sub(tri.v1))
		//console.log("dotPrevNormal", dotPrevNormal)
		if (dotPrevNormal < -0.01)
			return pos

		const dotNormal = tri.normal.dot(pos.sub(radiusNormal).sub(tri.v1))
		//console.log("dotNormal", dotNormal)
		if (dotNormal >= -0.01)
			return pos
			
		const dot1to2 = tri.v1to2Normal.dot(pos.sub(tri.v1to2Normal.scale(radius)).sub(tri.v1))
		//console.log("dot1to2", dot1to2)
		if (dot1to2 >= 0)
			return pos

		const dot2to3 = tri.v2to3Normal.dot(pos.sub(tri.v2to3Normal.scale(radius)).sub(tri.v2))
		//console.log("dot2to3", dot2to3)
		if (dot2to3 >= 0)
			return pos

		const dot3to1 = tri.v3to1Normal.dot(pos.sub(tri.v3to1Normal.scale(radius)).sub(tri.v3))
		//console.log("dot3to1", dot3to1)
		if (dot3to1 >= 0)
			return pos

		return pos.sub(tri.v1)
			.projectOnPlane(tri.normal)
			.add(tri.v1)
			.add(radiusNormal)
	}
}