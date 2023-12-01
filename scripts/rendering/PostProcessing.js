// Kaden Emrich

function prepareImageData(data) {
    data.getPixel = function(x, y) {
        var i = (x+y*this.width)*4;
        return {
            r: this.data[i],
            g: this.data[i+1],
            b: this.data[i+2],
            a: this.data[i+3]
        };
    };
    data.setPixel = function(x, y, pixel) {
        var i = (x+y*this.width)*4;
        this.data[i] = pixel.r;
        this.data[i+1] = pixel.g;
        this.data[i+2] = pixel.b;
        this.data[i+3] = pixel.a;
    };
}

function redTest(iData) {
    for(var x = 0; x < iData.width; x++) {
        for(var y = 0; y < iData.height; y++) {
            var last = iData.getPixel(x, y);
            iData.setPixel(x, y, {
                r: last.r,
                g: last.g,
                b: last.b,
                a: last.a
            });
        }
    }
}

function testRenderer(ctx) {
    let width = ctx.canvas.width;
    let height = ctx.canvas.height;

    let iData = ctx.createImageData(width, height);
    prepareImageData(iData);

    //console.log(iData);

    //redTest(iData);

    ctx.putImageData(iData, 0, 0);
}
