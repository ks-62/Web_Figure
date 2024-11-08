(() => {

    /**
     * 描画対象となる Canvas Element
     * @type {HTMLCanvasElement}
     */
    let canvas = null;
    /**
     * Canvas2D API のコンテキスト
     * @type {CanvasRenderingContext2D}
     */
    let ctx = null;

    /**
     * @type {Image}
     */
    let image = null;

    window.addEventListener('load', () => {
        imageLoader('./image/color.jpg', (loadedImage) => {
            image = loadedImage;
            initialize();
            render();
        });
    }, false);

    function initialize() {
        canvas = document.body.querySelector('#main_canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx = canvas.getContext('2d');
    }

    function render() {
        const POINT_COUNT = 5;
        let points = [];
        for(let i = 0; i < POINT_COUNT; ++i) {
            points.push(generateRandomInt(300), generateRandomInt(300));
        }

        // drawPolygon(points, '#119900');

        // drawCircle(500, 200, 25, '#119900');

        // let startRadian = Math.random() * Math.PI * 2.0;
        // let endRadian = Math.random() * Math.PI * 2.0;
        // drawFan(600, 100, 100, startRadian, endRadian, '#110099');

        // drawQuadraticBezier(
        //     100, 100, //StartPoint
        //     100, 300, // End Point
        //     300, 200, //制御点
        //     '#ff9900'
        // );
        // drawCubicBezier(
        //     300, 100, //StartPoint
        //     300, 300, //EndPoint
        //     500, 0, //始点の制御点
        //     500, 400, //終点の制御点
        //     '#ff9900'
        // );

        // ctx.drawImage(image, 100, 100);
        // ctx.drawImage(image, 300, 100, 200, 200);
        // ctx.drawImage(image, 16, 16, 96, 96, 100, 300, 50, 50);

        ctx.shadowBlur = 5;
        ctx.shadowColor = '#666666';
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        ctx.font ='bold 30px cursive';
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'start';
        drawText('Graphics Programming', 100, 100, '#ff00aa', 150);

    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {number} color 
     */
    function drawRect(x, y, width, height, color) {
        if(color != null) {
            ctx.fillStyle = color;
        }
        ctx.fillRect(x, y, width, height);
    }

    function drawLine(x1, y1, x2, y2, color, width = 1) {
        if(color != null) {
            ctx.strokeStyle = color;
        }

        ctx.lineWidth = width;
        ctx.beginPath(); // start setting of line
        ctx.moveTo(x1, y1); //start's point cordinate
        ctx.lineTo(x2, y2); //destination of the line
        ctx.closePath();
        ctx.stroke();
    }

    function drawCircle(x, y, radius, color) {
        if(color != null) {
            ctx.fillStyle = color;
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0.0, Math.PI*2.0);
        ctx.closePath();
        ctx.fill();
    }

    function drawFan(x, y, radius, startRadian, endRadian, color) {
        if(color != null) {
            ctx.fillStyle = color;
        }

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, radius, startRadian, endRadian);
        ctx.closePath();
        ctx.fill();
    }

    function drawPolygon(points, color) {
        if(Array.isArray(points) !== true || points.length < 6) {
            return;
        }

        if(color != null) {
            ctx.fillStyle = color;
        }

        ctx.beginPath();
        ctx.moveTo(points[0], points[1]);
        for(let i = 2; i < points.length; i += 2){
            ctx.lineTo(points[i], points[i + 1]);
        }

        ctx.closePath();
        ctx.fill();
    }

    function drawQuadraticBezier(x1, y1, x2, y2, cx, cy, color, width = 1) {
        if(color != null) {
            ctx.strokeStyle = color;
        }

        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cx, cy, x2, y2);
        ctx.closePath();
        ctx.stroke();
    }

    function drawCubicBezier(x1, y1, x2, y2, cx1, cy1, cx2, cy2, color, width = 1) {
        if(color != null) {
            ctx.strokeStyle = color;
        }

        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
        ctx.closePath();
        ctx.stroke();
    }

    function drawText(text, x, y, color, width) {
        if(color != null) {
            ctx.fillStyle = color;
        }
        ctx.fillText(text, x, y, width);
    }

    function imageLoader(path, callback) {
        let target = new Image();
        target.addEventListener('load', () => {
            if(callback != null) {
                callback(target);
            }
        }, false);
        target.src = path;
    }

    function generateRandomInt(range) {
        let random = Math.random();
        return Math.floor(random * range);
    }


})();


