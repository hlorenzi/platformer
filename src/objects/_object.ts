import { Director } from "../director"
import Vec3 from "../math/vec3"


export class Object
{
    director!: Director
    position: Vec3 = new Vec3(0, 0, 0)
    scale: Vec3 = new Vec3(1, 1, 1)


    init()
    {

    }


    process()
    {
        
    }


    render()
    {

    }
}