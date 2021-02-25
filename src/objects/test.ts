import { Director } from "../director"
import { Object } from "./_object"
import { Camera } from "./camera"
import ModelBuilder from "../util/modelBuilder"
import Vec3 from "../math/vec3"
import { Stage1 } from "./stage1"
import CollisionMesh from "../util/collisionMesh"
import GfxModel from "../gl/model"


export class Test extends Object
{
    sphereModel!: GfxModel
    radius: number = 0.15
    anim: number = 0


    init()
    {
        const builder = new ModelBuilder()
        builder.addSphere(
            -this.radius, -this.radius, -this.radius,
            this.radius, this.radius, this.radius)
        
        builder.calculateNormals()

        this.sphereModel = builder.makeModel(this.director.gl)
    }


    process()
    {
        if (this.director.keysHeld.has("q"))
            this.anim += 0.0025

        if (this.director.keysHeld.has("e"))
            this.anim -= 0.0025
    }


    render()
    {
        const stage = this.director.objectFind(Stage1)
        if (!stage)
            return

        const fromPos = this.position.add(new Vec3(-1 + 2 * this.anim, 0, -1))
        const toPos = fromPos.add(new Vec3(0, 0, 2))
        const solved = stage.collision.solve(fromPos, toPos, this.radius)
        
        this.director.scene.pushTranslationScale(fromPos, this.scale)

        this.director.scene.drawModel(
            this.sphereModel,
            this.director.scene.materialColor,
            [1, 0, 0, 1])

        this.director.scene.popTranslationScale()

        this.director.scene.pushTranslationScale(toPos, this.scale)

        this.director.scene.drawModel(
            this.sphereModel,
            this.director.scene.materialColor,
            [1, 0, 0.5, 1])

        this.director.scene.popTranslationScale()

        this.director.scene.pushTranslationScale(solved.position, this.scale)

        this.director.scene.drawModel(
            this.sphereModel,
            this.director.scene.materialColor,
            [1, 0, 1, 1])

        this.director.scene.popTranslationScale()
        
        this.director.scene.drawArrow(
            fromPos,
            toPos,
            0.025,
            [1, 0, 1, 1])
    }
}