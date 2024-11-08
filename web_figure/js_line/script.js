(() => {

    window.isKeyDown = {};

    const CANVAS_WIDTH = 640;
    const CANVAS_HEIGHT = 480;
    const CANVAS_COLOR = "#F6F1EB";

    /**
     * Canvas2D API をラップしたユーティリティクラス
     * @type {Canvas2DUtility}
     */
    let util =null;
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
    let furniture = null;
    let furnitures = [];
    let walls = [];

    let isMounseDown = null;
    /**
     * @type {Position}
     */
    let startPoint = null;
    /**
     * @type {Position}
     */
    let endPoint = null;
    /**
     * @type {Position}
     */
    let moveVector = null;
    let selectedItemIndex = null;
    
    let canvasElement = document.body.querySelector('#main_canvas');

    let inputFlg = false;
    //--item--
    let applyBtn = document.body.querySelector('#apply_button');
    let inpName = document.getElementById("txtItemName");
    let inpPointX = document.getElementById("txtItemPointX");
    let inpPointY = document.getElementById("txtItemPointY");
    let inpWidth = document.getElementById("txtItemWidth");
    let inpHeight = document.getElementById("txtItemHeight");
    let inpDegree = document.getElementById("txtItemDegree");

    //--line--
    let applyBtnLine = document.body.querySelector('#apply_button_line');
    let inpNameLine =document.getElementById("txtItemName_line");
    let inpStartPointXLine = document.getElementById("txtItemStartPointX_line");
    let inpStartPointYLine = document.getElementById("txtItemStartPointY_line");
    let inpEndPointXLine = document.getElementById("txtItemEndPointX_line");
    let inpEndPointYLine = document.getElementById("txtItemEndPointY_line");
    let inpLengthLine = document.getElementById("txtItemLength_line");
    let inpDegreeLine = document.getElementById("txtItemDegree_line");

    let room = null;


    window.addEventListener('load', () => {
        util = new Canvas2DUtility(document.body.querySelector('#main_canvas'));
        canvas = util.canvas;
        ctx = util.context;
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        moveVector = new Position(0, 0);
        applyBtn = document.body.querySelector('#apply_button');

        initialize();
        render();
        
    });

    applyBtn.addEventListener('click', e => {
        console.log("apply!!")
        inputFlg = true;
        moveVector = new Position(0, 0);

        let inpName = document.getElementById("txtItemName");
        let inpPointX = document.getElementById("txtItemPointX");
        let inpPointY = document.getElementById("txtItemPointY");
        let inpWidth = document.getElementById("txtItemWidth");
        let inpHeight = document.getElementById("txtItemHeight");
        let inpDegree = document.getElementById("txtItemDegree");

        console.log(
            `name:${inpName.value}; 
            x:${inpPointX.value}; 
            y:${inpPointY.value}; 
            w:${inpWidth.value}; 
            h:${inpHeight.value};
            degree:${inpDegree.value}`);

        furnitures[selectedItemIndex].set(
            inpName.value,
            inpPointX.value,
            inpPointY.value,
            inpWidth.value,
            inpHeight.value,
            inpDegree.value
        );

        render();

        inputFlg = false;

    });
    applyBtnLine.addEventListener('click', e=> {
        
        inputFlg = true;
        moveVector = new Position(0, 0);

        furnitures[selectedItemIndex].set(
            inpNameLine.value,
            inpStartPointXLine.value,
            inpStartPointYLine.value,
            inpLengthLine.value,
            inpDegreeLine.value
        );

        render();

        inputFlg = false;
    })
    inpName.addEventListener('click', e => {
        inputFlg = true;
    });
    inpPointX.addEventListener('click', e => {
        inputFlg = true;
    });
    inpPointY.addEventListener('click', e => {
        inputFlg = true;
    });
    inpWidth.addEventListener('click', e => {
        inputFlg = true;
    });
    inpHeight
    .addEventListener('click', e => {
        inputFlg = true;
    });

    canvasElement.addEventListener('mousedown', function(e) {
        isMounseDown = false;
        
        startPoint = new Position(e.offsetX, e.offsetY);

        let c = 0;
        furnitures.map((v) => {
            let dist = v.IsTouched(startPoint);
            console.log(`mouseDown name:${v.name}, dist:${dist} middleWidth:${v.width / 2}, height:${v.height / 2}`);
            // if(dist <= v.width / 2 || dist <= v.height / 2) {
            if(v.IsTouched(startPoint)) {
                console.log(`select${v.name}`);
                isMounseDown = true;

                if(selectedItemIndex != null && selectedItemIndex !== c) {
                    furnitures[selectedItemIndex].isSelected = false;
                }
                selectedItemIndex = c;
                v.isSelected = true;

                if(v.type == "ITEM") {
                    setItemValues(furnitures[selectedItemIndex]);
                }
                else if(v.type = "LINE") {
                    setLineValues(furnitures[selectedItemIndex]);
                }
                
            }
            ++c;
        });           


        if(!isMounseDown) {
            if(selectedItemIndex != null && selectedItemIndex !== c) {
                furnitures[selectedItemIndex].isSelected = false;
                selectedItemIndex = null;
                render();
            }
        }

    });

    canvasElement.addEventListener('mousemove', function(e) {
        if(!isMounseDown) return;

        endPoint = new Position(e.offsetX, e.offsetY);
        getVector(startPoint, endPoint);
        furnitures[selectedItemIndex].setMoveVector(moveVector);
        //furnitures[selectedItemIndex].Border.setMoveVector(moveVector);

        startPoint = endPoint;

        // 恒常ループのために描画処理を再帰呼出しする
        render();
        

    });

    canvasElement.addEventListener('mouseup', function(e) {
        if(!isMounseDown) return;

        isMounseDown = false;
        endPoint = new Position(e.offsetX, e.offsetY);
        getVector(startPoint, endPoint);
        furnitures[selectedItemIndex].setMoveVector(moveVector);

        render();

    });


    lineWall = null;

    function initialize() {
        let itemCount = 1;
        //let colorCode = "#0349a6";
        let rectColorCode = "#9F312F";
        let circleColorCode = "#282C2F";
        let degree = 0;
        //room = new Room(ctx, "Room_01", canvas.width, canvas.height, 500, 400);
        // for(i = 0; i < itemCount; ++i) {
        //     furnitures[i] = new Wall(
        //         ctx,
        //         `Wall_${i}`,
        //         (50 + (i*30)),
        //         (250 + (i*10)),
        //         50,
        //         0);
        // }

        

        
    }

    function eventSetting(){
        window.addEventListener('keydown', (event) => {
            isKeyDown[`key_${event.key}`] = true;

            if(event.key === 'Enter'){
                
            }
        }, false);
        window.addEventListener('keyup', (event) => {
            isKeyDown[`key_${event.key}`] = false;
        }, false);
    }

    function render(){
        ctx.globalAlpha = 1.0;
        util.drawRect(0, 0, canvas.width, canvas.height, CANVAS_COLOR);
        
        rotatedraw();
        
        // room.draw();
        // console.log(room);

        let c = 0;
        furnitures.map((v) => {
            v.update();
            console.log(furnitures);
            ++c;
        });

        if(selectedItemIndex != null) {
            if(furnitures[selectedItemIndex].type == "ITEM") {
                setItemValues(furnitures[selectedItemIndex]);
            }
            else if(furnitures[selectedItemIndex].type == "LINE") {
                setLineValues(furnitures[selectedItemIndex]);
            }
            
        }
        else {
            setItemValues();
            setLineValues();
        }

        
    }

    function getVector(startPos, destPos) {
        let vectorX = destPos.x - startPos.x;
        let vectorY = destPos.y - startPos.y;

        moveVector.x = vectorX;
        moveVector.y = vectorY;

    }

    function setItemValues(selectedItem) {
        let itemBox = document.getElementById("item-box");
        let lineBox = document.getElementById("line-box");
        itemBox.style.display = 'block';
        lineBox.style.display = 'none';

        if(selectedItem != null) {
            inpName.value = selectedItem.name;
            inpPointX.value = selectedItem.position.x;
            inpPointY.value = selectedItem.position.y;
            inpWidth.value = selectedItem.width;
            inpHeight.value = selectedItem.height;
            inpDegree.value = selectedItem.degree;
        }
        else {
            inpName.value = "";
            inpPointX.value = "";
            inpPointY.value = "";
            inpWidth.value = "";
            inpHeight.value = "";
            inpDegree.value = "";
        }

    }
    function setLineValues(selectedItem) {
        let itemBox = document.getElementById("item-box");
        let lineBox = document.getElementById("line-box");
        itemBox.style.display = 'none';
        lineBox.style.display = 'block';

        if(selectedItem != null) {
            inpNameLine.value = selectedItem.name;
            inpStartPointXLine.value = selectedItem.startPoint.x;
            inpStartPointYLine.value = selectedItem.startPoint.y;
            inpEndPointXLine.value = selectedItem.endPoint.x;
            inpEndPointYLine.value = selectedItem.endPoint.y;
            inpLengthLine.value = selectedItem.length;
            inpDegreeLine.value = selectedItem.degree;
        }
        else {
            inpNameLine.value = "";
            inpStartPointXLine.value = "";
            inpStartPointYLine.value = "";
            inpEndPointXLine.value = "";
            inpEndPointYLine.value = "";
            inpLengthLine.value = "";
            inpDegreeLine.value = "";
        }

    }

    function rotatedraw() {
        //rotateLinedraw(50, 50, 150, 50);
        //rotateRectdraw(50, 50, 100, 100);
        dotDraw();
        rotateCircleDraw(50, 50, 50, 50);
        
    }

    function rotateLinedraw(stpX, stpY, edpX, edpY) {
        // console.log(`${stpX}, ${stpY}, ${edpX}, ${edpY}`);

        // let degree = 90;
        // let radians = degree * Math.PI / 180;
        // let len = (edpX - stpX) / 2;
        // let trsPositionX = (stpX + edpX) / 2;
        // let trsPositionY = (stpY + edpY) / 2;
        // console.log(`${trsPositionX},${trsPositionY},${len}`);

        // ctx.translate(trsPositionX, trsPositionY);
        // //this.ctx.rotate(this.angle - Math.PI * 1.5);
        // ctx.rotate(radians);
    
        // // 色が指定されている場合はスタイルを設定する
        // ctx.strokeStyle = "#000000";
        // // 線幅を設定する
        // // ctx.lineWidth = 2;
        // // パスの設定を開始することを明示する
        // ctx.beginPath();
        // // パスの始点を設定する
        // ctx.moveTo(stpX, stpY);
        // console.log(stpX*2);
        // console.log(stpY*2);
        // //this.ctx.moveTo(-Math.abs(this.endPoint.x - this.startPoint.x) / 2, 0);
        // // 直線のパスを終点座標に向けて設定する
        // ctx.lineTo(edpX, edpY);
        // console.log(edpX*2);
        // console.log(edpY*2);
        // //this.ctx.lineTo(Math.abs(this.endPoint.x - this.startPoint.x) / 2, 0);
        // // パスを閉じることを明示する
        // ctx.closePath();
        // // 設定したパスで線描画を行う
        // ctx.stroke();
    
        // ctx.translate(0, 0);
        // //this.ctx.translate(-this.position.x, -this.position.y);
        // ctx.restore();
        //===========================================================================================
        //===========================================================================================



        // let offsetX = (this.width) / 2;
        // //let offsetY = (this.LINE_WIDTH) / 2;
        // let offsetY = (this.LINE_WIDTH);
        // let midPointX = this.startPoint.x + offsetX;
        // let midPointY = this.startPoint.y + offsetY;
        // let midPoint = new Position(midPointX, midPointY); // center position

        // let adjstStartPosition = new Position(this.startPoint.x - midPoint.x, this.startPoint.y - midPoint.y);
        // let adjtEndPosition = new Position(this.endPoint.x - midPoint.x, this.endPoint.y - midPoint.y);
        
        let degree = 45;
        let radians = degree * Math.PI / 180;

        let rotatedStartPosX = stpX*(Math.cos(radians)) - stpY*(Math.sin(radians));
        let rotatedStartPosY = stpX*(Math.sin(radians)) + stpY*(Math.cos(radians));
        // let rotatedStartPosition = this.rotateCoordinates(this.startPoint, this.angle);
        // this.startPoint = rotatedStartPosition;

        let rotatedEndPosX = (edpX - stpX)*(Math.cos(radians)) - (edpY - stpY)*(Math.sin(radians)) + stpX;
        let rotatedEndPosY = (edpX - stpX)*(Math.sin(radians)) + (edpY - stpY)*(Math.cos(radians)) + stpY;
        // let rotatedEndPosition = this.rotateCoordinates(this.endPoint, this.angle);
        // this.endPoint = rotatedEndPosition;

        // 色が指定されている場合はスタイルを設定する
        ctx.strokeStyle = "#000000";
        // 線幅を設定する
        ctx.lineWidth = 2;
        // パスの設定を開始することを明示する
        ctx.beginPath();
        // パスの始点を設定する
        ctx.moveTo(stpX, stpY);
        // 直線のパスを終点座標に向けて設定する
        ctx.lineTo(rotatedEndPosX, rotatedEndPosY);
        // パスを閉じることを明示する
        ctx.closePath();
        // 設定したパスで線描画を行う
        ctx.stroke();
    }

    function rotateRectdraw(stpX, stpY, width, height) {
        let pos = new Position(stpX, stpY);

        let degree = 0;
        let radians = degree * Math.PI / 180;

        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(radians);

        let offsetX = width / 2;
        let offsetY = height / 2;
        let renderPointX = pos.x - offsetX;
        let renderPointY = pos.y - offsetY;

        ctx.fillStyle = "#000000";

        ctx.fillRect(
            -offsetX,
            -offsetY,
            width,
            height
        );
        // ctx.fillRect(
        //     renderPointX,
        //     renderPointY,
        //     width,
        //     height
        // );

        ctx.translate(0, 0);
        ctx.restore();
    }

    function rotateCircleDraw(stpX, stpY, width, height){

        // ctx.beginPath () ;

        // ctx.translate( CANVAS_WIDTH/2, CANVAS_HEIGHT/2 ) ;
        // ctx.rotate( 50 * Math.PI / 180 ) ;
        // ctx.translate( -CANVAS_WIDTH/2, -CANVAS_HEIGHT/2 ) ;

        // ctx.fillStyle = "red" ;
        // ctx.fillRect( CANVAS_WIDTH/2-100, CANVAS_HEIGHT/2-100, 100, 100 ) ;

        //======================
        let r = width / 2;

        let offsetX = width / 2;
        let offsetY = height / 2;
        let renderPointX = stpX - offsetX;
        let renderPointY = stpY - offsetY;
        // パスの設定を開始することを明示する
        ctx.beginPath();

        ctx.save();
        ctx.translate(stpX, stpY);
        ctx.rotate(45 * Math.PI / 180);

        ctx.fillStyle = "#000000";
        
        // 円のパスを設定する
        ctx.arc(
            stpX - stpX, 
            stpY - stpY, 
            r, 
            0.0, 
            Math.PI * 2.0);
        // ctx.arc(
        //     renderPointX,
        //     renderPointY,
        //     r,
        //     0.0, 
        //     Math.PI * 2.0);
        // パスを閉じることを明示する
        ctx.closePath();
        // 設定したパスで円の描画を行う
        ctx.fill();
        ctx.translate(0, 0);
        ctx.restore();
    }

    function dotDraw() {
        ctx.fillStyle = "#000000";
        
        for(i = 0; i < CANVAS_WIDTH; ++i) {
            if(i%50 == 0) {
                for(j = 0; j < CANVAS_HEIGHT; ++j) {
                    if(j%50 == 0) {
                        ctx.fillRect(
                            i,
                            j,
                            1,
                            1
                        );
                    }
                    
                }
            }
        }
    }
    
    

})();





