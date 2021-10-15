import { Scene } from "./gl/scene"
import Mat4 from "./math/mat4"
import Vec3 from "./math/vec3"
import { Object } from "./objects/_object"
import { Kart } from "./objects/kart"
import { Player } from "./objects/player"
import { Camera } from "./objects/camera"
import { Stage1 } from "./objects/stage1"
import { Test } from "./objects/test"
import { ObjLoader } from "./util/objLoader"
import { Stage } from "./objects/stage"


export class Director
{
    canvas: HTMLCanvasElement
    canvasW: number
    canvasH: number
    gl: WebGLRenderingContext
    scene: Scene

    keysDown: Set<string>
    keysHeld: Set<string>
    keysHeldPrev: Set<string>

    objects: Object[]


    constructor()
    {
        this.canvas = document.getElementById("canvasMain")! as HTMLCanvasElement
        this.canvasW = this.canvasH = 0
        this.resize()

        this.gl = this.canvas.getContext("webgl", { stencil: true })!
        this.scene = new Scene(this.gl)

        this.keysDown = new Set<string>()
        this.keysHeld = new Set<string>()
        this.keysHeldPrev = new Set<string>()

        this.objects = []

        this.init()
    }


    resize()
    {
        const rect = this.canvas.getBoundingClientRect()
        this.canvasW = rect.width
        this.canvasH = rect.height
        this.canvas.width = rect.width
        this.canvas.height = rect.height
    }


    async init()
    {
        const trackFile = await fetch("assets/track.obj").then(t => t.arrayBuffer())
        const trackModel = ObjLoader.makeModelBuilder(trackFile)

        this.objects = []

        const player = new Kart()
        this.objectAdd(player)

        const camera = new Camera()
        camera.position = new Vec3(2, 4, -4)
        this.objectAdd(camera)

        const stage = new Stage()
        stage.setModel(this.gl, trackModel)
        this.objectAdd(stage)

        const test = new Test()
        test.position = new Vec3(0, 0, -1.25)
        //this.objectAdd(test)
    }


    objectAdd(object: Object)
    {
        object.director = this
        object.init()
        this.objects.push(object)
    }


    objectDestroy(object: Object)
    {
        this.objects = this.objects.filter(obj => obj !== object)
    }


    objectFind<T extends Object>(typ: new () => T)
    {
        for (const object of this.objects)
        {
            if (object instanceof typ)
                return object
        }

        return null
    }


    objectWith<T extends Object>(typ: new () => T, fn: (object: T) => void)
    {
        for (const object of this.objects)
        {
            if (object instanceof typ)
            {
                fn(object as T)
            }
        }
    }


    process()
    {
        this.keysDown.clear()
        for (const key of this.keysHeld)
        {
            if (!this.keysHeldPrev.has(key))
                this.keysDown.add(key)
        }

        if (this.keysDown.has("t"))
        {
            const kart = this.objectFind(Kart)
            const player = this.objectFind(Player)
            const test = this.objectFind(Test)

            if (kart)
            {
                this.objectDestroy(kart)

                const newPlayer = new Player()
                newPlayer.position = new Vec3(0, 0, -1.25)
                this.objectAdd(newPlayer)
            }
            else if (player)
            {
                this.objectDestroy(player)

                const newTest = new Test()
                newTest.position = new Vec3(0, 0, -1.25)
                this.objectAdd(newTest)
            }
            else if (test)
            {
                this.objectDestroy(test)

                const newKart = new Kart()
                this.objectAdd(newKart)
            }
        }

        for (const object of this.objects)
            object.process()

        this.keysHeldPrev.clear()
        for (const key of this.keysHeld)
            this.keysHeldPrev.add(key)
    }


    render()
    {    
        this.scene.begin()
        this.scene.viewport(0, 0, this.canvasW, this.canvasH)
        this.scene.clear(0, 0, 0, 1, 1)

        this.objectWith(Camera, (c) => c.setMatrices())

        for (const object of this.objects)
            object.render()
    }
}