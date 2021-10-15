import { Director } from "../director"
import { Object } from "./_object"
import { Camera } from "./camera"
import ModelBuilder from "../util/modelBuilder"
import CollisionMesh from "../util/collisionMesh"
import Vec3 from "../math/vec3"
import * as Geometry from "../math/geometry"
import { Stage1 } from "./stage1"
import GfxModel from "../gl/model"


export class Sphere 
{
    director!: Director
    model!: GfxModel
    id: number = 0
    pos: Vec3 = new Vec3(0, 0, 0)
    posPrev: Vec3 = new Vec3(0, 0, 0)
    speed: Vec3 = new Vec3(0, 0, 0)
    instantSpeed: Vec3 = new Vec3(0, 0, 0)
    radius: number = 0.15
    touchingGround: boolean = false


    init(director: Director)
    {
        this.director = director

        const builder = new ModelBuilder()
        builder.addSphere(-1, -1, -1, 1, 1, 1)
        builder.calculateNormals()

        this.model = builder.makeModel(this.director.gl)
    }


    processGravity()
    {
        this.speed = this.speed.add(new Vec3(0, 0, 0.0025))
    }


    processCollision(collision: CollisionMesh)
    {
        this.touchingGround = false
        this.posPrev = this.pos

        const posPlusGravity = this.pos.add(new Vec3(0, 0, this.speed.z))
        const solvedGravity = collision.repel(
            this.pos,
            posPlusGravity,
            this.radius)

        this.pos = solvedGravity.position

        const solved = collision.repelAndSlide(
            this.pos,
            this.pos.add(this.speed.withZ(0)),
            this.radius)

        this.pos = solved.position
        this.speed = this.pos.sub(this.posPrev)

        if (this.instantSpeed.magn() != 0)
        {
            const solvedInstant = collision.repel(
                this.pos,
                this.pos.add(this.instantSpeed),
                this.radius)
                
            this.pos = solvedInstant.position
        }

        this.instantSpeed = new Vec3(0, 0, 0)
        

        const groundCheckDist = 0.1

        const solvedGroundTest = collision.repel(
            this.pos,
            this.pos.add(new Vec3(0, 0, this.radius + groundCheckDist)),
            this.radius)
            
        if (solvedGroundTest.position.z <= this.pos.z + groundCheckDist)
            this.touchingGround = true

        if (false)//(this.id == 0)
        {
            console.log(
                solvedGroundTest.position.z.toFixed(3),
                (this.pos.z + groundCheckDist).toFixed(3),
                this.touchingGround)
        }
    }


    render()
    {
        this.director.scene.pushTranslationScale(
            this.pos,
            new Vec3(this.radius, this.radius, this.radius))
            
        this.director.scene.drawModel(
            this.model,
            this.director.scene.materialColor,
            [1, 1, this.touchingGround ? 1 : 0, 1])

        this.director.scene.popTranslationScale()
    }
}