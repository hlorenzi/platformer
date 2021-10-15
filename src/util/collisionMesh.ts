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
	t: number
	contact: Vec3
}


interface RepelResolution
{
	position: Vec3
	contact: Vec3
}


interface SolveResult
{
	collided: boolean
	position: Vec3
	contact: Vec3
}


const buckets = 50


interface BucketIndex
{
	x: number
	y: number
}


export default class CollisionMesh
{
	triangles: Triangle[]
	triangleBuckets: Triangle[][][]

	xMin: number = 0
	xMax: number = 0
	yMin: number = 0
	yMax: number = 0


	constructor()
	{
		this.triangles = []
		this.triangleBuckets = []
		for (let j = 0; j < buckets; j++)
		{
			this.triangleBuckets.push([])
			for (let i = 0; i < buckets; i++)
				this.triangleBuckets[j].push([])
		}
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

		this.xMin = Math.min(this.xMin, v1.x, v2.x, v3.x)
		this.xMax = Math.max(this.xMax, v1.x, v2.x, v3.x)
		this.yMin = Math.min(this.yMin, v1.y, v2.y, v3.y)
		this.yMax = Math.max(this.yMax, v1.y, v2.y, v3.y)
	}


	build()
	{
		for (const tri of this.triangles)
		{
			this.addToNearBuckets(tri, this.bucketForPosition(tri.v1))
			this.addToNearBuckets(tri, this.bucketForPosition(tri.v2))
			this.addToNearBuckets(tri, this.bucketForPosition(tri.v3))
		}
	}


	addToNearBuckets(tri: Triangle, bucketIndex: BucketIndex)
	{
		this.addToBucket(tri, bucketIndex)
		this.addToBucket(tri, { x: bucketIndex.x - 1, y: bucketIndex.y })
		this.addToBucket(tri, { x: bucketIndex.x + 1, y: bucketIndex.y })
		this.addToBucket(tri, { x: bucketIndex.x - 1, y: bucketIndex.y - 1 })
		this.addToBucket(tri, { x: bucketIndex.x + 0, y: bucketIndex.y - 1 })
		this.addToBucket(tri, { x: bucketIndex.x + 1, y: bucketIndex.y - 1 })
		this.addToBucket(tri, { x: bucketIndex.x - 1, y: bucketIndex.y + 1 })
		this.addToBucket(tri, { x: bucketIndex.x + 0, y: bucketIndex.y + 1 })
		this.addToBucket(tri, { x: bucketIndex.x + 1, y: bucketIndex.y + 1 })
	}


	addToBucket(tri: Triangle, bucketIndex: BucketIndex)
	{
		if (bucketIndex.x < 0 || bucketIndex.x >= buckets)
			return
			
		if (bucketIndex.y < 0 || bucketIndex.y >= buckets)
			return

		const bucket = this.triangleBuckets[bucketIndex.y][bucketIndex.x]
		if (!bucket.find(t => t === tri))
			bucket.push(tri)
	}


	bucketForPosition(pos: Vec3): BucketIndex
	{
		const x = Math.max(0, Math.floor((pos.x - this.xMin) / (this.xMax - this.xMin) * buckets) % buckets)
		const y = Math.max(0, Math.floor((pos.y - this.yMin) / (this.yMax - this.yMin) * buckets) % buckets)
		return { x, y }
	}


	*enumerateTrianglesByBuckets(pos: Vec3): Generator<Triangle, void, void>
	{
		const bucketIndex = this.bucketForPosition(pos)
		for (const tri of this.triangleBuckets[bucketIndex.y][bucketIndex.x])
			yield tri
	}


	repelAndSlide(posPrev: Vec3, pos: Vec3, radius: number): SolveResult
	{
		let contact = pos
		let collided = false

		for (let i = 0; i < 2; i++)
		{
			const solved = this.repel(posPrev, pos, radius)
			posPrev = solved.position

			if (!solved.collided)
				break

			collided = true
			contact = solved.contact

			const slideVec = pos.sub(solved.position).projectOnPlane(solved.position.sub(solved.contact))
			pos = posPrev.add(slideVec)
		}

		return {
			position: posPrev,
			contact,
			collided,
		}
	}


	collideAndSlide(posPrev: Vec3, pos: Vec3, radius: number): SolveResult
	{
		let contact = pos
		let collided = false

		for (let i = 0; i < 3; i++)
		{
			const solved = this.collide(posPrev, pos, radius)
			posPrev = solved.position

			if (!solved.collided)
				break

			collided = true
			contact = solved.contact

			const extraSpeed = pos.sub(solved.position)
			const slideVec = extraSpeed.projectOnPlane(solved.position.sub(solved.contact))
			pos = posPrev.add(slideVec)
		}

		return {
			position: posPrev,
			contact,
			collided,
		}
	}


	repel(posPrev: Vec3, pos: Vec3, radius: number): SolveResult
	{
		let solvedPos = pos
		let solvedT = Infinity
		let contact = pos
		let collided = false

		for (const tri of this.enumerateTrianglesByBuckets(pos))
		{
			const triSolved = this.repelTriangle(tri, posPrev, pos, radius)
			if (!triSolved)
				continue

			const triSolvedT = triSolved.position.sub(posPrev).projectT(pos.sub(posPrev))

			if (triSolvedT < solvedT)
			{
				solvedPos = triSolved.position
				solvedT = triSolvedT
				contact = triSolved.contact
				collided = true
			}
		}

		return {
			position: solvedPos,
			contact,
			collided,
		}
	}


	collide(posPrev: Vec3, pos: Vec3, radius: number): SolveResult
	{
		let t = 1
		let contact = pos

		for (const tri of this.triangles)
		{
			const triSolved = this.collideTriangle(tri, posPrev, pos, radius)
			if (!triSolved)
				continue

			if (triSolved.t < t)
			{
				t = triSolved.t
				contact = triSolved.contact
			}
		}

		return {
			position: posPrev.add(pos.sub(posPrev).scale(t)),
			contact,
			collided: t < 1,
		}
	}


	repelTriangle(tri: Triangle, posPrev: Vec3, pos: Vec3, radius: number): RepelResolution | null
	{
		const speed = pos.sub(posPrev)
		const speedNorm = speed.normalized()
		const sqrRadius = radius * radius

		const sqrDistPlanePrev = posPrev.signedSqrDistanceToPlane(tri.normal, tri.v1)
		if (sqrDistPlanePrev <= -sqrRadius)
			return null

		const sqrDistPlane = pos.signedSqrDistanceToPlane(tri.normal, tri.v1)
		if (sqrDistPlane >= sqrRadius)
			return null

		//const sqrDistEdge1 = pos.signedSqrDistanceToPlane(tri.v1to2Normal, tri.v1)
		//const sqrDistEdge2 = pos.signedSqrDistanceToPlane(tri.v2to3Normal, tri.v2)
		//const sqrDistEdge3 = pos.signedSqrDistanceToPlane(tri.v3to1Normal, tri.v3)
		
		const sqrDistEdge1 = pos.signedSqrDistanceToPlane(tri.v1to2.normalized().cross(speedNorm), tri.v1)
		const sqrDistEdge2 = pos.signedSqrDistanceToPlane(tri.v2to3.normalized().cross(speedNorm), tri.v2)
		const sqrDistEdge3 = pos.signedSqrDistanceToPlane(tri.v3to1.normalized().cross(speedNorm), tri.v3)
		
		if (sqrDistEdge1 >= sqrRadius || sqrDistEdge2 >= sqrRadius || sqrDistEdge3 >= sqrRadius)
			return null

		const repelledFromSpeed = speed//Math.sqrt(Math.abs(sqrDistPlane)) + radius * 2)
		const repelledFromPos = pos.sub(repelledFromSpeed)
		const repelledCollision = this.collideTriangle(tri, repelledFromPos, repelledFromPos.add(repelledFromSpeed), radius)
		if (!repelledCollision)
			return null

		return {
			position: repelledFromPos.add(repelledFromSpeed.scale(repelledCollision.t).withAddedMagn(-radius * 0.01)),
			contact: repelledCollision.contact,
		}
	}


	collideTriangle(tri: Triangle, posPrev: Vec3, pos: Vec3, radius: number): Resolution | null
	{
		const radiusNormal = tri.normal.scale(radius)
		const speed = pos.sub(posPrev)

		const dotPrevNormal = tri.normal.dot(posPrev.sub(radiusNormal).sub(tri.v1))
		//console.log("dotPrevNormal", dotPrevNormal)
		//if (dotPrevNormal < 0)
		//	return null

		const dotNormal = tri.normal.dot(pos.sub(radiusNormal).sub(tri.v1))
		//console.log("dotNormal", dotNormal)
		//if (dotNormal > 0)
		//	return null

		const speedDotNormal = tri.normal.dot(speed)

		let tPlane = Geometry.sweepSphereToPlane(posPrev, speed, radius, tri.v1, tri.normal)
		const contactPlane = posPrev.sub(tri.normal.scale(radius)).add(speed.scale(tPlane))
		const dotPlane1 = contactPlane.sub(tri.v1).dot(tri.v1to2Normal)
		const dotPlane2 = contactPlane.sub(tri.v2).dot(tri.v2to3Normal)
		const dotPlane3 = contactPlane.sub(tri.v3).dot(tri.v3to1Normal)

		if (dotPlane1 > 0 || dotPlane2 > 0 || dotPlane3 > 0)
			tPlane = Infinity

		const tE1 = Geometry.sweepSphereToSegment(posPrev, speed, radius, tri.v1, tri.v1to2)
		const tE2 = Geometry.sweepSphereToSegment(posPrev, speed, radius, tri.v2, tri.v2to3)
		const tE3 = Geometry.sweepSphereToSegment(posPrev, speed, radius, tri.v3, tri.v3to1)
	
		const tV1 = Geometry.sweepSphereToPoint(posPrev, speed, radius, tri.v1)
		const tV2 = Geometry.sweepSphereToPoint(posPrev, speed, radius, tri.v2)
		const tV3 = Geometry.sweepSphereToPoint(posPrev, speed, radius, tri.v3)

		const t = Math.min(tPlane, tE1, tE2, tE3, tV1, tV2, tV3)

		//if (speedDotNormal >= 0 && (t < 0 || t > 1))
		//	return null

		//if (speedDotNormal < 0 && (t < -0.5 || t > 1))
		//	return null

		if (t < 0 || t > 1)
			return null

		if (!isFinite(t))
			return null

		if (tPlane < tE1 && tPlane < tE2 && tPlane < tE3 && tPlane < tV1 && tPlane < tV2 && tPlane < tV3)
			return { t: tPlane, contact: contactPlane }

		if (tE1 < tE2 && tE1 < tE3 && tE1 < tV1 && tE1 < tV2 && tE1 < tV3)
		{
			const pE1 = posPrev.add(speed.scale(tE1))
			return { t: tE1, contact: pE1.sub(pE1.directionToLine(tri.v1to2, tri.v1)) }
		}

		if (tE2 < tE3 && tE2 < tV1 && tE2 < tV2 && tE2 < tV3)
		{
			const pE2 = posPrev.add(speed.scale(tE2))
			return { t: tE2, contact: pE2.sub(pE2.directionToLine(tri.v2to3, tri.v2)) }
		}
		
		if (tE3 < tV1 && tE3 < tV2 && tE3 < tV3)
		{
			const pE3 = posPrev.add(speed.scale(tE3))
			return { t: tE3, contact: pE3.sub(pE3.directionToLine(tri.v3to1, tri.v3)) }
		}
		
		if (tV1 < tV2 && tE3 < tV3)
		{
			return { t: tV1, contact: tri.v1 }
		}
		
		if (tV2 < tV3)
		{
			return { t: tV2, contact: tri.v2 }
		}

		return { t: tV3, contact: tri.v3 }
	}
}