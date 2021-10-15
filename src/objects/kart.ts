import { Director } from "../director"
import { Object } from "./_object"
import { Camera } from "./camera"
import ModelBuilder from "../util/modelBuilder"
import Vec3 from "../math/vec3"
import Mat4 from "../math/mat4"
import * as Geometry from "../math/geometry"
import { Sphere } from "./sphere"
import { Stage } from "./stage"
import GfxModel from "../gl/model"


interface Joint
{
    body1: Sphere
    body2: Sphere
    length: number
    tensionK: number
    frictionK: number
}


function approach(from: number, to: number, step: number)
{
    if (from < to)
        return Math.min(from + step, to)
    else
        return Math.max(from - step, to)
}


export class Kart extends Object
{
    bodies!: Sphere[]
    joints!: Joint[]

    center!: Vec3
    centerPrev!: Vec3
    nose!: Vec3
    forward!: Vec3
    up!: Vec3
    right!: Vec3
    speed!: Vec3

    engineSpeed: number = 0
    steerSpeed: number = 0


    init()
    {
		this.bodies =
		[
			new Sphere(),
			new Sphere(),
			new Sphere(),
			new Sphere(),
		]

        for (const body of this.bodies)
            body.init(this.director)

        this.joints = []
		
		this.reset()
    }


    reset()
    {
        const bodyForwardLen = 0.5
        const bodySideLen = 0.25
        const bodyCrossLen = Math.sqrt(bodyForwardLen * bodyForwardLen + bodySideLen * bodySideLen)
        const sphereRadius = 0.15
        const pos = new Vec3(50, 50, -15)
	
		this.bodies[0].id = 0
		this.bodies[1].id = 1
		this.bodies[2].id = 2
		this.bodies[3].id = 3
		
		this.bodies[0].pos = pos.add(new Vec3(1, 0, 0))
		this.bodies[1].pos = pos.add(new Vec3(1, 1, 0))
		this.bodies[2].pos = pos.add(new Vec3(0, 1, 0))
		this.bodies[3].pos = pos.add(new Vec3(0, 0, 0))
		
		this.bodies[0].speed = new Vec3(0, 0, 0)
		this.bodies[1].speed = new Vec3(0, 0, 0)
		this.bodies[2].speed = new Vec3(0, 0, 0)
		this.bodies[3].speed = new Vec3(0, 0, 0)
		
		this.bodies[0].radius = sphereRadius
		this.bodies[1].radius = sphereRadius
		this.bodies[2].radius = sphereRadius
		this.bodies[3].radius = sphereRadius
		
		this.joints =
		[
			// Outer Edges
			{ body1: this.bodies[0], body2: this.bodies[1],
                length: bodySideLen, tensionK: 0.1, frictionK: 0.1 },
			{ body1: this.bodies[2], body2: this.bodies[3],
                length: bodySideLen, tensionK: 0.1, frictionK: 0.1 },
			{ body1: this.bodies[0], body2: this.bodies[3],
                length: bodyForwardLen, tensionK: 0.1, frictionK: 0.1 },
			{ body1: this.bodies[1], body2: this.bodies[2],
                length: bodyForwardLen, tensionK: 0.1, frictionK: 0.1 },
			
			// Crossing
			{ body1: this.bodies[0], body2: this.bodies[2],
                length: bodyCrossLen, tensionK: 0.25, frictionK: 0.1 },
			{ body1: this.bodies[1], body2: this.bodies[3],
                length: bodyCrossLen, tensionK: 0.25, frictionK: 0.1 },
		]
    }


    process()
    {
        this.handleVectors()
        this.handleMovement()
        this.handleJoints()

        const stage = this.director.objectFind(Stage)
        if (!stage)
            return

        for (const body of this.bodies)
        {
            body.processGravity()
            body.processCollision(stage.collision)
        }
    }


    handleVectors()
    {
        this.centerPrev = this.center ?? new Vec3(0, 0, 0)

        this.center = new Vec3(0, 0, 0)
        for (const body of this.bodies)
            this.center = this.center.add(body.pos)

        this.center = this.center.scale(1 / this.bodies.length)
        this.position = this.center

        this.speed = this.center.sub(this.centerPrev)

        this.nose = this.bodies[0].pos.add(this.bodies[1].pos).scale(1 / 2)

        this.forward = this.nose.sub(this.center).normalized()

        this.up = this.forward.cross(this.bodies[0].pos.sub(this.bodies[1].pos)).normalized()
        if (this.up.z > 0)
            this.up = this.up.neg()

        this.right = this.up.cross(this.forward)
    }


    handleMovement()
    {
        const camera = this.director.objectFind(Camera)
        if (!camera)
            return

        const accel = 0.015
        const maxSpeed = 0.22

        const steerAccel = 0.0025
        const steerDecel = 0.005
        const steerMaxSpeed = 0.02

        if (this.director.keysHeld.has("arrowup") ||
            this.director.keysHeld.has("w") ||
            this.director.keysHeld.has(" "))
            this.engineSpeed = approach(this.engineSpeed, 1, 1)
            
        else if (this.director.keysHeld.has("arrowdown") ||
            this.director.keysHeld.has("s") ||
            this.director.keysHeld.has("x"))
            this.engineSpeed = approach(this.engineSpeed, -1, 1)
        
        else
            this.engineSpeed = 0//approach(this.engineSpeed, 0, decel)
        
        if (this.director.keysHeld.has("arrowleft") ||
            this.director.keysHeld.has("a"))
            this.steerSpeed = approach(this.steerSpeed, -steerMaxSpeed, steerAccel)
            
        else if (this.director.keysHeld.has("arrowright") ||
            this.director.keysHeld.has("d"))
            this.steerSpeed = approach(this.steerSpeed, steerMaxSpeed, steerAccel)

        else
            this.steerSpeed = approach(this.steerSpeed, 0, steerDecel)


        for (const body of this.bodies)
        {
            if (!body.touchingGround)
                continue

            const targetForce = this.forward.scale(this.engineSpeed * maxSpeed)
            const accelForce = targetForce.sub(body.speed).scale(accel)
            body.speed = body.speed.add(accelForce)

            const sideFriction = body.speed.project(this.right)
            body.speed = body.speed.sub(sideFriction.scale(0.25))
        }

        
        const steerMatrix = Mat4.rotation(this.up, this.steerSpeed)
        for (const body of this.bodies)
        {
            const fromCenter = body.pos.sub(this.center)
            const rotated = steerMatrix.mulPoint(fromCenter)
            body.instantSpeed = body.instantSpeed.add(rotated.sub(fromCenter))
        }
    }


    handleJoints()
    {
        for (const joint of this.joints)
		{
			const dir  = joint.body1.pos.sub(joint.body2.pos)
			const dirN = dir.normalized()
			const dist = dir.magn()
			
			const tensionForce = dirN.scale((dist - joint.length) * joint.tensionK)
			
			joint.body1.speed = joint.body1.speed.sub(tensionForce)
			joint.body2.speed = joint.body2.speed.add(tensionForce)
			
			const frictionForce = joint.body1.speed.sub(joint.body2.speed).scale(joint.frictionK)
			
			joint.body1.speed = joint.body1.speed.sub(frictionForce)
			joint.body2.speed = joint.body2.speed.add(frictionForce)
		}
    }


    render()
    {
        for (const body of this.bodies)
            body.render()
            
        /*this.director.scene.drawArrow(
            this.center,
            this.center.add(this.forward.withMagn(0.5)),
            0.025,
            [1, 0, 0, 1])
            
        this.director.scene.drawArrow(
            this.center,
            this.center.add(this.right.withMagn(0.5)),
            0.025,
            [0, 0, 1, 1])*/
            
        this.director.scene.drawArrow(
            this.center,
            this.center.add(this.up.withMagn(100)),
            0.025,
            [0, 1, 0, 1])
            
        this.director.scene.drawArrow(
            this.center,
            this.center.add(this.bodies[0].speed.scale(100)),
            0.025,
            [1, 1, 0, 1])

        this.director.scene.drawArrow(
            this.center,
            this.center.add(this.bodies[0].speed.project(this.right).scale(100)),
            0.025,
            [1, 0, 1, 1])
    }
}