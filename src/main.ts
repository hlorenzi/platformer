import { Director } from "./director"


main()


function main()
{
    const director = new Director()

    const render = () =>
    {
        director.process()
        director.render()
    }

    window.addEventListener("keydown", (ev) =>
    {
        director.keysHeld.add(ev.key.toLowerCase())
    })

    window.addEventListener("keyup", (ev) =>
    {
        director.keysHeld.delete(ev.key.toLowerCase())
    })

    renderLoop(render)
}


function renderLoop(fn: () => void)
{
    fn()
    //setTimeout(() => renderLoop(fn), 500)
    window.requestAnimationFrame(() => renderLoop(fn))
}