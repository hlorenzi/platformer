export default class Vec3
{
	x: number
	y: number
	z: number


	constructor(x: number, y: number, z: number)
	{
		this.x = x
		this.y = y
		this.z = z
	}
	
	
	clone()
	{
		return new Vec3(this.x, this.y, this.z)
	}


	magn()
	{
		return Math.sqrt(this.dot(this))
	}


	magnSqr()
	{
		return this.dot(this)
	}


	withZ(z: number)
	{
		return new Vec3(this.x, this.y, z)
	}


	normalized()
	{
		const magn = this.magn()
		if (magn == 0)
			return this
		
		return new Vec3(
			this.x / magn,
			this.y / magn,
			this.z / magn)
	}


	add(other: Vec3)
	{
		return new Vec3(
			this.x + other.x,
			this.y + other.y,
			this.z + other.z)
	}


	sub(other: Vec3)
	{
		return new Vec3(
			this.x - other.x,
			this.y - other.y,
			this.z - other.z)
	}


	neg()
	{
		return new Vec3(
			-this.x,
			-this.y,
			-this.z)
	}


	scale(f: number)
	{
		return new Vec3(
			this.x * f,
			this.y * f,
			this.z * f)
	}


	mul(other: Vec3)
	{
		return new Vec3(
			this.x * other.x,
			this.y * other.y,
			this.z * other.z)
	}


	dot(other: Vec3)
	{
		return (this.x * other.x + this.y * other.y + this.z * other.z)
	}


	cross(other: Vec3)
	{
		return new Vec3(
			this.y * other.z - this.z * other.y,
			this.z * other.x - this.x * other.z,
			this.x * other.y - this.y * other.x)
	}
	
	
	lerp(other: Vec3, amount: number)
	{
		return new Vec3(
			this.x + (other.x - this.x) * amount,
			this.y + (other.y - this.y) * amount,
			this.z + (other.z - this.z) * amount)
	}
	
	
	min(other: Vec3)
	{
		if (other == null)
			return this
		
		return new Vec3(
			Math.min(this.x, other.x),
			Math.min(this.y, other.y),
			Math.min(this.z, other.z))
	}
	
	
	max(other: Vec3)
	{
		if (other == null)
			return this
		
		return new Vec3(
			Math.max(this.x, other.x),
			Math.max(this.y, other.y),
			Math.max(this.z, other.z))
	}


	projectT(other: Vec3)
	{
		return this.dot(other) / other.dot(other)
	}
	
	
	project(other: Vec3)
	{
		return other.scale(this.dot(other) / other.dot(other))
	}

	
	projectOnPlane(planeNormal: Vec3)
	{
		return this.sub(this.project(planeNormal))
	}
	
	
	directionToLine(lineVector: Vec3, pointOnLine: Vec3)
	{
		const vec = this.sub(pointOnLine)
		const proj = vec.sub(vec.project(lineVector))
		
		return proj
	}
	
	
	directionToPlane(planeNormal: Vec3, pointOnPlane: Vec3)
	{
		const vec = this.sub(pointOnPlane)
		const proj = vec.projectOnPlane(planeNormal)
		
		return proj.add(pointOnPlane)
	}
	
	
	asArray(): [number, number, number]
	{
		return [this.x, this.y, this.z]
	}
	
	
	isFinite()
	{
		return isFinite(this.x) && isFinite(this.y) && isFinite(this.z)
	}
}