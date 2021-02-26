import { Director } from "../director"
import { Object } from "./_object"
import ModelBuilder from "../util/modelBuilder"
import Vec3 from "../math/vec3"
import Mat4 from "../math/mat4"
import { Player } from "./player"
import { Test } from "./test"


export class Camera extends Object
{
    model!: any
    lookAt: Vec3 = new Vec3(0, 0, 0)
    up: Vec3 = new Vec3(0, 0, -1)


    init()
    {
        const builder = new ModelBuilder()
        builder.addCube(-1, -1, -1, 1, 1, 1)
        builder.calculateNormals()

        this.model = builder.makeModel(this.director.gl)
    }


    setMatrices()
    {
        this.director.scene.setProjection(Mat4.perspective(
            60, this.director.canvasW / this.director.canvasH,
            0.1, 1000))

        this.director.scene.setView(Mat4.lookat(
            this.position,
            this.lookAt,
            this.up))
    }


    process()
    {
        let target: any = this.director.objectFind(Player)
        if (!target)
            target = this.director.objectFind(Test)

        if (!target)
            return
            
        this.lookAt = target.position

        const speed = 0.5
        const goalDistance = 5

        const dirToLookat = this.lookAt.sub(this.position).normalized().withZ(0).scale(goalDistance)
        const goalPos = this.lookAt.sub(dirToLookat).add(new Vec3(0, 0, 0.5 -goalDistance * 0.45))

        this.position = goalPos
    }
}