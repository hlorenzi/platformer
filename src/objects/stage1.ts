import { Director } from "../director"
import { Object } from "./_object"
import ModelBuilder from "../util/modelBuilder"
import GLModel from "../gl/model"
import CollisionMesh from "../util/collisionMesh"
import Vec3 from "../math/vec3"


export class Stage1 extends Object
{
    model!: GLModel
    collision!: CollisionMesh


    init()
    {
        const builder = new ModelBuilder()
        builder.addQuad(
            new Vec3(-10, -10, 0),
            new Vec3( 10, -10, 0),
            new Vec3( 10,  10, 0),
            new Vec3(-10,  10, 0))
        builder.addCube(-5, -5, -1, -2, -2, 1)
        builder.addCube(-7, -5, -2, -5, -2, 1)
        builder.addQuad(
            new Vec3(-2, -5, -1),
            new Vec3( 0, -5, 0),
            new Vec3( 0, -2, 0),
            new Vec3(-2, -2, -1))

        builder.addTri(
            new Vec3( 0, -2, -0.5),
            new Vec3( 2, -1, -0.75),
            new Vec3( 1,  2, -0.5))
        builder.addTri(
            new Vec3( 2, -1, -0.75),
            new Vec3( 2,  2, -0.25),
            new Vec3( 1,  2, -0.5))
        builder.calculateNormals()

        this.model = builder.makeModel(this.director.gl)
        this.collision = builder.makeCollision()
    }


    render()
    {
        this.director.scene.pushTranslationScale(this.position, this.scale)

        this.director.scene.drawModel(
            this.model,
            this.director.scene.materialColor,
            [0.1, 0.75, 1, 1])

        this.director.scene.popTranslationScale()

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