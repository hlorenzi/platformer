import { Director } from "../director"
import { Object } from "./_object"
import ModelBuilder from "../util/modelBuilder"
import GLModel from "../gl/model"
import CollisionMesh from "../util/collisionMesh"
import Vec3 from "../math/vec3"


export class Stage extends Object
{
    model!: GLModel
    collision!: CollisionMesh


    init()
    {

    }


    setModel(gl: WebGLRenderingContext, builder: ModelBuilder)
    {
        this.model = builder.makeModel(gl)
        this.collision = builder.makeCollision()
        console.log(this.collision.triangles)
    }


    render()
    {
        this.director.scene.pushTranslationScale(this.position, this.scale)

        this.director.scene.drawModel(
            this.model,
            this.director.scene.materialColor,
            [0.1, 0.75, 1, 1])

        this.director.scene.popTranslationScale()

        return

        for (const tri of this.collision.triangles)
        {
            this.director.scene.drawArrow(
                tri.centroid,
                tri.centroid.add(tri.normal.scale(0.1)),
                0.025,
                [1, 0, 0, 1])
            
            this.director.scene.drawArrow(
                tri.v1,
                tri.v1.add(tri.normal.scale(0.1)),
                0.025,
                [0, 0, 1, 1])
            
            this.director.scene.drawArrow(
                tri.v2,
                tri.v2.add(tri.normal.scale(0.1)),
                0.025,
                [0, 1, 0, 1])
            
            this.director.scene.drawArrow(
                tri.v1to2Center,
                tri.v1to2Center.add(tri.v1to2Normal.scale(0.1)),
                0.025,
                [1, 1, 0, 1])
            
            this.director.scene.drawArrow(
                tri.v2to3Center,
                tri.v2to3Center.add(tri.v2to3Normal.scale(0.1)),
                0.025,
                [1, 1, 0, 1])
            
            this.director.scene.drawArrow(
                tri.v3to1Center,
                tri.v3to1Center.add(tri.v3to1Normal.scale(0.1)),
                0.025,
                [1, 1, 0, 1])
        }
    }
}