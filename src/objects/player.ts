import { Director } from "../director"
import { Object } from "./_object"
import { Camera } from "./camera"
import ModelBuilder from "../util/modelBuilder"
import Vec3 from "../math/vec3"
import * as Geometry from "../math/geometry"
import { Stage1 } from "./stage1"
import GfxModel from "../gl/model"


export class Player extends Object
{
    model!: GfxModel
    posPrev: Vec3 = new Vec3(0, 0, 0)
    speed: Vec3 = new Vec3(0, 0, 0)
    radius: number = 0.15


    init()
    {
        const builder = new ModelBuilder()
        builder.addSphere(
            -this.radius, -this.radius, -this.radius,
            this.radius, this.radius, this.radius)
        
        builder.calculateNormals()

        this.model = builder.makeModel(this.director.gl)
        
        this.posPrev = this.position
    }


    process()
    {
        this.handleMovement()
        this.handleJump()

        this.position = this.position.add(this.speed)

        this.handleCollision()
        
        this.posPrev = this.position
    }


    handleMovement()
    {
        const camera = this.director.objectFind(Camera)
        if (!camera)
            return

        const forward = camera.lookAt.sub(camera.position).withZ(0).normalized()
        const sideways = new Vec3(forward.y, -forward.x, 0)
        const accel = 0.005
        const decel = 0.015
        const maxSpeed = 0.05

        let moveVec = new Vec3(0, 0, 0)

        if (this.director.keysHeld.has("arrowup") ||
            this.director.keysHeld.has("w"))
            moveVec.y += 1
            
        if (this.director.keysHeld.has("arrowdown") ||
            this.director.keysHeld.has("s"))
            moveVec.y -= 1
        
        if (this.director.keysHeld.has("arrowleft") ||
            this.director.keysHeld.has("a"))
            moveVec.x -= 1
            
        if (this.director.keysHeld.has("arrowright") ||
            this.director.keysHeld.has("d"))
            moveVec.x += 1

        moveVec = moveVec.normalized().scale(accel)

        let groundSpeed = this.speed.withZ(0)

        groundSpeed = groundSpeed
            .add(forward.scale(moveVec.y))
            .add(sideways.scale(moveVec.x))

        const speedMagn = groundSpeed.withZ(0).magn()
        if (speedMagn > maxSpeed)
            groundSpeed = groundSpeed.withZ(0).normalized().scale(maxSpeed)

        if (moveVec.magn() == 0)
        {
            if (speedMagn > decel)
                groundSpeed = groundSpeed.sub(groundSpeed.normalized().scale(decel))
            else
                groundSpeed = new Vec3(0, 0, groundSpeed.z)
        }

        this.speed = this.speed.sub(this.speed.withZ(0)).add(groundSpeed)
    }


    handleJump()
    {
        this.speed = this.speed.add(new Vec3(0, 0, 0.01))

        if (this.director.keysDown.has(" "))
        {
            this.speed = this.speed.withZ(-0.15)
        }
    }


    handleCollision()
    {
        const stage = this.director.objectFind(Stage1)
        if (!stage)
            return

        const solved = stage.collision.collideAndSlide(
            this.posPrev,
            this.position,
            this.radius)

        this.position = solved.position

        this.speed = this.speed.withZ(this.position.z - this.posPrev.z)
    }


    render()
    {
        this.director.scene.pushTranslationScale(this.position, this.scale)

        this.director.scene.drawModel(
            this.model,
            this.director.scene.materialColor,
            [1, 1, 1, 1])

        this.director.scene.popTranslationScale()
    }
}