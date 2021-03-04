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
        const up = new Vec3(0, 0, -1)
        const accel = 0.005
        const decel = 0.015
        const maxSpeed = 0.05

        let moveVec = new Vec3(0, 0, 0)

        if (!this.director.keysHeld.has("z"))
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
                
            if (this.director.keysHeld.has("q"))
                moveVec.z -= 1
                
            if (this.director.keysHeld.has("e"))
                moveVec.z += 1
        }

        moveVec = moveVec.normalized().scale(accel)

        this.speed = this.speed
            .add(forward.scale(moveVec.y))
            .add(sideways.scale(moveVec.x))
            .add(up.scale(moveVec.z))

        const speedMagn = this.speed.magn()
        if (speedMagn > maxSpeed)
            this.speed = this.speed.normalized().scale(maxSpeed)

        if (moveVec.magn() == 0)
        {
            if (speedMagn > decel)
                this.speed = this.speed.sub(this.speed.normalized().scale(decel))
            else
                this.speed = new Vec3(0, 0, 0)
        }
    }


    handleMovement2()
    {
        const camera = this.director.objectFind(Camera)
        if (!camera)
            return

        const forward = camera.lookAt.sub(camera.position).withZ(0).normalized()
        const sideways = new Vec3(forward.y, -forward.x, 0)
        const up = new Vec3(0, 0, -1)
        const accel = 0.005
        const decel = 0.015
        const maxSpeed = 0.05

        let moveVec = new Vec3(0, 0, 0)

        if (this.director.keysHeld.has("z"))
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
                
            if (this.director.keysHeld.has("q"))
                moveVec.z -= 1
                
            if (this.director.keysHeld.has("e"))
                moveVec.z += 1
        }

        moveVec = moveVec.normalized().scale(accel)

        this.speed2 = this.speed2
            .add(forward.scale(moveVec.y))
            .add(sideways.scale(moveVec.x))
            .add(up.scale(moveVec.z))

        const speedMagn = this.speed2.magn()
        if (speedMagn > maxSpeed)
            this.speed2 = this.speed2.normalized().scale(maxSpeed)

        if (moveVec.magn() == 0)
        {
            if (speedMagn > decel)
                this.speed2 = this.speed2.sub(this.speed2.normalized().scale(decel))
            else
                this.speed2 = new Vec3(0, 0, 0)
        }
    }


    render()
    {
        const stage = this.director.objectFind(Stage1)
        if (!stage)
            return

        const fromPos = this.position
        const toPos = this.position2
        const solved = stage.collision.repel(fromPos, toPos, this.radius)
        const solvedSlide = stage.collision.repelAndSlide(fromPos, toPos, this.radius)
        
        this.director.scene.pushTranslationScale(fromPos, this.scale)
        this.director.scene.drawModel(
            this.model,
            this.director.scene.materialColor,
            [1, 0, 0, 1])
        this.director.scene.popTranslationScale()

        this.director.scene.pushTranslationScale(solved.position, this.scale)
        this.director.scene.drawModel(
            this.model,
            this.director.scene.materialColor,
            [1, 0.5, 0, 1])
        this.director.scene.popTranslationScale()

        this.director.scene.pushTranslationScale(solvedSlide.position, this.scale)
        this.director.scene.drawModel(
            this.model,
            this.director.scene.materialColor,
            [1, 1, 0, 1])
        this.director.scene.popTranslationScale()

        this.director.scene.pushTranslationScale(solved.contact, new Vec3(0.25, 0.25, 0.25))
        this.director.scene.drawModel(
            this.model,
            this.director.scene.materialColor,
            [1, 0, 0, 1])
        this.director.scene.popTranslationScale()

        this.director.scene.drawArrow(
            fromPos,
            toPos,
            0.025,
            [1, 0, 0, 1])

            this.director.scene.drawArrow(
            fromPos,
            solvedSlide.position,
            0.025,
            [1, 0.5, 1, 1])

        this.director.scene.drawArrow(
            fromPos,
            solvedSlide.position,
            0.025,
            [1, 1, 0, 1])
                    
        this.director.scene.drawArrow(
            solved.position,
            solvedSlide.position,
            0.025,
            [1, 1, 1, 1])
            
        this.director.scene.drawArrow(
            solved.position,
            solved.position.add(solved.position.sub(solved.contact).scale(this.scale.x * 2)),
            0.025,
            [1, 0, 0, 1])
        
        /*this.director.scene.pushTranslationScale(solved.position.add(slide), this.scale)
        this.director.scene.drawModel(
            this.model,
            this.director.scene.materialColor,
            [0, 1, 0, 1])
        this.director.scene.popTranslationScale()
        
        this.director.scene.drawArrow(
            solved.position,
            solved.position.add(slide),
            0.025,
            [0, 1, 0, 1])

        for (const tri of stage.collision.triangles)
        {
            const direction = this.position.directionToPlane(tri.normal, tri.v1)

            this.director.scene.drawArrow(
                this.position,
                this.position.add(direction),
                0.025,
                [0, 1, 1, 1])
        }*/
    }
}