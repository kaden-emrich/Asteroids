class Entity {
    constructor(shape, color, type, maxVelocity) {
        if(maxVelocity > velocityLimit) maxVelocity = velocityLimit;
        this.maxVelocity = maxVelocity;

        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.dir = 0;
        this.speedVector = new Vector(this.dir, 0);
        this.color = color;
        this.type = type;
        this.rollOverDist = 30;

        this.id = -1;

        for(let e in entities) {
            if(entities[e] == null) {
                this.id = e;
                break;
            }
        }
        
        if(this.id == -1) {
            this.id = entities.length;
        }
        
        entities[this.id] = this;

        this.shape = shape;

        this.standardDeviation = this.shape.getStandardPointDeviation();
        this.maxDeviation = this.shape.getMaxPointDeviation();
    }// constructor()

    getPolarPoints() {
        var pPoints = [];
        for(let i = 0; i < this.shape.points.length; i++) {
            var r = this.shape.points[i].r;
            var dir = this.shape.points[i].dir + this.dir;
            pPoints[i] = new PolarPoint(r, dir);
        }
        return pPoints;
    }// getPolarPoints()

    getPoints() {
        var pPoints = this.getPolarPoints();
        var rPoints = [];
        for(let i = 0; i < pPoints.length; i++) {
            var x = this.x + pPoints[i].r * Math.cos(pPoints[i].dir * Math.PI / 180);
            var y = this.y + pPoints[i].r * Math.sin(pPoints[i].dir * Math.PI / 180);

            rPoints[i] = new PointValue(x, y);
        }

        return rPoints;
    }// getRectPoints()

    getBoundingBox() {
        var points = this.getPoints();

        var xMin = points[0].x;
        var xMax = points[0].x;
        var yMin = points[0].y;
        var yMax = points[0].y;

        for(let i = 1; i < points.length; i++) {
            if(points[i].x < xMin)
                xMin = points[i].x;
            if(points[i].x > xMax)
                xMax = points[i].x;
            if(points[i].y < yMin)
                yMin = points[i].y;
            if(points[i].y > yMax)
                yMax = points[i].y;
        }

        var bBox = [
            new PointValue(xMin, yMin),
            new PointValue(xMax, yMin),
            new PointValue(xMax, yMax),
            new PointValue(xMin, yMax)
        ];

        return bBox;
    }// getBoundingBox()

    addSpeedVector(otherVector) {
        this.speedVector = this.speedVector.add(otherVector);
    }// addSpeedVector(otherVector)

    getAbsSpeed() {
        return this.speedVector.mag;
    }// getAbsSpeed()
    
    changeDir(amount) {
        this.dir += amount;
        this.draw;
    }// changeDir(amount)

    turnLeft() {
        this.changeDir(0 - turnSpeed);
    }// turnLeft() 
    turnRight() {
        this.changeDir(turnSpeed);
    }// turnRight()

    forward(speed) {
        this.addSpeedVector(new Vector(this.dir*Math.PI/180, speed));
        if(this.speedVector.mag > this.maxVelocity) {
            this.speedVector.mag = this.maxVelocity;
        }
    }// forward(speed)

    updatePosition() {
        if(this.speedVector.mag > this.maxVelocity) {
            this.speedVector.mag = this.maxVelocity;
        }
        else if(this.speedVector.mag < 0-this.maxVelocity) {
            this.speedVector.mag = 0 - this.maxVelocity;
        }

        this.x += this.speedVector.x;
        this.y += this.speedVector.y;

        
        // off screen roll-over
        if(this.x < 0-this.rollOverDist) {
            this.x = canvas.width + this.rollOverDist;
        }
        if(this.x > canvas.width + this.rollOverDist) {
            this.x = 0-this.rollOverDist;
        }
        if(this.y < 0-this.rollOverDist) {
            this.y = canvas.height + this.rollOverDist;
        }
        if(this.y > canvas.height + this.rollOverDist) {
            this.y = 0-this.rollOverDist;
        }
    }// updatePosition()

    async draw() {
        await this.shape.draw(this.x, this.y, this.dir, this.color);

        if(showVelocity) {
            ctx.strokeStyle = "#00f";
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.speedVector.x*10, this.y);
            ctx.stroke();
    
            ctx.strokeStyle = "#f00";
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + this.speedVector.y*20);
            ctx.stroke();
        }

        if(showStandardDeviation) {
            this.drawStandardDeviation();
        }

        if(showMaxDeviation) {
            this.drawMaxDeviation();
        }

        return;
    }// draw()*/

    drawWrap() {
        this.shape.draw(this.x, this.y, this.dir, this.color);

        var bb = this.getBoundingBox();

        if(bb[0].x < 0) {
            this.shape.draw(this.x + canvas.width, this.y, this.dir, this.color);
        }
        if(bb[0].y < 0) {
            this.shape.draw(this.x, this.y + canvas.height, this.dir, this.color);
        }
        if(bb[2].x > canvas.width) {
            this.shape.draw(this.x - canvas.width, this.y, this.dir, this.color);
        }
        if(bb[2].y > canvas.height) {
            this.shape.draw(this.x, this.y - canvas.height, this.dir, this.color);
        }

        if(showVelocity) {
            ctx.globalAlpha = 0.5;
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#00f";
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.speedVector.x*10, this.y);
            ctx.stroke();
    
            ctx.strokeStyle = "#f00";
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + this.speedVector.y*20);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }

    drawBoundingBox() {
        var bBox = this.getBoundingBox();

        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = boundingBoxColor;
        ctx.shadowStyle = boundingBoxColor;
        ctx.shadowBlur = 0;
        
        ctx.beginPath();
        ctx.moveTo(bBox[0].x, bBox[0].y);
        for(let i = 1; i < bBox.length; i++) {
            ctx.lineTo(bBox[i].x, bBox[i].y);   
        }
        ctx.closePath();
        ctx.stroke();
        
        ctx.globalAlpha = 1;
    }// drawBoundingBox()

    drawStandardDeviation() {
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = standardDeviationColor;
        ctx.shadowStyle = standardDeviationColor;
        ctx.shadowBlur = 0;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.standardDeviation, 0, 2 * Math.PI);
        ctx.stroke();
        
        ctx.globalAlpha = 1;
    }// drawStandardDiviation()

    drawMaxDeviation() {
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = maxDeviationColor;
        ctx.shadowStyle = maxDeviationColor;
        ctx.shadowBlur = 0;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.maxDeviation, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.globalAlpha = 1;
    }// drawMaxDeviation()

    checkDistanceColision(e2) {
        var dist = new Line(new PointValue(this.x, this.y), new PointValue(e2.x, e2.y)).getLength();
        if(dist <= this.maxDeviation + e2.maxDeviation) {
            return true;
        }
        return false;
    }// checkDistanceCollision()

    checkAllDistColision() {
        let colisions = [];

        for(let i = 0; i < entities.length; i++) {
            if(entities[i] != null && i != this.id && this.checkDistanceColision(entities[i])) {
                colisions[colisions.length] = entities[i];
            }
        }

        return colisions;
    }// checkAllDistColision()

    boxIsTouching(e2) {
        var objectA = this.getBoundingBox();
        var objectB = e2.getBoundingBox();

        if(
            this.type != e2.type &&
            objectA[1].x >= objectB[0].x &&
            objectA[0].x <= objectB[1].x &&
            objectA[2].y >= objectB[0].y &&
            objectA[0].y <= objectB[2].y
        ) {
            return true; 
        }
        return false;
    }// boxIsTouching(e2)

    checkBoxColision() {
        for(let i = 0; i < entities.length; i++) {
            if(entities[i] != null && i != this.id) {
                var objectA = this.getBoundingBox();
                var objectB = entities[i].getBoundingBox();

                if(
                    objectA[1].x >= objectB[0].x &&
                    objectA[0].x <= objectB[1].x &&
                    objectA[2].y >= objectB[0].y &&
                    objectA[0].y <= objectB[2].y &&
                    this.type != entities[i].type
                ) {
                    return entities[i]; 
                }
            }
        }

        return null;
    }// checkBoxColision()

    isTouching(e2) {
        // get bounding total bounding box
        var xMin = this.getBoundingBox()[0].x;
        // this entity
        for(let i = 1; i < this.getBoundingBox().length; i++) {
            if(this.getBoundingBox()[i].x < xMin)
                xMin = this.getBoundingBox()[i].x;
        }

        // other entity
        for(let i = 1; i < e2.getBoundingBox().length; i++) {
            if(e2.getBoundingBox()[i].x < xMin)
                xMin = e2.getBoundingBox()[i].x;
        }
        
        // do line colision
        var numIntersects = 0;
        for(let i = 0; i < this.getPoints().length; i++) {
            let tpoint = this.getPoints()[i];
            numIntersects = 0;
            for(let j = 0; j < e2.getPoints().length; j++) {
                var line1 = new Line(tpoint, new PointValue(xMin - 5, tpoint.y));
                var line2;
                if(j == e2.getPoints().length - 1) 
                    line2 = new Line(e2.getPoints()[j], e2.getPoints()[0]);
                else
                    line2 = new Line(e2.getPoints()[j], e2.getPoints()[j+1]);

                if(line1.intersects(line2)) {
                    numIntersects++;
                }
            }
            
            if(numIntersects != 0 && numIntersects % 2 != 0) return true;
        }

        return false;
    }// isTouching(e2)

    checkLineColision() {
        for(let i = 0; i < entities.length; i++) {
            if(entities[i] != null && i != this.id) {
                if(this.isTouching(entities[i])) return entities[i];
            }
        }

        return null;
    }// checkLineColision()

    kill() {
        entities[this.id] = null;
    }// kill()

    
}// class Entity