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
}// line

class Shape {
    constructor(points) {
        this.points = [];
        for(let i = 0; i < points.length; i++) {
            this.points[i] = points[i];
        }
    }// constructor(points)

    draw(x, y, dir, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = color;

        ctx.beginPath();

        ctx.moveTo(x + this.points[0].r * Math.cos((this.points[0].dir + dir) * (Math.PI / 180)), y + this.points[0].r * Math.sin((this.points[0].dir + dir) * (Math.PI / 180)));
        for(let i = 1; i < this.points.length; i++) {
            ctx.lineTo(x + this.points[i].r * Math.cos((this.points[i].dir + dir) * (Math.PI / 180)), y + this.points[i].r * Math.sin((this.points[i].dir + dir) * (Math.PI / 180)));
        }

        ctx.closePath();

        ctx.stroke();
    }// draw()

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