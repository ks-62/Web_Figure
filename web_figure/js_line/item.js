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
        this.BORDER_WIDTH = 3;
        this.CORNER_POINT_SIZE = 6;

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

    selecting() {
        if(this.degree == 0) {
            this.draw();
        }
        else {
            console.log(`border position:${this.position.x}, ${this.position.y}`);
            this.rotationDraw();
        }
    }

    draw() {
        //Draw border
        let offsetX = this.width / 2;
        let offsetY = this.height / 2;

        let renderPointX = this.position.x - offsetX;
        let renderPointY = this.position.y - offsetY;

        if(this.objectType === Border.OBJECT_TYPE.RECTANGLE) {
            this.ctx.fillStyle = this.color;
            this.ctx.fillRect(
                renderPointX,
                renderPointY,
                this.width,
                this.height
            );
        }
        else if(this.objectType === Border.OBJECT_TYPE.CIRCLE) {
            console.log("circle is selected");
            let borderRadius = offsetX + (this.BORDER_WIDTH-2);
            this.ctx.fillStyle = this.color;
            // パスの設定を開始することを明示する
            this.ctx.beginPath();
            // 円のパスを設定する
            this.ctx.arc(this.position.x, this.position.y, borderRadius, 0.0, Math.PI * 2.0);
            console.log(`draw: x:${renderPointX},y:${renderPointY},r:${borderRadius}`);
            // パスを閉じることを明示する
            this.ctx.closePath();
            // 設定したパスで円の描画を行う
            this.ctx.fill();
        }
        else if(this.objectType === Border.OBJECT_TYPE.WALL) {
            console.log("wall is selected");
            // 色が指定されている場合はスタイルを設定する
            this.ctx.strokeStyle = this.color;
            // 線幅を設定する
            this.ctx.lineWidth = 9;
            // パスの設定を開始することを明示する
            this.ctx.beginPath();
            // パスの始点を設定する
            this.ctx.moveTo(this.position.x-2, this.position.y);
            // 直線のパスを終点座標に向けて設定する
            this.ctx.lineTo(this.endPoint.x-2, this.endPoint.y);
            // パスを閉じることを明示する
            this.ctx.closePath();
            // 設定したパスで線描画を行う
            this.ctx.stroke();
        }

        


        // let cnOffsetX = this.CORNER_POINT_SIZE / 2;
        // let cnOffsetY = this.CORNER_POINT_SIZE / 2;
        
        // if(this.objectType == Border.OBJECT_TYPE.LINE) {
        //     let startPoint = new Position(this.x, this.y);
        //     let endPoint = new Position(startPoint.x - this.w, startPoint.y - this.y);

        //     this.ctx.fillStyle = this.color;
        //     this.ctx.fillRect(
        //         startPoint.x,
        //         startPoint.y,
        //         10,
        //         10
        //     );
        //     this.ctx.fillRect(
        //         endPoint.x,
        //         endPoint.y,
        //         10,
        //         10
        //     );

        // }
    }

    rotateCoordinates(pos, rad) {

        let rotatedPosition = new Position(
            pos.x*(Math.cos(rad)) - pos.y*(Math.sin(rad)),
            pos.x*(Math.sin(rad)) + pos.y*(Math.cos(rad))
        );

        return rotatedPosition;
    }

    rotationDraw() {

        if(this.objectType === Border.OBJECT_TYPE.RECTANGLE) {
            this.ctx.save();
            this.ctx.translate(this.position.x, this.position.y);
            //this.ctx.rotate(this.angle - Math.PI * 1.5);
            this.ctx.rotate(this.angle);

            let offsetX = this.width / 2;
            let offsetY = this.height / 2;

            let renderPointX = this.position.x - offsetX;
            let renderPointY = this.position.y - offsetY;

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
            this.ctx.save();
            this.ctx.translate(this.position.x, this.position.y);
            this.ctx.rotate(this.angle);

            let borderRadius = offsetX + (this.BORDER_WIDTH-2);
            this.ctx.fillStyle = this.color;
            // パスの設定を開始することを明示する
            this.ctx.beginPath();
            // 円のパスを設定する
            this.ctx.arc(this.position.x, this.position.y, borderRadius, 0.0, Math.PI * 2.0);
            console.log(`draw: x:${renderPointX},y:${renderPointY},r:${borderRadius}`);
            // パスを閉じることを明示する
            this.ctx.closePath();
            // 設定したパスで円の描画を行う
            this.ctx.fill();

            this.ctx.translate(0, 0);
            this.ctx.restore();
        }
        else if(this.objectType === Border.OBJECT_TYPE.WALL) {
            console.log("wall is selected");
            // this.ctx.save();
            // this.ctx.translate(this.position.x, this.position.y);
            // this.ctx.rotate(this.angle);

            let rotatedStartPosition = this.rotateCoordinates(this.position, this.angle);
            this.startPoint = rotatedStartPosition;
            let rotatedEndPosition = this.rotateCoordinates(this.endPoint, this.angle);
            this.endPoint = rotatedEndPosition;
            
            // 色が指定されている場合はスタイルを設定する
            this.ctx.strokeStyle = this.color;
            // 線幅を設定する
            this.ctx.lineWidth = 9;
            // パスの設定を開始することを明示する
            this.ctx.beginPath();
            // パスの始点を設定する
            this.ctx.moveTo(this.position.x-2, this.position.y);
            // 直線のパスを終点座標に向けて設定する
            this.ctx.lineTo(this.endPoint.x-2, this.endPoint.y);
            // パスを閉じることを明示する
            this.ctx.closePath();
            // 設定したパスで線描画を行う
            this.ctx.stroke();

            // this.ctx.translate(0, 0);
            // this.ctx.restore();
        }
    }
}



/**
 * Line
 */
class Line {
    constructor(ctx, name, startX, startY, length, degree) {
        this.LINE_WIDTH = 5;

        this.ctx = ctx;
        this.name = name;
        this.startPoint = new Position(0, 0);
        this.endPoint = new Position(0, 0);

        this.setPositions(startX, startY, length);

        this.width = length;
        this.height = this.LINE_WIDTH;
        this.degree = degree;
        this.angle = this.degreesToRadians(degree);

        this.defColor = "#D2C7AC";
        

    }

    setPositions(startX, startY, length) {
        this.length = length;
        this.startPoint.x = parseInt(startX, 10);
        this.startPoint.y = parseInt(startY, 10)
        this.endPoint.x = parseInt(startX, 10) + parseInt(length, 10);
        this.endPoint.y = parseInt(startY, 10);

        // let offsetX = (this.width) / 2;
        // let offsetY = (this.LINE_WIDTH) / 2;
        // let midPointX = this.startPoint.x - offsetX;
        // let midPointY = this.startPoint.y - offsetY;
        //this.position = new Position(midPointX, midPointY); // center position
        this.position = this.startPoint;
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

    IsTouched(target) {

        let vectorStoT = this.getVector(this.startPoint, target);
        if(Math.abs(vectorStoT.y) <= this.LINE_WIDTH) vectorStoT.y = 0;

        let vectorStoE = this.getVector(this.startPoint, this.endPoint);
        if(Math.abs(vectorStoE.y) <= this.LINE_WIDTH) vectorStoE.y = 0;

        let dotProduct = this.getCrossProduct(vectorStoT, vectorStoE);

        if(dotProduct == 0){
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

        this.border = new Border(this.ctx, this.startPoint.x, this.startPoint.y, this.width, this.height, this.degree, this.OBJECT_TYPE);

        
    }

    setMoveVector(moveVector) {
        this.moveVector = moveVector;
    }

    rotateCoordinates(pos, rad) {

        let rotatedPosition = new Position(
            pos.x*(Math.cos(rad)) - pos.y*(Math.sin(rad)),
            pos.x*(Math.sin(rad)) + pos.y*(Math.cos(rad))
        );

        return rotatedPosition;
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

    rotationDraw() {

        if(this.isSelected) {
            this.border.selecting();
        }

        this.ctx.save();

        this.ctx.translate(this.startPoint.x, this.startPoint.y);
        console.log(`rotate startPosition X: ${this.startPoint.x}`);
        console.log(`rotate startPosition Y: ${this.startPoint.y}`);
        console.log(`angle: ${this.angle}`);
        console.log(`degree: ${this.degree}`);

        this.offsetX = this.length / 2;
        this.renderStartPointX = this.startPoint.x - this.offsetX;
        this.renderEndPointX = this.endPoint.x - this.offsetX;


        this.ctx.translate(this.startPoint.x, this.startPoint.y);
        //this.ctx.rotate(this.angle - Math.PI * 1.5);
        this.ctx.rotate(this.angle);

        // 色が指定されている場合はスタイルを設定する
        this.ctx.strokeStyle = this.color;
        // 線幅を設定する
        this.ctx.lineWidth = this.LINE_WIDTH;
        // パスの設定を開始することを明示する
        this.ctx.beginPath();
        // パスの始点を設定する
        this.ctx.moveTo(this.startPoint, this.startPoint.y);
        //this.ctx.moveTo(-Math.abs(this.endPoint.x - this.startPoint.x) / 2, 0);
        // 直線のパスを終点座標に向けて設定する
        this.ctx.lineTo(this.startPoint, this.endPoint.y);
        //this.ctx.lineTo(Math.abs(this.endPoint.x - this.startPoint.x) / 2, 0);
        // パスを閉じることを明示する
        this.ctx.closePath();
        // 設定したパスで線描画を行う
        this.ctx.stroke();

        this.ctx.translate(0, 0);
        //this.ctx.translate(-this.position.x, -this.position.y);
        this.ctx.restore();

    }

    update() {

        if(this.isSelected) {

            let updatedStartX = parseInt(this.startPoint.x, 10) + parseInt(this.moveVector.x, 10);
            let updatedStartY = parseInt(this.startPoint.y, 10) + parseInt(this.moveVector.y, 10);
            
            this.startPoint.x = updatedStartX;
            this.startPoint.y = updatedStartY;
            this.endPoint = new Position(
                parseInt(updatedStartX, 10)+parseInt(this.length, 10), 
                parseInt(updatedStartY, 10)
            );

            let rotatedStartPosition = this.rotateCoordinates(this.startPoint, this.angle);
            this.startPoint = rotatedStartPosition;

            let rotatedEndPosition = this.rotateCoordinates(this.endPoint, this.angle);
            this.endPoint = rotatedEndPosition;

            this.border.position.x += parseInt(this.moveVector.x, 10);
            this.border.position.y += parseInt(this.moveVector.y, 10);
            this.border.endPoint = new Position(this.border.position.x+this.border.width, this.border.position.y);
        }
        
        if(this.degree === 0) {
            this.draw();
        }
        else {
            console.log(this.name);
            this.rotationDraw();
        }

    }
}
