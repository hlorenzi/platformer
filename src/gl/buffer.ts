export class GLBuffer
{
	id: WebGLBuffer
	count: number


	static makePosition(gl: WebGLRenderingContext, positions: number[])
	{
		return GLBuffer.make(gl, positions)
	}
	
	
	static makeNormal(gl: WebGLRenderingContext, normals: number[])
	{
		return GLBuffer.make(gl, normals)
	}
	
	
	static makeColor(gl: WebGLRenderingContext, colors: number[])
	{
		return GLBuffer.make(gl, colors)
	}
	
	
	static make(gl: WebGLRenderingContext, data: number[])
	{
		let buffer = gl.createBuffer()!
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
		
		return new GLBuffer(buffer, data.length)
	}
	
	
	constructor(id: WebGLBuffer, count: number)
	{
		this.id = id
		this.count = count
	}
}