(() => {

    window.isKeyDown = {};

    const CANVAS_WIDTH = 640;
    const CANVAS_HEIGHT = 480;
    const CANVAS_BASE_COLOR = "#ffffff";
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
    // let inpEndPointXLine = document.getElementById("txtItemEndPointX_line");
    // let inpEndPointYLine = document.getElementById("txtItemEndPointY_line");
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
        inputFlg = true;
        moveVector = new Position(0, 0);

        let inpName = document.getElementById("txtItemName");
        let inpPointX = document.getElementById("txtItemPointX");
        let inpPointY = document.getElementById("txtItemPointY");
        let inpWidth = document.getElementById("txtItemWidth");
        let inpHeight = document.getElementById("txtItemHeight");
        let inpDegree = document.getElementById("txtItemDegree");

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
        let itemCount = 9;
        //let colorCode = "#0349a6";
        let rectColorCode = "#9F312F";
        let circleColorCode = "#282C2F";
        let degree = 0;

        for(i = 0; i < itemCount; ++i) {
            if(i < 3) {
                furnitures[i] = new Rectangle(
                    ctx, 
                    `Rectangle_${i}`, 
                    (50 + (i*70)), 
                    (50 + (i*20)), 
                    70, 
                    40, 
                    rectColorCode, 
                    degree);
            }
            else if(i == 4) {
                furnitures[i] = new Circle(
                    ctx, 
                    `Circle_${i}`, 
                    (50 + (i*70)), 
                    (50 + (i*20)), 
                    70, 
                    70, 
                    circleColorCode, 
                    0);
            }
            else {
                furnitures[i] = new Wall(
                    ctx,
                    `Wall_${i}`,
                    (50 + (i*30)),
                    (250 + (i*10)),
                    50,
                    0);
            }
        }

        
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
        util.drawRect(0, 0, canvas.width, canvas.height, CANVAS_BASE_COLOR);

        for(i = 0; i < CANVAS_WIDTH; ++i) {
            if(i%20 == 0) {
                ctx.strokeStyle = CANVAS_COLOR;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, CANVAS_HEIGHT);
                ctx.closePath();
                ctx.stroke();
            }
        }
        for(j = 0; j < CANVAS_HEIGHT; ++j) {
            if(j%20 == 0) {
                ctx.strokeStyle = CANVAS_COLOR;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, j);
                ctx.lineTo(CANVAS_WIDTH, j);
                ctx.closePath();
                ctx.stroke();
            }
        }
        

        let c = 0;
        furnitures.map((v) => {
            v.update();
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
            // inpEndPointXLine.value = selectedItem.endPoint.x;
            // inpEndPointYLine.value = selectedItem.endPoint.y;
            inpLengthLine.value = selectedItem.length;
            inpDegreeLine.value = selectedItem.degree;
        }
        else {
            inpNameLine.value = "";
            inpStartPointXLine.value = "";
            inpStartPointYLine.value = "";
            // inpEndPointXLine.value = "";
            // inpEndPointYLine.value = "";
            inpLengthLine.value = "";
            inpDegreeLine.value = "";
        }

    }

    

})();