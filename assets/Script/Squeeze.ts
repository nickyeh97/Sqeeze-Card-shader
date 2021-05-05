
const { ccclass, property} = cc._decorator;

@ccclass
export class DragonTigerSqueeze extends cc.Component {

    @property({
        tooltip: "咪牌觸控區",
        type: cc.Node
    })
    touchLayer: cc.Node = null;

    @property({
        tooltip: "牌背元件",
        type: cc.Node
    })
    cardBgNode: cc.Node = null;

    @property({
        tooltip: "牌花色元件",
        type: cc.Node
    })
    cardColorNode: cc.Node = null;

    @property({
        tooltip: "陰影元件",
        type: cc.Node
    })
    shadowNode: cc.Node = null;

    @property({
        tooltip: "手指右上",
        type: cc.Node
    })
    symmetry1Node: cc.Node = null;

    @property({
        tooltip: "手指左下",
        type: cc.Node
    })
    symmetry2Node: cc.Node = null;

    @property({
        tooltip: "手指右下",
        type: cc.Node
    })
    symmetry3Node: cc.Node = null;

    @property({
        tooltip: "手指左上",
        type: cc.Node
    })
    symmetry4Node: cc.Node = null;

    @property({
        tooltip: "觸發點右上",
        type: cc.Node
    })
    number1Node: cc.Node = null;

    @property({
        tooltip: "觸發點左下",
        type: cc.Node
    })
    number2Node: cc.Node = null;

    @property({
        tooltip: "觸發點右下",
        type: cc.Node
    })
    number3Node: cc.Node = null;

    @property({
        tooltip: "觸發點左上",
        type: cc.Node
    })
    number4Node: cc.Node = null;

    @property({
        tooltip: "牌結果",
        type: cc.Node
    })
    cardFaceNode: cc.Node = null;

    protected boxRect: cc.Rect;
    // 終點
    protected movePos: { x: number; y: number; };
    // 起點
    protected initPos: any;
    protected touchPos: cc.Vec2 = cc.v2(0, 0);
    /**
     * 卡背材質
     */
    protected cardBgMaterial: cc.Material = null;
    /**
     * 牌花色材質
     */
    protected cardColorMaterial: cc.Material = null;

    protected isLeftTopStart: boolean = false;
    protected isRightBottomStart: boolean = false;
    protected isTouch = false;
    
    protected limitRotation: number = 0;
    protected syncTime = 0.2;

    start() {
        cc.dynamicAtlasManager.enabled = false;
        this.cardBgMaterial = this.cardBgNode.getComponent(cc.Sprite).sharedMaterials[0];
        this.cardColorMaterial = this.cardColorNode.getComponent(cc.Sprite).sharedMaterials[0];
        this.boxRect = this.cardBgNode.getBoundingBoxToWorld();
        this.cardBgMaterial.setProperty('sprWidth', this.boxRect.width);
        this.cardBgMaterial.setProperty('sprHight', this.boxRect.height);
        this.cardColorMaterial.setProperty('worldPos', cc.v2(this.boxRect.x, this.boxRect.y));
        this.cardColorMaterial.setProperty('sprWidth', this.boxRect.width);
        this.cardColorMaterial.setProperty('sprHight', this.boxRect.height);
        this.resetSqueeze();
        this.initSetData();
        this.squeezeTouchEvent();
    }

    /**
     * 關閉咪牌介面
     */
    public closeSqueeze() {
        this.node.active = false
        this.touchLayer.off(cc.Node.EventType.TOUCH_START);
        this.touchLayer.off(cc.Node.EventType.TOUCH_MOVE);
        this.touchLayer.off(cc.Node.EventType.TOUCH_END);
        this.touchLayer.off(cc.Node.EventType.TOUCH_CANCEL);
    }

    /**
     * 開牌
     */
    public openPai() {        
        // 咪牌初始化
        this.isTouch = false;
        this.debugClear();
        this.initSetData();
        this.cardFaceNode.active = true;
    }

    resetSqueeze() {
        // 關閉咪牌的結果牌
        this.cardFaceNode.active = false;
        
        this.isLeftTopStart = false;
        this.isRightBottomStart = false;
    }

    /**
     * 咪牌觸控監聽
     */
    squeezeTouchEvent() {
        let self = this;

        let touchBegan = function (event) {
            self.touchPos = event.getLocation();
        }
        this.touchLayer.on(cc.Node.EventType.TOUCH_START, touchBegan);

        let touchMove = function (event) {
            event.stopPropagation();
            //cc.log(">>>>>>>>touchMove:",event.getLocation())
            let pos = event.getLocation();
            let disRect = { x: self.touchPos.x - self.boxRect.x, y: self.touchPos.y - self.boxRect.y };

            self.movePos = { x: pos.x - self.boxRect.x, y: pos.y - self.boxRect.y };
            if (self.cardFaceNode.active) {
                return;
            }
            //牌必須從旁邊開始翻,中间不允许翻牌
            if (self.initPos) {
                self.setMovePos(pos);
                self.setXY(self.initPos, self.movePos);
                self.isTouch = true;
            } else {
                let ds = 50;
                let boxRect = new cc.Rect(self.boxRect.x, self.boxRect.y, self.boxRect.width, self.boxRect.height);
                // 起點為 (boxRect.x + ds, boxRect.y + ds,)
                boxRect.x = boxRect.x + ds;
                boxRect.y = boxRect.y + ds;
                // 中間範圍 boxRect 為各邊往內縮 ds
                boxRect.width = boxRect.width - ds * 2;
                boxRect.height = boxRect.height - ds * 2;
                // initPos 為 左上(0, self.boxRect.height)、左下(0, 0)、
                // 右上(self.boxRect.width, self.boxRect.height)、右下(self.boxRect.width, 0)
                if (self.boxRect.contains(pos) && !boxRect.contains(self.touchPos)) {
                    if (disRect.x <= ds) {
                        disRect.x = 0
                    } else if (disRect.x >= self.boxRect.width - ds) {
                        disRect.x = self.boxRect.width
                    }
                    if (disRect.y <= ds) {
                        disRect.y = 0
                    } else if (disRect.y >= self.boxRect.height - ds) {
                        disRect.y = self.boxRect.height
                    }
                    self.initPos = disRect;
                }
            }
            self.touchPos = pos;
            self.debugDraw(self.initPos, self.movePos);
        }
        this.touchLayer.on(cc.Node.EventType.TOUCH_MOVE, touchMove);

        let touchEnded = function (event) {
            event.stopPropagation();
            self.initSetData();
            self.shadowNode.active = false;
            self.initPos = false;
            self.isLeftTopStart = false;
            self.isRightBottomStart = false;
            self.debugClear();
            self.isTouch = false;
        }
        this.touchLayer.on(cc.Node.EventType.TOUCH_END, touchEnded);

        let touchCancel = function (event) {
            event.stopPropagation();
            self.initSetData();
            self.shadowNode.active = false;
            self.initPos = false;
            self.isTouch = false;
            self.debugClear();
        }
        this.touchLayer.on(cc.Node.EventType.TOUCH_CANCEL, touchCancel);

        this.node.getChildByName("button").on("click",function(){
            self.resetSqueeze();
        },this)
    }

    setMovePos(pos) {
        let self = this;
        let tempX = pos.x - self.boxRect.x
        let tempY = pos.y - self.boxRect.y
        let miniMove = 40;      //多少pixel以下忽略不移動
        let percentMove = 0.5;     //移動距離乘以
        let tempMoveX = tempX - self.initPos.x;
        let tempMoveY = tempY - self.initPos.y;
        if (self.initPos.x == 0 && self.initPos.y == 0) {
            //左下翻牌
            if (tempX <= 0 && tempY <= 0) {
                self.movePos = { x: self.initPos.x, y: self.initPos.y };
            } else if (tempX <= 0) {
                self.movePos = { x: 0, y: tempY };
            } else if (tempY <= 0) {
                self.movePos = { x: tempX, y: 0 };
            } else {
                self.movePos = { x: tempX, y: tempY };
            }
        } else if (self.initPos.x == 0 && self.initPos.y == self.boxRect.height) {
            //左上翻牌
            if (tempX <= 0 && tempY >= self.boxRect.height) {
                self.movePos = { x: self.initPos.x, y: self.initPos.y };
            } else if (tempX <= 0) {
                self.movePos = { x: 0, y: tempY };
            } else if (tempY >= self.boxRect.height) {
                self.movePos = { x: tempX, y: self.boxRect.height };
            } else {
                self.movePos = { x: tempX, y: tempY };
            }
            self.isLeftTopStart = true;
        } else if (self.initPos.x == self.boxRect.width && self.initPos.y == 0) {
            //右下翻牌
            if (tempX >= self.boxRect.width && tempY <= 0) {
                self.movePos = { x: self.boxRect.width - 1, y: 1 };
            } else if (tempX >= self.boxRect.width) {
                self.movePos = { x: self.boxRect.width, y: tempY };
            } else if (tempY <= 0) {
                self.movePos = { x: tempX, y: 0 };
            } else {
                self.movePos = { x: tempX, y: tempY };
            }
            self.isRightBottomStart = true;
        } else if (self.initPos.x == self.boxRect.width && self.initPos.y == self.boxRect.height) {
            //右上翻牌
            if (tempX >= self.boxRect.width && tempY >= self.boxRect.height) {
                self.movePos = { x: self.boxRect.width - 1, y: self.boxRect.height - 1 };
            } else if (tempX >= self.boxRect.width) {
                self.movePos = { x: self.boxRect.width, y: tempY };
            } else if (tempY >= self.boxRect.height) {
                self.movePos = { x: tempX, y: self.boxRect.height };
            } else {
                self.movePos = { x: tempX, y: tempY };
            }
        } else if (self.initPos.x == 0) {
            //左邊翻牌
            if (tempX <= 0) {
                self.movePos = { x: 1, y: self.initPos.y };
            } else if (tempX * 0.5 - (tempMoveY - miniMove) * percentMove < 0) {
                self.movePos = { x: tempX, y: tempX * 0.5 + self.initPos.y };
            } else if (-tempX * 0.5 - (tempMoveY + miniMove) * percentMove > 0) {
                self.movePos = { x: tempX, y: -tempX * 0.5 + self.initPos.y };
            } else if (tempMoveY >= miniMove) {
                self.movePos = { x: tempX, y: Math.floor((tempMoveY - miniMove) * percentMove) + self.initPos.y };
            } else if (tempMoveY <= -miniMove) {
                self.movePos = { x: tempX, y: Math.floor((tempMoveY + miniMove) * percentMove) + self.initPos.y };
            } else {
                self.movePos = { x: tempX, y: self.initPos.y };
            }
        } else if (self.initPos.x == self.boxRect.width) {
            //右邊翻牌
            if (tempX >= self.boxRect.width) {
                self.movePos = { x: self.boxRect.width - 1, y: self.initPos.y };
            } else if ((tempX - self.boxRect.width) * 0.5 - (tempMoveY + miniMove) * percentMove > 0) {
                self.movePos = { x: tempX, y: (tempX - self.boxRect.width) * 0.5 + self.initPos.y };
            } else if (-(tempX - self.boxRect.width) * 0.5 - (tempMoveY - miniMove) * percentMove < 0) {
                self.movePos = { x: tempX, y: -(tempX - self.boxRect.width) * 0.5 + self.initPos.y };
            } else if (tempMoveY >= miniMove) {
                self.movePos = { x: tempX, y: Math.floor((tempMoveY - miniMove) * percentMove) + self.initPos.y };
            } else if (tempMoveY <= -miniMove) {
                self.movePos = { x: tempX, y: Math.floor((tempMoveY + miniMove) * percentMove) + self.initPos.y };
            } else {
                self.movePos = { x: tempX, y: self.initPos.y };
            }
        } else if (self.initPos.y == 0) {
            //下邊翻牌
            if (tempY <= 0) {
                self.movePos = { x: self.initPos.x, y: 1 };
            } else if (tempY * 0.5 - (tempMoveX - miniMove) * percentMove < 0) {
                self.movePos = { x: tempY * 0.5 + self.initPos.x, y: tempY };
            } else if (-tempY * 0.5 - (tempMoveX + miniMove) * percentMove > 0) {
                self.movePos = { x: -tempY * 0.5 + self.initPos.x, y: tempY };
            } else if (tempMoveX >= miniMove) {
                self.movePos = { x: Math.floor((tempMoveX - miniMove) * percentMove) + self.initPos.x, y: tempY };
            } else if (tempMoveX <= -miniMove) {
                self.movePos = { x: Math.floor((tempMoveX + miniMove) * percentMove) + self.initPos.x, y: tempY };
            } else {
                self.movePos = { x: self.initPos.x, y: tempY };
            }
        } else if (self.initPos.y == self.boxRect.height) {
            //上邊翻牌
            if (tempY >= self.boxRect.height) {
                self.movePos = { x: self.initPos.x, y: self.boxRect.height - 1 };
            } else if ((tempY - self.boxRect.height) * 0.5 - (tempMoveX + miniMove) * percentMove > 0) {
                self.movePos = { x: (tempY - self.boxRect.height) * 0.5 + self.initPos.x, y: tempY };
            } else if (-(tempY - self.boxRect.height) * 0.5 - (tempMoveX - miniMove) * percentMove < 0) {
                self.movePos = { x: -(tempY - self.boxRect.height) * 0.5 + self.initPos.x, y: tempY };
            } else if (tempMoveX >= miniMove) {
                self.movePos = { x: Math.floor((tempMoveX - miniMove) * percentMove) + self.initPos.x, y: tempY };
            } else if (tempMoveX <= -miniMove) {
                self.movePos = { x: Math.floor((tempMoveX + miniMove) * percentMove) + self.initPos.x, y: tempY };
            } else {
                self.movePos = { x: self.initPos.x, y: tempY };
            }
        } else {
            self.movePos = { x: pos.x - self.boxRect.x, y: pos.y - self.boxRect.y };
        }
    }

    initSetData() {
        this.cardBgMaterial.setProperty('disX', cc.v2(0.0, 0.0));
        this.cardBgMaterial.setProperty('disY', cc.v2(0.0, 0.0));
        this.cardBgMaterial.setProperty('xlist', cc.v2(0.0, 0.0));
        this.cardBgMaterial.setProperty('ylist', cc.v2(0.0, 0.0));

        this.cardColorMaterial.setProperty('disX', cc.v2(0.0, 0.0));
        this.cardColorMaterial.setProperty('disY', cc.v2(0.0, 0.0));
        this.cardColorMaterial.setProperty('xlist', cc.v2(0.0, 0.0));
        this.cardColorMaterial.setProperty('ylist', cc.v2(0.0, 0.0));
        this.cardColorMaterial.setProperty('worldSprWidth', this.boxRect.width);
        this.cardColorMaterial.setProperty('worldSprHeight', this.boxRect.height);
        this.cardColorMaterial.setProperty('disXSymmetricPos', cc.v2(0.0, 0.0));
        this.cardColorMaterial.setProperty('disYSymmetricPos', cc.v2(0.0, 0.0));
        this.cardColorMaterial.setProperty('xlistSymmetricPos', new cc.Vec4(0.0, 0.0, 0.0, 0.0));
        this.cardColorMaterial.setProperty('ylistSymmetricPos', new cc.Vec4(0.0, 0.0, 0.0, 0.0));
    }

    setXY(initPos, movePos) {
        let xyData = this.getXYData(initPos, movePos, this.boxRect.width, this.boxRect.height);
        this.cardBgMaterial.setProperty('disX', xyData.disX);
        this.cardBgMaterial.setProperty('disY', xyData.disY);
        this.cardBgMaterial.setProperty('xlist', xyData.xlist);
        this.cardBgMaterial.setProperty('ylist', xyData.ylist);

        this.cardColorMaterial.setProperty('disX', xyData.disX);
        this.cardColorMaterial.setProperty('disY', xyData.disY);
        this.cardColorMaterial.setProperty('xlist', xyData.xlist);
        this.cardColorMaterial.setProperty('ylist', xyData.ylist);


        xyData = this.getXYData(initPos, movePos, this.boxRect.width, this.boxRect.height);
        this.cardColorMaterial.setProperty('disXSymmetricPos', xyData.disX);
        this.cardColorMaterial.setProperty('disYSymmetricPos', xyData.disY);
        this.cardColorMaterial.setProperty('xlistSymmetricPos', xyData.xlist);
        this.cardColorMaterial.setProperty('ylistSymmetricPos', xyData.ylist);
    }

    getXYData(initPos, movePos, width, height) {
        let disX = movePos.x - initPos.x;
        let disY = movePos.y - initPos.y;
        // this.shadowNode
        let XYData = {
            disX: cc.v2(0, 0),
            disY: cc.v2(0, 0),
            xlist: new cc.Vec4(0, 0, 0, 0),
            ylist: new cc.Vec4(0, 0, 0, 0)}
        if (disX == 0 && disY == 0) {
            this.shadowNode.active = false;
        } else if (disY == 0) {
            let x1 = 0;
            let x2 = initPos.x + disX / 2;
            this.limitRotation = 0;
            //水平陰影
            this.shadowNode.active = true;
            this.shadowNode.angle = 0;
            this.shadowNode.height = height;
            this.shadowNode.width = Math.min(Math.abs(disX / 2), 30);
            this.shadowNode.x = -width * 0.5 + disX * 0.5;
            this.shadowNode.y = 0;
            if (disX < 0) { //從右邊翻
                x1 = initPos.x + disX / 2;
                x2 = width;
                this.shadowNode.angle = 180;
                this.shadowNode.x = width * 0.5 + disX * 0.5;;
            }
            XYData.disX = cc.v2(x1, x2);
        } else if (disX == 0) {
            let y1 = height - initPos.y - disY / 2;
            let y2 = height;
            this.limitRotation = 90;
            //垂直陰影
            this.shadowNode.active = true;
            this.shadowNode.angle = 90;
            this.shadowNode.height = width;
            this.shadowNode.width = Math.min(Math.abs(disY / 2), 30);
            this.shadowNode.x = 0;
            this.shadowNode.y = -height * 0.5 + disY * 0.5;
            if (disY < 0) {  //從上面翻
                y1 = 0;
                y2 = (height - initPos.y) - disY / 2;
                this.shadowNode.angle = -90;
                this.shadowNode.y = height * 0.5 + disY * 0.5;
            }
            XYData.disY = cc.v2(y1, y2);
        } else {
            //获取反正切值
            let tanValue = Math.atan(disY / disX);
            // 弧度转角度
            this.limitRotation = 180 / Math.PI * tanValue;
            // cc.log(">>>>>>>this.limitRotation:", this.limitRotation)
            // 取斜邊
            let disHy = Math.sqrt(disX * disX + disY * disY);
            // 取得對稱軸延伸部分的y (翻開2個角時)
            let hy = Math.abs((disHy * 0.5) / Math.sin(tanValue));
            // 取得對稱軸延伸部分的x (翻開2個角時)
            let hx = Math.abs((disHy * 0.5) / Math.cos(tanValue));
            // cc.log("disHy:",disHy);
            // cc.log("hy:",hy);
            // cc.log("hx:",hx);

            // y = mx + b 直線方程式 ，移動軌跡斜率 △Y / △X ，則對稱軸斜率為 -△X / △Y
            let slopeM = -disX / disY;
            let midPos = cc.v2(0, 0);
            midPos.x = (movePos.x + initPos.x) / 2;
            midPos.y = (movePos.y + initPos.y) / 2;
            // y = mx + b 中的b值，(x,y) = midPos , b = y-mx
            let cutB = midPos.y - slopeM * midPos.x;
            let cutPointX = [0, 0];
            let cutPointY = [0, 0];
            let cutIndex = 0;

            // 與 x = 0 的交界的y值,y=mx+b => y=b
            if (cutB >= 0 && cutB <= height) {
                cutPointX[cutIndex] = 0;
                cutPointY[cutIndex] = cutB;
                cutIndex = cutIndex + 1;
            }
            // 與 x = width 的交界的y值,y=mx+b => y=slopeM*width+b
            if ((slopeM * width + cutB) >= 0 && (slopeM * width + cutB) <= height) {
                cutPointX[cutIndex] = width;
                cutPointY[cutIndex] = (slopeM * width + cutB);
                cutIndex = cutIndex + 1;
            }
            // 與 y = 0 的交界的x值,x=(y-b)/m => x=-b/slopeM
            if (-cutB / slopeM >= 0 && -cutB / slopeM <= width) {
                cutPointX[cutIndex] = -cutB / slopeM;
                cutPointY[cutIndex] = 0;
                cutIndex = cutIndex + 1;
            }
            // 與 y = height 的交界的x值,x=(y-b)/m => x=(height-b)/slopeM
            if ((height - cutB) / slopeM >= 0 && (height - cutB) / slopeM <= width) {
                cutPointX[cutIndex] = (height - cutB) / slopeM;
                cutPointY[cutIndex] = height;
                cutIndex = cutIndex + 1;
            }

            this.shadowNode.active = true;
            if (movePos.x > initPos.x) {
                this.shadowNode.angle = this.limitRotation;
            } else {
                this.shadowNode.angle = this.limitRotation + 180;
            }
            // 對稱軸 △X ， △Y
            let cutDX = cutPointX[0] - cutPointX[1];
            let cutDY = cutPointY[0] - cutPointY[1];
            this.shadowNode.height = Math.sqrt(cutDX * cutDX + cutDY * cutDY);
            this.shadowNode.width = Math.min(disHy / 2, 30);
            this.shadowNode.x = (cutPointX[0] + cutPointX[1]) / 2 - width * 0.5;
            this.shadowNode.y = (cutPointY[0] + cutPointY[1]) / 2 - height * 0.5;

            let pos1 = cc.v2(0, 0);
            let pos2 = cc.v2(0, 0);
            let pos3 = cc.v2(0, 0);

            //因為牌是反的所以，UV(0,0)在左上，UV(1,1)在右下
            if (disX > 0 && disY > 0) {          //往右上翻牌
                pos1.x = 0;
                pos1.y = height;
                if (initPos.x > initPos.y) {
                    pos2.x = hx + initPos.x;
                    pos2.y = height;
                    pos3.x = 0;
                    pos3.y = height - (((hx + initPos.x) / hx * (hy + initPos.y)));
                    //cc.log(">>>>>>>>>>>>>>往右上翻牌1")
                } else {
                    pos2.x = 0;
                    pos2.y = height - (hy + initPos.y);
                    pos3.x = (hy + initPos.y) / hy * (hx + initPos.x);
                    pos3.y = height;
                    //cc.log(">>>>>>>>>>>>>>往右上翻牌2")
                }
            } else if (disX < 0 && disY > 0) {    //往左上翻牌
                pos1.x = width;
                pos1.y = height;
                if (width - initPos.x > initPos.y) {
                    pos2.x = width - (hx + width - initPos.x);
                    pos2.y = height;
                    pos3.x = width;
                    pos3.y = height - ((width - pos2.x) / hx * (hy + initPos.y));
                    //cc.log(">>>>>>>>>>>>>>往左上翻牌1")
                } else {
                    pos2.x = width;
                    pos2.y = height - (hy + initPos.y);
                    pos3.x = width - (hy + initPos.y) / hy * (hx + width - initPos.x);
                    pos3.y = height;
                    //cc.log(">>>>>>>>>>>>>>往左上翻牌2")
                }

            } else if (disX > 0 && disY < 0) {    //往右下翻牌
                pos1.x = 0;
                pos1.y = 0;
                if (initPos.x > height - initPos.y) {
                    pos2.x = hx + initPos.x;
                    pos2.y = 0;
                    pos3.x = 0;
                    pos3.y = pos2.x / hx * (hy + height - initPos.y);
                    //cc.log(">>>>>>>>>>>>>>往右下翻牌1")
                } else {
                    pos2.x = 0;
                    pos2.y = hy + (height - initPos.y);
                    pos3.x = (hy + (height - initPos.y)) / hy * hx + initPos.x;
                    pos3.y = 0;
                    //cc.log(">>>>>>>>>>>>>>往右下翻牌2")
                }

            } else if (disX < 0 && disY < 0) {    //往左下翻牌
                pos1.x = width;
                pos1.y = 0;
                if (width - initPos.x > height - initPos.y) {
                    pos2.x = width - (hx + width - initPos.x);
                    pos2.y = 0;
                    pos3.x = width;
                    pos3.y = (width - pos2.x) / hx * (hy + height - initPos.y);
                    // cc.log(">>>>>>>>>>>>>>往左下翻牌1")
                } else {
                    pos2.x = width;
                    pos2.y = hy + (height - initPos.y);
                    pos3.x = width - (hy + (height - initPos.y)) / hy * (hx + width - initPos.x);
                    pos3.y = 0;
                    // cc.log(">>>>>>>>>>>>>>往左下翻牌2")
                }

            }

            let xlist = new cc.Vec4(pos1.x, pos2.x, pos3.x, 0);
            let ylist = new cc.Vec4(pos1.y, pos2.y, pos3.y, 0);

            // cc.log ("cutPoint[0] x: " + cutPointX[0] + " , y : " + cutPointY[0]);
            // cc.log ("cutPoint[1] x: " + cutPointX[1] + " , y : " + cutPointY[1]);
            // cc.log ("pos1 x: " + pos1.x + " , y : " + pos1.y);
            // cc.log ("pos2 x: " + pos2.x + " , y : " + pos2.y);
            // cc.log ("pos3 x: " + pos3.x + " , y : " + pos3.y);

            XYData.xlist = xlist;
            XYData.ylist = ylist;
        }

        return XYData
    }

    debugDraw(startPos, endPos) {
        if (!startPos) {
            return;
        }

        let numberPos1 = this.number1Node.position;
        let numberPos2 = this.number2Node.position;
        let numberPos3 = this.number3Node.position;
        let numberPos4 = this.number4Node.position;
        let centerPos = cc.v2(0, 0);
        // 翻牌起點世界座標=(startPos.x+this.boxRect.x, startPos.y+this.boxRect.y)，算回local座標系
        let pointM1 = this.touchLayer.convertToNodeSpaceAR(cc.v2(startPos.x + this.boxRect.x, startPos.y + this.boxRect.y));
        let pointD11 = cc.v2(numberPos1.x, numberPos1.y);
        let pointD12 = cc.v2(numberPos2.x, numberPos2.y);
        let pointD13 = cc.v2(numberPos3.x, numberPos3.y);
        let pointD14 = cc.v2(numberPos4.x, numberPos4.y);
        let pointD15 = cc.v2(centerPos.x, centerPos.y);

        let vecM = cc.v2(endPos.x - startPos.x, endPos.y - startPos.y);
        let vecS1 = cc.v2(pointD11.x - pointM1.x, pointD11.y - pointM1.y);
        let vecS2 = cc.v2(pointD12.x - pointM1.x, pointD12.y - pointM1.y);
        let vecS3 = cc.v2(pointD13.x - pointM1.x, pointD13.y - pointM1.y);
        let vecS4 = cc.v2(pointD14.x - pointM1.x, pointD14.y - pointM1.y);
        let vecS5 = cc.v2(pointD15.x - pointM1.x, pointD15.y - pointM1.y);

        let K1 = 2 * vecS1.dot(vecM) / (vecM.x * vecM.x + vecM.y * vecM.y);
        let K2 = 2 * vecS2.dot(vecM) / (vecM.x * vecM.x + vecM.y * vecM.y);
        let K3 = 2 * vecS3.dot(vecM) / (vecM.x * vecM.x + vecM.y * vecM.y);
        let K4 = 2 * vecS4.dot(vecM) / (vecM.x * vecM.x + vecM.y * vecM.y);
        let K5 = 2 * vecS5.dot(vecM) / (vecM.x * vecM.x + vecM.y * vecM.y);
        //看到右上點
        if (K1 < 1) {
            // D1存在對稱點D2， D2 = D1 + Vec移動量( 1 - k)

            let pointD21 = cc.v2(pointD11.x + (1 - K1) * vecM.x, pointD11.y + (1 - K1) * vecM.y);

            this.symmetry1Node.x = pointD21.x;
            this.symmetry1Node.y = pointD21.y;
            this.symmetry1Node.angle = -180 + this.limitRotation * 2;
            this.symmetry1Node.active = true;
        }
        else {
            this.symmetry1Node.active = false;
        }
        //看到左下點
        if (K2 < 1) {
            // D1存在對稱點D2

            let pointD22 = cc.v2(pointD12.x + (1 - K2) * vecM.x, pointD12.y + (1 - K2) * vecM.y);

            this.symmetry2Node.x = pointD22.x;
            this.symmetry2Node.y = pointD22.y;
            this.symmetry2Node.angle = this.limitRotation * 2;
            this.symmetry2Node.active = true;
        }
        else {
            this.symmetry2Node.active = false;
        }
        //看到右下點  如果從右下或左上翻,此2根手指要永存.如果從其他角度翻,當右上或左下的手指頭出現,則右下或左上手指頭消失
        if (K3 < 1 && (this.isRightBottomStart || !(this.symmetry1Node.active || this.symmetry2Node.active))) {
            // D1存在對稱點D2

            let pointD23 = cc.v2(pointD13.x + (1 - K3) * vecM.x, pointD13.y + (1 - K3) * vecM.y);

            this.symmetry3Node.x = pointD23.x;
            this.symmetry3Node.y = pointD23.y;
            this.symmetry3Node.angle = this.limitRotation * 2;
            this.symmetry3Node.active = true;
        }
        else {
            this.symmetry3Node.active = false;
        }
        //看到左上點  如果從右下或左上翻,此2根手指要永存.如果從其他角度翻,當右上或左下的手指頭出現,則右下或左上手指頭消失
        if (K4 < 1 && (this.isLeftTopStart || !(this.symmetry1Node.active || this.symmetry2Node.active))) {
            // D1存在對稱點D2

            let pointD24 = cc.v2(pointD14.x + (1 - K4) * vecM.x, pointD14.y + (1 - K4) * vecM.y);

            this.symmetry4Node.x = pointD24.x;
            this.symmetry4Node.y = pointD24.y;
            this.symmetry4Node.angle = -180 + this.limitRotation * 2;
            this.symmetry4Node.active = true;
        }
        else {
            this.symmetry4Node.active = false;
        }
        //看到中心點
        if (K5 < 1) {
            // D1存在對稱點D2
            this.openPai();
        }
    }

    debugClear() {
        this.symmetry1Node.active = false;
        this.symmetry2Node.active = false;
        this.symmetry3Node.active = false;
        this.symmetry4Node.active = false;
        this.shadowNode.active = false;
    }
}
