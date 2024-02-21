// Kaden Emrich

class PointValue {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }// constructor(x, y)

    getPolar() {
        var r = Math.sqrt((this.x*this.x) + (this.y*this.y));
        var dir;
        if(this.x == 0) {
            if(this.y > 0) {
                dir = 90;
            }
            else {
                dir = -90;
            }
        }
        else if(this.x > 0)
            dir = Math.atan(this.y / this.x) * (180 / Math.PI);
        else {
            dir = Math.atan(this.y / this.x) * (180 / Math.PI) + 180;
        }

        return new PolarPoint(r, dir);
    }// getPolar()

    // getCanvasPosition() {
    //     var newX = this.x / spaceWidth * canvas.clientWidth;
    //     var newY = this.y / spaceHeight * canvas.clientHeight;
    // }
}// class PointValue

relMousePos = new PointValue(0, 0)

class PolarPoint {
    constructor(r, dir) {
        this.r = r;
        this.dir = dir;
    }// constructor(r, dir)

    getRect() {
        var x = this.r * Math.cos(this.dir * Math.PI / 180);
        var y = this.r * Math.sin(this.dir * Math.PI / 180);
        return new PointValue(x, y);
    }// getRect()
}// class PolarPoint

class Vector {
    constructor(dir, mag) { // dir in radians, mag in units
        if(mag < 0) dir += Math.PI;
        if(dir > Math.PI*2 || dir < 0-(Math.PI*2)) dir = dir % (Math.PI * 2)
        if(dir < 0) dir = (Math.PI*2) + dir;

        this.dir = dir;
        this.mag = Math.abs(mag);
    }// constructor

    get x() {
        return this.mag * Math.cos(this.dir);
    }// get x

    get y() {
        return this.mag * Math.sin(this.dir);
    }// get y

    add(otherVector) {
        let xTotal = this.x + otherVector.x;
        let yTotal = this.y + otherVector.y;

        let magTotal = Math.sqrt(Math.pow(otherVector.x + this.x, 2) + Math.pow(otherVector.y + this.y, 2));

        let dirTotal;

        if(xTotal == 0) {
            if(yTotal > 0) dirTotal = Math.PI/2;
            else if(yTotal < 0) dirTotal = 0-Math.PI/2;
            else dirTotal = 0;
        }
        else if(xTotal < 0) dirTotal = Math.atan(yTotal / xTotal) + Math.PI;
        else dirTotal = Math.atan(yTotal / xTotal);

        return new Vector(dirTotal, magTotal);
    }// add(otherVector)

    static fromRect(x, y) {
        let d;
        let m = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

        if(x < 0) d = Math.atan(y / x) + Math.PI;
        else d = Math.atan(y / x);

        return new Vector(d, m);
    }// fromRect(x, y)
}// class Vector

class Line {
    constructor(p1, p2) {
        this.point1 = p1;
        this.point2 = p2;
    }// constructor(p1, p2)

    getOrentation(p, q, r) {
        var exp = (q.y - p.y)*(r.x - q.x) - (q.x - p.x)*(r.y - q.y);
        if(exp > 0) return 1;
        else if(exp < 0) return -1;
        else return 0;
    }// getOrentation(p, q, r)

    intersects(line2) { // I think this works. Probably???
        var a1 = this.point1;
        var b1 = this.point2;
        var a2 = line2.point1;
        var b2 = line2.point2;

        if(
        this.getOrentation(a1, b1, a2) != this.getOrentation(a1, b1, b2) &&
        this.getOrentation(a2, b2, a1) != this.getOrentation(a2, b2, b1)
        ) return true;

        else return false;
    }// intersects(line2)

    getLength() {
        return Math.sqrt(Math.pow(this.point1.x - this.point2.x, 2) + Math.pow(this.point1.y - this.point2.y, 2));
    }// getLength()
}// line

class Shape {
    constructor(points) {
        this.points = [];
        for(let i = 0; i < points.length; i++) {
            this.points[i] = points[i];
        }
    }// constructor(points)

    getStandardPointDeviation() {
        var totalPointDeviation = 0;
        for(let p of this.points) {
            totalPointDeviation += new Line(new PointValue(0, 0), p.getRect()).getLength();
        }

        return totalPointDeviation / this.points.length;
    }// getStandardPointDeviation()

    getMaxPointDeviation() {
        var maxPointDeviation = 0;
        for(let p of this.points) {
            let dist = new Line(new PointValue(0, 0), p.getRect()).getLength();
            if(dist > maxPointDeviation) {
                maxPointDeviation = dist;
            }
        }

        return maxPointDeviation;
    }// getMaxPointDeviation()

    async draw(x, y, dir, color, alpha = 1.0) {
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        // ctx.shadowColor = color;
        // ctx.shadowBlur = 10;

        await ctx.beginPath();

        let pointX = Math.floor(x + this.points[0].r * Math.cos((this.points[0].dir + dir) * (Math.PI / 180)));
        let pointY = Math.floor(y + this.points[0].r * Math.sin((this.points[0].dir + dir) * (Math.PI / 180)));

        await ctx.moveTo(pointX * spaceScale, pointY * spaceScale);

        for(let i = 1; i < this.points.length; i++) {
            pointX = Math.floor(x + this.points[i].r * Math.cos((this.points[i].dir + dir) * (Math.PI / 180)));
            pointY = Math.floor(y + this.points[i].r * Math.sin((this.points[i].dir + dir) * (Math.PI / 180)));

            await ctx.lineTo(pointX * spaceScale, pointY * spaceScale);
        }

        await ctx.closePath();

        await ctx.stroke();

        ctx.globalAlpha = 1.0;
        return;
    }// draw()

    async fill(x, y, dir, color, alpha = 1.0) {
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        // ctx.shadowColor = color;
        // ctx.shadowBlur = 10;

        await ctx.beginPath();

        let pointX = Math.floor(x + this.points[0].r * Math.cos((this.points[0].dir + dir) * (Math.PI / 180)));
        let pointY = Math.floor(y + this.points[0].r * Math.sin((this.points[0].dir + dir) * (Math.PI / 180)));

        await ctx.moveTo(pointX, pointY);

        for(let i = 1; i < this.points.length; i++) {
            pointX = Math.floor(x + this.points[i].r * Math.cos((this.points[i].dir + dir) * (Math.PI / 180)));
            pointY = Math.floor(y + this.points[i].r * Math.sin((this.points[i].dir + dir) * (Math.PI / 180)));

            await ctx.lineTo(pointX, pointY);
        }

        await ctx.closePath();

        await ctx.fill();

        ctx.globalAlpha = 1.0;
        return;
    }// fill()

    // drawWrap(x, y, dir, color) {
    //     ctx.fillStyle = color;
    //     ctx.strokeStyle = color;

    //     ctx.beginPath();

    //     var dxPos = x + this.points[0].r * Math.cos((this.points[0].dir + dir) * (Math.PI / 180));
    //     var dyPos = y + this.points[0].r * Math.sin((this.points[0].dir + dir) * (Math.PI / 180));

    //     if(dxPos > canvas.width) dxPos -= canvas.width;
    //     else if(dxPos < 0) dxPos += canvas.width;

    //     if(dyPos > canvas.height) dyPos -= canvas.height;
    //     else if(dyPos < 0) dyPos += canvas.height;

    //     ctx.moveTo(dxPos, dyPos);
    //     for(let i = 1; i < this.points.length; i++) {
    //         var dxPos = x + this.points[i].r * Math.cos((this.points[i].dir + dir) * (Math.PI / 180));
    //         var dyPos = y + this.points[i].r * Math.sin((this.points[i].dir + dir) * (Math.PI / 180));

    //         ctx.lineTo(dxPos, dyPos);

    //         if(dxPos > canvas.width) this.drawWrap(x - canvas.width, y, dir, color);
    //         else if(dxPos < 0) this.drawWrap(x + canvas.width, y, dir, color);

    //         if(dyPos > canvas.height) this.drawWrap(x, y - canvas.height, dir, color);
    //         else if(dyPos < 0) this.drawWrap(x, y + canvas.height, y, dir, color);
    //     }

    //     ctx.closePath();

    //     ctx.stroke();
    // }// draw()
}// class Shape

var starShape = new Shape([
    new PointValue(3, 0).getPolar(),
    new PointValue(0, 0).getPolar(),
    new PointValue(0, 3).getPolar(),
    new PointValue(3, 3).getPolar()
]);

var twinkeStarShape = new Shape([
    new PointValue(3, 0).getPolar(),
    new PointValue(1, -1).getPolar(),
    new PointValue(0, -3).getPolar(),
    new PointValue(-1, -1).getPolar(),
    new PointValue(-3, 0).getPolar(),
    new PointValue(-1, 1).getPolar(),
    new PointValue(0, 3).getPolar(),
    new PointValue(1, 1).getPolar()
]);
