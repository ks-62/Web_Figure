/**
 * Position class
 */

class Position {
    /**
     * Get Vector's length
     * @param {*} x 
     * @param {*} y 
     * @returns 
     */
    static calclength(x, y) {
        return Math.sqrt(x * x + y * y);
    }

    /**
     * Get unit of vector
     * @param {*} x 
     * @param {*} y 
     */
    static calclNormal(x, y) {
        let len = Position.calcLength(x, y);
        return new Position(x / len, y / len);
    }

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    set(x, y){
        if(x != null){this.x = x}
        if(y != null){this.y = y}
    }

    /**
     * Get distance between this position and target's position
     * @param {*} target 
     * @returns 
     */
    distance(target){
        let x = this.x - target.x;
        let y = this.y - target.y;
        return Math.sqrt(x * x + y * y);
    }

    /**
     * 外積(sin)を求める ->ベクトルが上向きか下向きかがわかる
     * @param {*} target 
     * @returns 
     */
    cross(target) {
        return this.x * target.y - this.y * target.x;
    }

    /**
     * 自身を単位化(半径1の円する)したベクトルを計算して返す
     */
    normalize(){
        //calc vactor' size
        let l = Math.sqrt(this.x * this.x + this.y * this.y);
        if(l === 0) {
            return new Position(0, 0);
        }
        let x = this.x / l;
        let y = this.y / l;

        return new Position(x, y);
    }

    rotate(radian) {
        // calc sin and cos from given radian
        let s = Math.sin(radian); // sin(上下の向き)
        let c = Math.cos(radian); // cos(左右の向き)

        // 2x2の回転行列と乗算して回転させる
        this.x = this.x * c + this.y * -s;
        this.y = this.x * s + this.y * c;
    }

}

class Border {
    static OBJECT_TYPE = {
        RECTANGLE: 0,
        CIRCLE: 1,
        WALL: 2
    }

    constructor(ctx, x, y, w, h, degree, objectType) {
        this.BORDER_WIDTH = 4;
        this.CORNER_POINT_SIZE = 6;

        this.LINE_WIDTH = 4;

        this.ctx = ctx;

        this.x = x;
        this.y = y;
        this.position = new Position(
            (x - (this.BORDER_WIDTH / 2)+1), 
            (y - (this.BORDER_WIDTH / 2)+1)
        );

        this.w = w;
        this.h = h;
        this.width = w + (this.BORDER_WIDTH * 2);
        this.height = h + (this.BORDER_WIDTH * 2);
        this.lineWidth = this.LINE_WIDTH + (3);

        this.degree = degree;
        this.angle = this.degreesToRadians(degree);

        //this.color = "#ff1919";
        this.color = "#FF0000";
        //this.color = "#A1CAEA";
        this.objectType = objectType;

        if(this.objectType == Border.OBJECT_TYPE.WALL) {
            this.endPoint = new Position(this.position.x+this.width, this.position.y);
        }

        //this.corners = this.getCornerPoints();

        this.moveVector = new Position(0, 0);
    }

    set(x, y, w, h, degree) {
        if(x != null){this.position.x = (x - (this.BORDER_WIDTH / 2)+1)}
        if(y != null){this.position.y = (y - (this.BORDER_WIDTH / 2)+1)}
        if(w != null){this.width = parseInt(w, 10) + (this.BORDER_WIDTH * 2)}
        if(h != null){this.height = parseInt(h, 10) + (this.BORDER_WIDTH * 2)}
        if(degree != null){
            this.degree = degree;
            this.angle = this.degreesToRadians(degree);
        }

        if(this.objectType == Border.OBJECT_TYPE.WALL) {
            this.endPoint = new Position(this.position.x+this.width, this.position.y);
        }
    }

    degreesToRadians(degree){
        let radians = degree * Math.PI / 180;
        return radians;
    }

    setMoveVector(moveVector) {
        this.moveVector = moveVector;
    }

    getCornerPoints() {

        let offsetX = this.width / 2;
        let offsetY = this.height / 2;

        let renderPointX = this.position.x;
        let renderPointY = this.position.y;

        let leftTop = new Position(
            renderPointX, 
            renderPointY
        );

        let leftBottom = new Position(
            renderPointX, 
            (renderPointY + this.height)
        );

        let rightTop = new Position(
            (renderPointX + this.width), 
            renderPointY
        );

        let rightBottom = new Position(
            (renderPointX + this.width), 
            (renderPointY + this.height)
        );

        return [leftTop, leftBottom, rightTop, rightBottom];
    }

    getLength(startPos, endPos) {
        let len = Math.abs(
            (endPos.x - startPos.x)**2 + 
            (endPos.y - startPos.y)**2
        );

        return len;
    }

    selecting() {
        this.draw();
    }

    rotateCoordinates(refPos, rotatePos, rad) {

        let rotatedPosition = new Position(
            (rotatePos.x - refPos.x)*(Math.cos(rad)) - (rotatePos.y - refPos.y)*(Math.sin(rad)) + refPos.x,
            (rotatePos.x - refPos.x)*(Math.sin(rad)) + (rotatePos.y - refPos.y)*(Math.cos(rad)) + refPos.y
        );

        return rotatedPosition;
    }

    draw() {

        if(this.objectType === Border.OBJECT_TYPE.RECTANGLE) {
            this.ctx.save();
            this.ctx.translate(this.position.x, this.position.y);
            this.ctx.rotate(this.angle);

            let offsetX = this.width / 2;
            let offsetY = this.height / 2;

            this.ctx.fillStyle = this.color;
            this.ctx.fillRect(
                -offsetX,
                -offsetY,
                this.width,
                this.height
            );

            this.ctx.translate(0, 0);
            this.ctx.restore();
        }
        else if(this.objectType === Border.OBJECT_TYPE.CIRCLE) {

            let offsetX = this.width / 2;
    
            this.ctx.save();
            this.ctx.translate(this.position.x, this.position.y);
            this.ctx.rotate(this.angle);

            let borderRadius = offsetX + (this.BORDER_WIDTH-2);
    
            if(this.color != null){
                this.ctx.fillStyle = this.color;
            } 
    
            // パスの設定を開始することを明示する
            this.ctx.beginPath();
            this.ctx.arc(
                0,
                0,
                borderRadius,
                0.0, 
                Math.PI * 2.0);
            // パスを閉じることを明示する
            this.ctx.closePath();
            // 設定したパスで円の描画を行う
            this.ctx.fill();
            this.ctx.translate(0, 0);
            this.ctx.restore();
        }
        else if(this.objectType === Border.OBJECT_TYPE.WALL) {

            let initialEndPoint = new Position(this.position.x + this.width, this.position.y);
            let rotatedEndPoint = this.rotateCoordinates(this.position, initialEndPoint, this.angle);


            // 色が指定されている場合はスタイルを設定する
            this.ctx.strokeStyle = this.color;
            // 線幅を設定する
            this.ctx.lineWidth = this.lineWidth;
            // パスの設定を開始することを明示する
            this.ctx.beginPath();
            // パスの始点を設定する
            this.ctx.moveTo(this.position.x, this.position.y);
            // 直線のパスを終点座標に向けて設定する
            this.ctx.lineTo(rotatedEndPoint.x, rotatedEndPoint.y);
            // パスを閉じることを明示する
            this.ctx.closePath();
            // 設定したパスで線描画を行う
            this.ctx.stroke();

        }
    }
}

/**
 * Item class
 */
class Item {

    constructor(ctx, name, x, y, w, h, color, degree) {
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = ctx;
        this.type = "ITEM";
        this.name = name;
        this.position = new Position(x, y);
        this.vector = new Position(0.0, -1.0);
        /**
         * @type {number}
         */
        //this.angle = 270 * Math.PI / 180;
        /**
         * @type {number}
         */
        this.width = w;
        /**
         * @type {number}
         */
        this.height = h;
        this.color = color;
        this.degree = degree;

        this.offsetX = this.width / 2;
        this.offsetY = this.height / 2;
        this.renderPointX = this.position.x - this.offsetX;
        this.renderPointY = this.position.y - this.offsetY;


        this.angle = this.degreesToRadians(degree);
        this.ready = false;

        this.isSelected = false;
        this.borderRectW = this.width+4;
        this.borderRectH = this.height+4;        

        this.topLeft = new Position(x, y);
        this.topRight = new Position(x+w, y);
        this.bottomLeft = new Position(x, y+h);
        this.bottomRight = new Position(x+w, y+h);

    }

    setVector(x, y) {
        this.vector.set(x, y);
    }

    set() {}
    // set(name, x, y, w, h){
    //     if(name != null){this.name = name}
    //     if(x != null){this.position.x = x}
    //     if(y != null){this.position.y = y}
    //     if(w != null){this.width = w}
    //     if(h != null){this.height = h}
    //     this.Border.set(x, y, w, h);

    //     console.log(this);
    // }

    setVectorFromAngle(angle) {
        this.angle = angle;
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);

        this.vector.set(cos, sin);
    }

    degreesToRadians(degree){
        let radians = degree * Math.PI / 180;
        return radians;
    }

    getCrossProduct(a, b) {
        return a.x * b.y - a.y * b.x;
    }

    pointInCheck(X,Y,W,H,PX,PY){
        var a = getCrossProduct(-W,0,PX-W-X,PY-Y);
        var b = getCrossProduct(0,H,PX-X,PY-Y);
        var c = getCrossProduct(W,0,PX-X,PY-Y-H);
        var d = getCrossProduct(0,-H,PX-W-X,PY-H-Y);

        if(a<0&
            b<0&
            c<0&
            d<0) {
            return true;
        }
        else {
            return false;
        }
        
    }

    // draw() {
    //     this.offsetX = this.width / 2;
    //     this.offsetY = this.height / 2;

    //     this.renderPointX = this.position.x - this.offsetX;
    //     this.renderPointY = this.position.y - this.offsetY;

    //     if(this.isSelected) {
    //         this.border.selecting();
    //     }

    //     if(this.color != null){
    //         this.ctx.fillStyle = this.color;
    //     }

    //     this.ctx.fillRect(
    //         this.renderPointX,
    //         this.renderPointY,
    //         this.width,
    //         this.height
    //     );
    // }

    // rotationDraw() {

    //     if(this.isSelected) {
    //         this.border.selecting();
    //     }

    //     this.ctx.save();
    //     this.ctx.translate(this.position.x, this.position.y);
    //     //this.ctx.rotate(this.angle - Math.PI * 1.5);
    //     this.ctx.rotate(this.angle);

    //     this.offsetX = this.width / 2;
    //     this.offsetY = this.height / 2;
    //     this.renderPointX = this.position.x - this.offsetX;
    //     this.renderPointY = this.position.y - this.offsetY;

    //     if(this.color != null){
    //         this.ctx.fillStyle = this.color;
    //     } 

    //     this.ctx.fillRect(
    //         -this.offsetX,
    //         -this.offsetY,
    //         this.width,
    //         this.height
    //     );

    //     this.ctx.translate(0, 0);

    //     this.ctx.restore();
    // }

    

}

/**
 * Rectangle class
 */
class Rectangle extends Item {

    constructor(ctx, name, x, y, w, h, color, angle) {
        super(ctx, name, x, y, w, h, color, angle);
        this.OBJECT_TYPE = Border.OBJECT_TYPE.RECTANGLE;

        this.border = new Border(this.ctx, this.position.x, this.position.y, this.width, this.height, this.degree, Border.OBJECT_TYPE.RECTANGLE);

        //this.type = 'default';
        this.frame = 0;
        this.movingDistance = 3;

        this.moveVector = null;

    }

    set(name, x, y, w, h, degree){
        if(name != null){this.name = name}
        if(x != null){this.position.x = parseInt(x, 10)}
        if(y != null){this.position.y = parseInt(y, 10)}
        if(w != null){this.width = parseInt(w, 10)}
        if(h != null){this.height = parseInt(h, 10)}
        if(degree != null){
            this.degree = parseInt(degree, 10);
            this.angle = this.degreesToRadians(this.degree)
        }
        this.border.set(
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height, 
            this.degree);

    }

    // set(x, y) {
    //     this.position.set(x, y);
    //     //this.type = type;
    //     //this.frame = 0;
    // }

    setMoveVector(moveVector) {
        this.moveVector = moveVector;
    }

    IsTouched(target) {
        let psAa = new Position(-this.width, 0);
        let psAb = new Position(target.x - this.width - this.renderPointX, target.y - this.renderPointY);
        var a = this.getCrossProduct(psAa, psAb);

        let psBa = new Position(0, this.height);
        let psBb = new Position(target.x - this.renderPointX, target.y - this.renderPointY);
        var b = this.getCrossProduct(psBa, psBb);

        let psCa = new Position(this.width, 0);
        let psCb = new Position(target.x - this.renderPointX, target.y - this.renderPointY - this.height);
        var c = this.getCrossProduct(psCa, psCb);

        let psDa = new Position(0,  - this.height);
        let psDb = new Position(target.x - this.width - this.renderPointX, target.y - this.height - this.renderPointY);
        var d = this.getCrossProduct(psDa, psDb);
        console.log(this.position);
        console.log(a, b, c, d);

        if(a<0&
            b<0&
            c<0&
            d<0) {
            return true;
        }
        else {
            return false;
        }

        // if(target.x > this.topLeft.x &&
        //     target.x < this.topRight.x &&
        //     target.y < this.bottomLeft.y &&
        //     target.y < this.bottomRight.y){
        //     return true;
        // }
        // else {
        //     return false;
        // }
    }

    draw() {
        
        if(this.isSelected) {
            this.border.selecting();
        }

        this.ctx.save();
        this.ctx.translate(this.position.x, this.position.y);
        this.ctx.rotate(this.angle);

        this.offsetX = this.width / 2;
        this.offsetY = this.height / 2;
        this.renderPointX = this.position.x - this.offsetX;
        this.renderPointY = this.position.y - this.offsetY;

        if(this.color != null){
            this.ctx.fillStyle = this.color;
        } 

        this.ctx.fillRect(
            -this.offsetX,
            -this.offsetY,
            this.width,
            this.height
        );

        this.ctx.translate(0, 0);

        this.ctx.restore();
    }

    update() {

        if(this.isSelected) {
            let updatedX = parseInt(this.position.x, 10) + parseInt(this.moveVector.x, 10);
            let updatedY = parseInt(this.position.y, 10) + parseInt(this.moveVector.y, 10);
            
            this.position.x = updatedX;
            this.position.y = updatedY;

            this.border.position.x += parseInt(this.moveVector.x, 10);
            this.border.position.y += parseInt(this.moveVector.y, 10);
        }

        this.draw();

        //++this.frame();

    }

}

/**
 * Circle class
 */
class Circle extends Item {
    constructor(ctx, name, x, y, w, h, color, degree) {
        super(ctx, name, x, y, w, h, color, degree);
        this.radius = w / 2;

        this.OBJECT_TYPE = Border.OBJECT_TYPE.CIRCLE;

        this.border = new Border(this.ctx, this.position.x, this.position.y, this.width, this.height, this.degree, Border.OBJECT_TYPE.CIRCLE);

        //this.type = 'default';
        this.frame = 0;
        this.movingDistance = 3;

        this.moveVector = null;

    }

    set(name, x, y, w, h, degree){
        if(name != null){this.name = name}
        if(x != null){this.position.x = parseInt(x, 10)}
        if(y != null){this.position.y = parseInt(y, 10)}
        if(w != null){this.width = parseInt(w, 10)}
        if(h != null){this.height = parseInt(h, 10)}
        if(degree != null){
            this.degree = parseInt(degree, 10);
            this.angle = this.degreesToRadians(this.degree)
        }

        this.radius = this.width / 2;

        this.border.set(
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height, 
            this.degree);

    }

    setMoveVector(moveVector) {
        this.moveVector = moveVector;
    }

    IsTouched(target) {
        let x = this.position.x - target.x;
        let y = this.position.y - target.y;
        let dist = Math.sqrt(x * x + y * y);

        if(dist <= this.radius) {
            return true;
        }
        else {
            return false;
        }
    }

    draw() {

        if(this.isSelected) {
            this.border.selecting();
        }

        this.ctx.save();
        this.ctx.translate(this.position.x, this.position.y);
        this.ctx.rotate(this.angle);

        if(this.color != null){
            this.ctx.fillStyle = this.color;
        } 

        // パスの設定を開始することを明示する
        this.ctx.beginPath();
        // 円のパスを設定する
        this.ctx.arc(
            0,
            0,
            this.radius,
            0.0, 
            Math.PI * 2.0);
        // パスを閉じることを明示する
        this.ctx.closePath();
        // 設定したパスで円の描画を行う
        this.ctx.fill();
        this.ctx.translate(0, 0);
        this.ctx.restore();
    }

    update() {

        if(this.isSelected) {
            let updatedX = parseInt(this.position.x, 10) + parseInt(this.moveVector.x, 10);
            let updatedY = parseInt(this.position.y, 10) + parseInt(this.moveVector.y, 10);
            
            this.position.x = updatedX;
            this.position.y = updatedY;

            this.border.position.x += parseInt(this.moveVector.x, 10);
            this.border.position.y += parseInt(this.moveVector.y, 10);
        }

        this.draw();       

        //++this.frame();

    }
}

/**
 * Line
 */
class Line {
    constructor(ctx, name, startX, startY, length, degree) {
        this.LINE_WIDTH = 4;

        this.ctx = ctx;
        this.name = name;
        this.startPoint = new Position(startX, startY);
        this.initialEndPoint = new Position(0, 0);
        this.endPoint = new Position(0, 0);

        this.width = length;
        this.height = this.LINE_WIDTH;
        this.degree = degree;
        this.angle = this.degreesToRadians(degree);

        this.setPositions(startX, startY, length, this.angle);

        this.defColor = "#D2C7AC";

    }

    setPositions(startX, startY, length, rad) {
        this.length = length;
        this.startPoint.x = parseInt(startX, 10);
        this.startPoint.y = parseInt(startY, 10);
        this.initialEndPoint.x = parseInt(startX, 10) + parseInt(length, 10);
        this.initialEndPoint.y = parseInt(startY, 10);

        let rotatedEndPosition = this.rotateCoordinates(this.startPoint, this.initialEndPoint, rad);
        this.endPoint = rotatedEndPosition;

        this.position = this.startPoint;
    }

    getLength(startPos, endPos) {
        let len = Math.abs(
            (endPos.x - startPos.x)**2 + 
            (endPos.y - startPos.y)**2
        );

        return len;
    }

    rotateCoordinates(refPos, rotatePos, rad) {

        let rotatedPosition = new Position(
            (rotatePos.x - refPos.x)*(Math.cos(rad)) - (rotatePos.y - refPos.y)*(Math.sin(rad)) + refPos.x,
            (rotatePos.x - refPos.x)*(Math.sin(rad)) + (rotatePos.y - refPos.y)*(Math.cos(rad)) + refPos.y
        );

        return rotatedPosition;
    }

    setVectorFromAngle(angle) {
        this.angle = angle;
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);

        this.vector.set(cos, sin);
    }

    degreesToRadians(degree){
        let radians = degree * Math.PI / 180;
        return radians;
    }

    getVector(a, b) {
        return new Position(b.x - a.x, b.y - a.y);
    }
    getCrossProduct(a, b) {
        return a.x * b.y - a.y * b.x;
    }
    getDotProduct(a, b) {
        return a.x * b.x + a.y * b.y;
    }
    IsPosintOnTheLine(startPoint, endPoint, targetPoint) {
        let vectorStoT = this.getVector(startPoint, targetPoint);
        //if(Math.abs(Math.round(vectorStoT.y)) <= this.LINE_WIDTH) vectorStoT.y = 0;

        let vectorStoE = this.getVector(startPoint, endPoint);
        //if(Math.abs(Math.round(vectorStoE.y)) <= this.LINE_WIDTH) vectorStoE.y = 0;

        let dotProduct = this.getCrossProduct(vectorStoT, vectorStoE);
        console.log(`StoT:${vectorStoT.x},${vectorStoT.y} StoE:${vectorStoE.x},${vectorStoE.y}`);
        console.log(`target:${targetPoint.x},${targetPoint.y}`);
        console.log(`dotProduct:${dotProduct}`);
        if(Math.abs(Math.round(dotProduct)) <= this.length) {
            if(targetPoint.x >= startPoint.x && targetPoint.x <= endPoint.x) {
                return true;
            }
        }
        else {
            return false;
        }
        
    }

    IsTouched(target) {

        if(this.IsPosintOnTheLine(this.startPoint, this.endPoint, target)){
            return true;
        }
        else {
            return false;
        }
    }
}

/**
 * Wall
 */
class Wall extends Line {
    constructor(ctx, name, startX, startY, length, degree) {
        super(ctx, name, startX, startY, length, degree);

        this.OBJECT_TYPE = Border.OBJECT_TYPE.WALL;
        this.border = new Border(this.ctx, this.startPoint.x, this.startPoint.y, this.width, this.height, this.degree, Border.OBJECT_TYPE.WALL);

        //this.type = 'default';
        this.frame = 0;
        this.movingDistance = 3;

        this.moveVector = null;

    }

    set(name, startX, startY, length, degree){
        if(name != null){this.name = name}
        if(startX != null){this.startPoint.x = parseInt(startX, 10);}
        if(startY != null){this.startPoint.y = parseInt(startY, 10);}
        if(length != null){this.length = parseInt(length, 10);}
        if(degree != null){
            this.degree = parseInt(degree, 10);
            this.angle = this.degreesToRadians(this.degree);
        }

        this.width = this.length;

        this.setPositions(this.startPoint.x, this.startPoint.y, this.length);

        this.border = new Border(this.ctx, this.startPoint.x, this.startPoint.y, this.length, this.height, this.degree, this.OBJECT_TYPE);

        
    }

    setMoveVector(moveVector) {
        this.moveVector = moveVector;
    }

    draw(){
        if(this.isSelected) {
            this.border.selecting();
        }

        // 色が指定されている場合はスタイルを設定する
        this.ctx.strokeStyle = this.defColor;
        // 線幅を設定する
        this.ctx.lineWidth = this.LINE_WIDTH;
        // パスの設定を開始することを明示する
        this.ctx.beginPath();
        // パスの始点を設定する
        this.ctx.moveTo(this.startPoint.x, this.startPoint.y);
        // 直線のパスを終点座標に向けて設定する
        this.ctx.lineTo(this.endPoint.x, this.endPoint.y);
        // パスを閉じることを明示する
        this.ctx.closePath();
        // 設定したパスで線描画を行う
        this.ctx.stroke();
    }

    update() {

        if(this.isSelected) {

            let updatedStartX = parseInt(this.startPoint.x, 10) + parseInt(this.moveVector.x, 10);
            let updatedStartY = parseInt(this.startPoint.y, 10) + parseInt(this.moveVector.y, 10);
            
            this.startPoint.x = updatedStartX;
            this.startPoint.y = updatedStartY;
            this.initialEndPoint = new Position(
                parseInt(updatedStartX, 10)+parseInt(this.length, 10), 
                parseInt(updatedStartY, 10)
            );

            let rotatedEndPosition = this.rotateCoordinates(this.startPoint, this.initialEndPoint, this.angle);
            this.endPoint = rotatedEndPosition;

            this.border.position.x = parseInt(this.startPoint.x, 10);
            this.border.position.y = parseInt(this.startPoint.y, 10);
            // this.border.endPoint = new Position(this.border.position.x+this.border.width, this.border.position.y);
            // this.border.endPoint = new Position(this.endPoint.x, this.endPoint.y);
            this.border.endPoint.x = this.endPoint.x;
            this.border.endPoint.y = this.endPoint.y;
        }

        this.draw();

        //++this.frame();

    }
}
