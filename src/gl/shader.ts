import Vec3 from "../math/vec3"
import Mat4 from "../math/mat4"
import { GLBuffer } from "./buffer"


export class GLShader
{
	id: WebGLShader


	static makeVertex(gl: WebGLRenderingContext, src: string)
	{
		return GLShader.make(gl, src, gl.VERTEX_SHADER)
	}
	
	
	static makeFragment(gl: WebGLRenderingContext, src: string)
	{
		return GLShader.make(gl, src, gl.FRAGMENT_SHADER)
	}
	
	
	static make(gl: WebGLRenderingContext, src: string, kind: number)
	{
		let shader = gl.createShader(kind)!
		gl.shaderSource(shader, src)
		gl.compileShader(shader)
		
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
		{
			console.error("Error compiling shader: \n\n" + gl.getShaderInfoLog(shader))
			gl.deleteShader(shader)
			return null
		}

		return new GLShader(shader)
	}
	
	
	constructor(id: WebGLShader)
	{
		this.id = id
	}
}


export class GLProgram
{
	id: WebGLProgram
	attributes: { [key: string]: number }
	uniforms: { [key: string]: WebGLUniformLocation }
	hasColor: boolean


	static makeFromSrc(gl: WebGLRenderingContext, vertexSrc: string, fragmentSrc: string)
	{
		let vertexShader = GLShader.makeVertex(gl, vertexSrc)
		if (vertexShader == null)
			throw "vertexShader null"
		
		let fragmentShader = GLShader.makeFragment(gl, fragmentSrc)
		if (fragmentShader == null)
			throw "fragmentShader null"
		
		return GLProgram.make(gl, vertexShader, fragmentShader)
	}
	
	
	static make(gl: WebGLRenderingContext, vertexShader: GLShader, fragmentShader: GLShader)
	{
		let program = gl.createProgram()!
		gl.attachShader(program, vertexShader.id)
		gl.attachShader(program, fragmentShader.id)
		gl.linkProgram(program)
		
		if (!gl.getProgramParameter(program, gl.LINK_STATUS))
		{
			console.error("Error creating program: \n\n" + gl.getProgramInfoLog(program))
			gl.deleteProgram(program)
			throw "GLProgram.make error"
		}

		return new GLProgram(program)
	}
	
	
	constructor(id: WebGLProgram)
	{
		this.id = id
		this.attributes = { }
		this.uniforms = { }
		
		this.hasColor = false
	}
	
	
	registerLocations(gl: WebGLRenderingContext, attrbs: string[], unifs: string[])
	{
		for (let attrb of attrbs)
			this.attributes[attrb] = gl.getAttribLocation(this.id, attrb)
		
		for (let unif of unifs)
			this.uniforms[unif] = gl.getUniformLocation(this.id, unif)!
		
		this.hasColor = (attrbs.find(a => a == "aColor") != null)
		
		return this
	}
	
	
	use(gl: WebGLRenderingContext)
	{
		gl.useProgram(this.id)
		return this
	}
	
	
	bindPosition(gl: WebGLRenderingContext, attrb: string, buffer: GLBuffer)
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer.id)
		gl.vertexAttribPointer(this.attributes[attrb], 3, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(this.attributes[attrb])
		return this
	}
	
	
	bindNormals(gl: WebGLRenderingContext, attrb: string, buffer: GLBuffer)
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer.id)
		gl.vertexAttribPointer(this.attributes[attrb], 3, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(this.attributes[attrb])
		return this
	}
	
	
	bindColors(gl: WebGLRenderingContext, attrb: string, buffer: GLBuffer)
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer.id)
		gl.vertexAttribPointer(this.attributes[attrb], 4, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(this.attributes[attrb])
		return this
	}
	
	
	setFloat(gl: WebGLRenderingContext, unif: string, x: number)
	{
		gl.uniform1f(this.uniforms[unif], x)
		return this
	}
	
	
	setMat4(gl: WebGLRenderingContext, unif: string, matrix: Mat4)
	{
		gl.uniformMatrix4fv(this.uniforms[unif], false, matrix.asFloat32Array())
		return this
	}
	
	
	setVec4(gl: WebGLRenderingContext, unif: string, vec: [number, number, number, number])
	{
		gl.uniform4fv(this.uniforms[unif], new Float32Array(vec))
		return this
	}
	
	
	drawTriangles(gl: WebGLRenderingContext, count: number, offset = 0)
	{
		gl.drawArrays(gl.TRIANGLES, offset, count)
		return this
	}
	
	
	drawTriangleStrip(gl: WebGLRenderingContext, count: number, offset = 0)
	{
		gl.drawArrays(gl.TRIANGLE_STRIP, offset, count)
		return this
	}
}