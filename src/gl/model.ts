import { GLBuffer } from "./buffer"


export default class GfxModel
{
	positions!: GLBuffer
	normals!: GLBuffer
	colors!: GLBuffer
	
	
	setPositions(positions: GLBuffer)
	{
		this.positions = positions
		return this
	}
	
	
	setNormals(normals: GLBuffer)
	{
		this.normals = normals
		return this
	}
	
	
	setColors(colors: GLBuffer)
	{
		this.colors = colors
		return this
	}
}