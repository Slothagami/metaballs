//#region Canvas Setup
var canvas, c, fps
window.onload = () => {
    canvas = document.querySelector("canvas")
    c = canvas.getContext("2d")

    resize()
    window.addEventListener("resize", resize)

    fps = 20
    setInterval(main, 1000 / fps)
    init()
}

function resize() {
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
}
//#endregion
const cos = Math.cos
const sin = Math.sin
const pow = Math.pow
const sqrt = Math.sqrt

const precision = 6
const balls     = 10
var   threshold = .25

var instances = [], points = []
function init() {
    let maxRad = 150
    for(let i = 0; i < balls; i++) {
        instances.push(new Metaball(
            randRange(maxRad, canvas.width  - maxRad),
            randRange(maxRad, canvas.height - maxRad),
            Math.random() * 10 + 1
        ))
    }

    window.addEventListener("keydown", e => {
        if(e.key == "=") threshold *= 1.05
        if(e.key == "-") threshold /= 1.05
    })
}

function main() {
    c.clearRect(0,0, canvas.width,canvas.height)
    marchingSquares()
    for(let inst of instances) inst.update()

}

//#region Functions
class Metaball {
    constructor(x, y, radius) {
        this.x = x
        this.y = y
        this.radius = radius

        let an = Math.random() * Math.PI * 2,
            sp = Math.random() * 6 + 4

        this.hsp = cos(an) * sp
        this.vsp = sin(an) * sp
    }

    calc(x, y) {
        return this.radius / Math.hypot(this.x - x, this.y - y)
    }

    update() {
        this.x += this.hsp 
        this.y += this.vsp 

        // collisions with edge
        if(outsideRange(this.x + Math.sign(this.hsp) * this.radius, 0, canvas.width))
            this.hsp *= -1
        if(outsideRange(this.y + Math.sign(this.vsp) * this.radius, 0, canvas.height))
            this.vsp *= -1
    }
}

function outsideRange(x, min, max) {
    return x < min || x > max
}

function marchingSquares() {
    let grd = precision
    for(let x = 0; x < canvas.width; x += grd) {
        for(let y = 0; y < canvas.height; y += grd) {
            corners = getCorners(x, y, grd)
            drawCell(corners, x, y, grd)
        }
    }
}

function drawCell(corners, x, y, grd) {
    // Check for every corner at once first
    let cornersHit = corners.reduce((a,b) => a + b)
    if(cornersHit == 0 || cornersHit == 4) return

    c.fillStyle = `hsl(${x},60%,50%)`
    // c.fillStyle = "green"
    c.fillRect(x, y, grd, grd)
}

function getCorners(x, y, grd) {
    pts = [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
    ]

    corners = []
    for(let pt of pts) {
        sum = 0

        for(let inst of instances)
            sum += inst.calc(x + grd * pt[0], y + grd * pt[1])

        corners.push(sum > threshold)
    }
    return corners
}

function randRange(min, max) {
    return Math.random() * (max - min) + min
}
//#endregion