import { Director } from "../director"
import { Object } from "./_object"
import { Camera } from "./camera"
import ModelBuilder from "../util/modelBuilder"
import Vec3 from "../math/vec3"
import * as Geometry from "../math/geometry"
import { Stage1 } from "./stage1"
import GfxModel from "../gl/model"


export class Test extends Object
{
    model!: GfxModel
    position2: Vec3 = new Vec3(0, 0, 0)
    speed: Vec3 = new Vec3(0, 0, 0)
    speed2: Vec3 = new Vec3(0, 0, 0)
    radius: number = 0.15


    init()
    {
        const builder = new ModelBuilder()
        builder.addSphere(
            -this.radius, -this.radius, -this.radius,
            this.radius, this.radius, this.radius)
        
        builder.calculateNormals()

        this.model = builder.makeModel(this.director.gl)

        this.position2 = this.position.add(new Vec3(0, 0, 1))
    }


    process()
    {
        this.handleMovement1()
        this.handleMovement2()

        this.position = this.position.add(this.speed)
        this.position2 = this.position2.add(this.speed)
        this.position2 = this.position2.add(this.speed2)
    }


    handleMovement1()
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

        if (!this.director.keysHeld.has("q"))
        {
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
        }

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


    handleMovement2()
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

        if (this.director.keysHeld.has("q"))
        {
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
        }

        moveVec = moveVec.normalized().scale(accel)

        let groundSpeed = this.speed2.withZ(0)

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

        this.speed2 = this.speed2.sub(this.speed2.withZ(0)).add(groundSpeed)
    }


    render()
    {
        const stage = this.director.objectFind(Stage1)
        if (!stage)
            return

        const fromPos = this.position
        const toPos = this.position2
        const solved = stage.collision.collide(fromPos, toPos, this.radius)
        const solvedSlide = stage.collision.collideAndSlide(fromPos, toPos, this.radius)
        
        this.director.scene.pushTranslationScale(fromPos, this.scale)
        this.director.scene.drawModel(
            this.model,
            this.director.scene.materialColor,
            [1, 0, 0, 1])
        this.director.scene.popTranslationScale()

        this.director.scene.pushTranslationScale(toPos, this.scale)
        this.director.scene.drawModel(
            this.model,
            this.director.scene.materialColor,
            [1, 0, 0.5, 1])
        this.director.scene.popTranslationScale()

        this.director.scene.pushTranslationScale(solved.position, this.scale)
        this.director.scene.drawModel(
            this.model,
            this.director.scene.materialColor,
            [1, 0, 1, 1])
        this.director.scene.popTranslationScale()

        this.director.scene.drawArrow(
            fromPos,
            toPos,
            0.025,
            [1, 0, 1, 1])

        this.director.scene.pushTranslationScale(solvedSlide.position, this.scale)
        this.director.scene.drawModel(
            this.model,
            this.director.scene.materialColor,
            [1, 0.5, 1, 1])
        this.director.scene.popTranslationScale()
        
        this.director.scene.drawArrow(
            solved.position,
            solvedSlide.position,
            0.025,
            [1, 0.5, 1, 1])
            
        this.director.scene.pushTranslationScale(solved.contact, new Vec3(0.25, 0.25, 0.25))
        this.director.scene.drawModel(
            this.model,
            this.director.scene.materialColor,
            [1, 0, 0, 1])
        this.director.scene.popTranslationScale()
    }
}