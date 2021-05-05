

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    debugDraw(){
        if (!this.initPos){
            return;
        }
        
        var root = cc.find('Canvas/cardBg');
        // this.drawing = cc.find('Canvas/touchLayer').getComponent(cc.Graphics);
        // this.drawing.clear();
        // this.drawing.lineWidth = 2;

        // // 翻牌起點世界座標=(this.initPos.x+this.box.x, this.initPos.y+this.box.y)
        // this.drawing.moveTo(this.initPos.x+this.box.x-canvasW/2, this.initPos.y+this.box.y-canvasH/2);

        // // 翻牌終點世界座標=(this.movePos.x+this.box.x, this.movePos.y+this.box.y)
        // this.drawing.lineTo(this.movePos.x+this.box.x-canvasW/2, this.movePos.y+this.box.y-canvasH/2);

        // this.drawing.strokeColor = cc.Color.RED;
        // this.drawing.stroke();
        
        var numberPos1 = root.getChildByName('number1').position;
        var numberPos2 = root.getChildByName('number2').position;
        var numberPos3 = root.getChildByName('number3').position;
        var numberPos4 = root.getChildByName('number4').position;
        var centerPos = root.getChildByName('center').position;
        // 翻牌起點世界座標=(this.initPos.x+this.box.x, this.initPos.y+this.box.y)，算回local座標系
        var pointM1 = root.convertToNodeSpaceAR(cc.v2(this.initPos.x+this.box.x, this.initPos.y+this.box.y));
        var pointD11 = cc.v2(numberPos1.x, numberPos1.y);
        var pointD12 = cc.v2(numberPos2.x, numberPos2.y);
        var pointD13 = cc.v2(numberPos3.x, numberPos3.y);
        var pointD14 = cc.v2(numberPos4.x, numberPos4.y);
        var pointD15 = cc.v2(centerPos.x, centerPos.y);

        var vecM = cc.v2(this.movePos.x-this.initPos.x, this.movePos.y-this.initPos.y);
        var vecS1 = cc.v2(pointD11.x-pointM1.x, pointD11.y-pointM1.y);
        var vecS2 = cc.v2(pointD12.x-pointM1.x, pointD12.y-pointM1.y);
        var vecS3 = cc.v2(pointD13.x-pointM1.x, pointD13.y-pointM1.y);
        var vecS4 = cc.v2(pointD14.x-pointM1.x, pointD14.y-pointM1.y);
        var vecS5 = cc.v2(pointD15.x-pointM1.x, pointD15.y-pointM1.y);

        var K1 = 2*vecS1.dot(vecM)/(vecM.x*vecM.x + vecM.y*vecM.y);
        var K2 = 2*vecS2.dot(vecM)/(vecM.x*vecM.x + vecM.y*vecM.y);
        var K3 = 2*vecS3.dot(vecM)/(vecM.x*vecM.x + vecM.y*vecM.y);
        var K4 = 2*vecS4.dot(vecM)/(vecM.x*vecM.x + vecM.y*vecM.y);
        var K5 = 2*vecS5.dot(vecM)/(vecM.x*vecM.x + vecM.y*vecM.y);

        this.symmetry1 = root.getChildByName('symmetry1');
        this.symmetry2 = root.getChildByName('symmetry2');
        this.symmetry3 = root.getChildByName('symmetry3');
        this.symmetry4 = root.getChildByName('symmetry4');
        this.cardface = root.getChildByName('cardFace');
        //看到右上點
        if(K1 < 1){
            // D1存在對稱點D2

            var pointD21 = cc.v2(pointD11.x+(1-K1)*vecM.x, pointD11.y+(1-K1)*vecM.y);

            this.symmetry1.x = pointD21.x;
            this.symmetry1.y = pointD21.y;
            this.symmetry1.angle = -180 + this.rotation*2;
            this.symmetry1.active = true;
        }
        else{
            this.symmetry1.active = false;
        }
        //看到左下點
        if(K2 < 1){
            // D1存在對稱點D2

            var pointD22 = cc.v2(pointD12.x+(1-K2)*vecM.x, pointD12.y+(1-K2)*vecM.y);

            this.symmetry2.x = pointD22.x;
            this.symmetry2.y = pointD22.y;
            this.symmetry2.angle = this.rotation*2;
            this.symmetry2.active = true;
        }
        else{
            this.symmetry2.active = false;
        }
        //看到右下點  如果從右下或左上翻,此2根手指要永存.如果從其他角度翻,當右上或左下的手指頭出現,則右下或左上手指頭消失
        if(K3 < 1 && (this.rightBottomStart || !(this.symmetry1.active || this.symmetry2.active))){
            // D1存在對稱點D2

            var pointD23 = cc.v2(pointD13.x+(1-K3)*vecM.x, pointD13.y+(1-K3)*vecM.y);

            this.symmetry3.x = pointD23.x;
            this.symmetry3.y = pointD23.y;
            this.symmetry3.angle = this.rotation*2;
            this.symmetry3.active = true;
        }
        else{
            this.symmetry3.active = false;
        }
        //看到左上點  如果從右下或左上翻,此2根手指要永存.如果從其他角度翻,當右上或左下的手指頭出現,則右下或左上手指頭消失
        if(K4 < 1 && (this.leftTopStart || !(this.symmetry1.active || this.symmetry2.active))){
            // D1存在對稱點D2

            var pointD24 = cc.v2(pointD14.x+(1-K4)*vecM.x, pointD14.y+(1-K4)*vecM.y);

            this.symmetry4.x = pointD24.x;
            this.symmetry4.y = pointD24.y;
            this.symmetry4.angle = -180 + this.rotation*2;
            this.symmetry4.active = true;
        }
        else{
            this.symmetry4.active = false;
        }
        //看到中心點
        if(K5 < 1){
            // D1存在對稱點D2
            this.cardface.active = true;
            this.ifCardOpen = true;
            this.initSetData();
            this.initPos = false;
            this.debugClear();
        }
    },
    debugClear(){
        // this.initPos
        // this.movePos
        // var canvasW = cc.Canvas.instance.node.width;
        // var canvasH = cc.Canvas.instance.node.height;
        // this.drawing = cc.find('Canvas/touchLayer').getComponent(cc.Graphics);
        this.symmetry1.active = false;
        this.symmetry2.active = false;
        this.symmetry3.active = false;
        this.symmetry4.active = false;
        this.shadowImage.active = false;
        // this.drawing.clear();
    },
    start () {
        cc.dynamicAtlasManager.enabled = false;
        this._bgMaterialNode = this.node.getChildByName("cardBg");
        this.shadowImage = this._bgMaterialNode.getChildByName("shadow");
        this._zmMaterialNode = this._bgMaterialNode.getChildByName("cardNum");
        this._bgMaterial = this._bgMaterialNode.getComponent(cc.Sprite).sharedMaterials[0];
        this._zmMaterial = this._zmMaterialNode.getComponent(cc.Sprite).sharedMaterials[0];
        this.initBox = this._bgMaterialNode.getBoundingBoxToWorld();
        this.box = this._bgMaterialNode.getBoundingBoxToWorld();
        cc.log(">>>>>>>>>this.box:",this.box);
        //this._zmMaterialNode.getComponent(cc.Sprite).sharedMaterials[0] = this._zmMaterialNode.getComponent(cc.Sprite).sharedMaterials[1]
        this._zmMaterial.setProperty('worldPos', cc.v2(this.box.x,this.box.y));
        this._bgMaterial.setProperty('sprWidth', this.box.width);
        this._bgMaterial.setProperty('sprHight', this.box.height);
        this._zmMaterial.setProperty('sprWidth', this.box.width);
        this._zmMaterial.setProperty('sprHight', this.box.height);
        this.ifCardOpen = false;
        this.leftTopStart = false;
        this.rightBottomStart = false;
        this.touchLayer = this.node.getChildByName("touchLayer");
        //触摸开始
        var touchBegan = function(event){
            cc.log(">>>>>>>>touchBegan:",event.getLocation());
            this.upPos = event.getLocation();
            //this.touchBeginPos = event.getLocation();
        }
        this.touchLayer.on(cc.Node.EventType.TOUCH_START,touchBegan,this);
        //触摸移动
        var touchMove = function(event){
            event.stopPropagation();
            //cc.log(">>>>>>>>touchMove:",event.getLocation());
            var pos = event.getLocation();
            var disRect = {x:this.upPos.x-this.box.x,y:this.upPos.y-this.box.y};
            //this.touchMovePos = event.getLocation();
            
            cc.log(">>>>>>>>this.box:",this.box);
            this.movePos = {x:pos.x-this.box.x,y:pos.y-this.box.y};
            if(this.ifCardOpen){
                return;
            }
            if (this.initPos){
                // this.movePos = {x:pos.x-this.box.x,y:pos.y-this.box.y};
				var tempX = pos.x-this.box.x;
                var tempY = pos.y-this.box.y;
                var miniMove = 40;      //多少pixel以下忽略不移動
                var percentMove = 0.5;     //移動距離乘以
                var tempMoveX = tempX - this.initPos.x;
                var tempMoveY = tempY - this.initPos.y;
                if(this.initPos.x == 0 && this.initPos.y == 0){
                    //左下翻牌
					if(tempX <= 0 && tempY <= 0){
                        this.movePos = {x:this.initPos.x,y:this.initPos.y};
					}else if(tempX <= 0){
                        this.movePos = {x:0,y:tempY};
					}else if(tempY <= 0){
						this.movePos = {x:tempX,y:0};
					}else{						
						this.movePos = {x:tempX,y:tempY};
					}
                }else if(this.initPos.x == 0 && this.initPos.y == this.box.height){
                    //左上翻牌
					if(tempX <= 0 && tempY >= this.box.height){
						this.movePos = {x:this.initPos.x,y:this.initPos.y};
					}else if(tempX <= 0){
						this.movePos = {x:0,y:tempY};
					}else if(tempY >= this.box.height){
						this.movePos = {x:tempX,y:this.box.height};
					}else{						
						this.movePos = {x:tempX,y:tempY};
                    }
                    this.leftTopStart = true;
                }else if(this.initPos.x == this.box.width && this.initPos.y == 0){
                    //右下翻牌
					if(tempX >= this.box.width && tempY <= 0){
						this.movePos = {x:this.box.width-1,y:1};
					}else if(tempX >= this.box.width){
						this.movePos = {x:this.box.width,y:tempY};
					}else if(tempY <= 0){
						this.movePos = {x:tempX,y:0};
					}else{						
						this.movePos = {x:tempX,y:tempY};
                    }
                    this.rightBottomStart = true;
                }else if(this.initPos.x == this.box.width && this.initPos.y == this.box.height){
                    //右上翻牌
					if(tempX >= this.box.width && tempY >= this.box.height){
						this.movePos = {x:this.box.width-1,y:this.box.height-1};
					}else if(tempX >= this.box.width){
						this.movePos = {x:this.box.width,y:tempY};
					}else if(tempY >= this.box.height){
						this.movePos = {x:tempX,y:this.box.height};
					}else{						
						this.movePos = {x:tempX,y:tempY};
					}
                }else if(this.initPos.x == 0){
                    //左邊翻牌
					if(tempX <= 0){
						this.movePos = {x:1,y:this.initPos.y};
					}else if(tempX* 0.5 - (tempMoveY - miniMove)*percentMove < 0){
						this.movePos = {x:tempX,y:tempX* 0.5 + this.initPos.y};
					}else if(-tempX* 0.5 - (tempMoveY + miniMove)*percentMove > 0){
						this.movePos = {x:tempX,y:-tempX* 0.5 + this.initPos.y};
					}else if(tempMoveY >= miniMove ){
						this.movePos = {x:tempX,y:Math.floor((tempMoveY-miniMove)*percentMove)+this.initPos.y};
					}else if(tempMoveY <= -miniMove ){
						this.movePos = {x:tempX,y:Math.floor((tempMoveY+miniMove)*percentMove)+this.initPos.y};
					}else{
                        this.movePos = {x:tempX,y:this.initPos.y};
                    }
                }else if(this.initPos.x == this.box.width){
                    //右邊翻牌
					if(tempX >= this.box.width){
                        this.movePos = {x:this.box.width-1,y:this.initPos.y};
					}else if((tempX - this.box.width)* 0.5 - (tempMoveY + miniMove)*percentMove > 0){
                        this.movePos = {x:tempX,y:(tempX - this.box.width)* 0.5 + this.initPos.y};
					}else if(-(tempX-this.box.width)* 0.5 - (tempMoveY - miniMove)*percentMove < 0){
                        this.movePos = {x:tempX,y:-(tempX - this.box.width)* 0.5 + this.initPos.y};
					}else if(tempMoveY >= miniMove ){
						this.movePos = {x:tempX,y:Math.floor((tempMoveY-miniMove)*percentMove)+this.initPos.y};
					}else if(tempMoveY <= -miniMove ){
						this.movePos = {x:tempX,y:Math.floor((tempMoveY+miniMove)*percentMove)+this.initPos.y};
					}else{
                        this.movePos = {x:tempX,y:this.initPos.y};
                    }
                }else if(this.initPos.y == 0){
                    //下邊翻牌
					if(tempY <= 0){
						this.movePos = {x:this.initPos.x,y:1};
					}else if(tempY* 0.5 - (tempMoveX - miniMove)*percentMove < 0){
                        this.movePos = {x:tempY* 0.5 + this.initPos.x,y:tempY};
					}else if(-tempY* 0.5 - (tempMoveX + miniMove)*percentMove > 0){
						this.movePos = {x:-tempY* 0.5 + this.initPos.x,y:tempY};
					}else if(tempMoveX >= miniMove ){
						this.movePos = {x:Math.floor((tempMoveX-miniMove)*percentMove)+this.initPos.x,y:tempY};
					}else if(tempMoveX <= -miniMove ){
						this.movePos = {x:Math.floor((tempMoveX+miniMove)*percentMove)+this.initPos.x,y:tempY};
					}else{
                        this.movePos = {x:this.initPos.x,y:tempY};
                    }
                }else if(this.initPos.y == this.box.height){
                    //上邊翻牌
					if(tempY >= this.box.height){
						this.movePos = {x:this.initPos.x,y:this.box.height-1};
					}else if((tempY - this.box.height)* 0.5 - (tempMoveX + miniMove)*percentMove > 0){
						this.movePos = {x:(tempY - this.box.height)* 0.5 + this.initPos.x,y:tempY};
					}else if(-(tempY - this.box.height)* 0.5 - (tempMoveX - miniMove)*percentMove < 0){
						this.movePos = {x:-(tempY - this.box.height)* 0.5 + this.initPos.x,y:tempY};
					}else if(tempMoveX >= miniMove ){
						this.movePos = {x:Math.floor((tempMoveX-miniMove)*percentMove)+this.initPos.x,y:tempY};
					}else if(tempMoveX <= -miniMove ){
						this.movePos = {x:Math.floor((tempMoveX+miniMove)*percentMove)+this.initPos.x,y:tempY};
					}else{
                        this.movePos = {x:this.initPos.x,y:tempY};
                    }
                }else{
                    this.movePos = {x:pos.x-this.box.x,y:pos.y-this.box.y};
				}
                this.setxy();
                
            }else{
                //必须从牌的旁边开始翻,中间不允许翻牌
                var ds = 50;
                var box = new cc.Rect(this.box.x,this.box.y,this.box.width,this.box.height);
                box.x = box.x + ds;
                box.y = box.y + ds;
                box.width = box.width - ds*2;
                box.height = box.height - ds*2;
                if (this.box.contains(pos) && !box.contains(this.upPos)){
                    if (disRect.x <= ds){
                        disRect.x = 0
                    }else if (disRect.x >= this.box.width - ds){
                        disRect.x = this.box.width
                    }
                    if (disRect.y <= ds){
                        disRect.y = 0
                    }else if (disRect.y >= this.box.height - ds){
                        disRect.y = this.box.height
                    }
                    this.initPos = disRect;
                    cc.log(">>>>>>>>>>>disRect:",disRect);
                }
            }
            this.upPos = pos;

            this.debugDraw();
        }
        this.touchLayer.on(cc.Node.EventType.TOUCH_MOVE,touchMove,this);
        //触摸结束
        var touchEnded = function(event){
            event.stopPropagation();
            this.initSetData();
            this.shadowImage.active = false;
            this.initPos = false;
            this.leftTopStart = false;
            this.rightBottomStart = false;
            this.debugClear();
            cc.log(">>>>>>>>touchEnded:",event.getLocation())
        }
        this.touchLayer.on(cc.Node.EventType.TOUCH_END,touchEnded,this)
        //触摸离开屏幕
        var touchCancel = function(event){
            event.stopPropagation();
            this.initSetData();
            this.shadowImage.active = false;
            this.initPos = false;
            this.debugClear();
            cc.log(">>>>>>>>touchCancel:",event.getLocation())
        }
        this.touchLayer.on(cc.Node.EventType.TOUCH_CANCEL,touchCancel,this)

        // this.node.getChildByName("button").on("click",function(){
        //     var angle = this._bgMaterialNode.angle;
        //     cc.log(">>>>>>>>>>angle:",angle)
        //     angle = angle - 90;
        //     cc.log(">>>>>>>touchbutton:",angle)
        //     var rotateTo1 = cc.rotateTo(0.2,-angle);
        //     //this._bgMaterialNode.runAction(rotateTo1);
        //     var rotateTo2 = cc.rotateTo(0.2,-angle);
        //     var callFunc = cc.callFunc(function(){
        //         this.box = this._bgMaterialNode.getBoundingBoxToWorld();
        //         this._zmMaterial.effect.setProperty('worldPos', cc.v2(this.box.x,this.box.y));
        //         cc.log(">>>>>>>>>this.box:",this.box)
        //         this.initSetData();
        //     }.bind(this))
        //     this._bgMaterialNode.runAction(cc.sequence(rotateTo2,callFunc));
        // },this)

        this.node.getChildByName("button").on("click",function(){
            this.cardface.active = false;
            this.ifCardOpen = false;
        },this)
        this.initSetData();
    },

    initSetData:function(){
        this._bgMaterial.setProperty('disX', cc.v2(0.0,0.0));
        this._bgMaterial.setProperty('disY', cc.v2(0.0,0.0));
        this._bgMaterial.setProperty('xlist', cc.v3(0.0,0.0,0.0));
        this._bgMaterial.setProperty('ylist', cc.v3(0.0,0.0,0.0));

        this._zmMaterial.setProperty('disX', cc.v2(0.0,0.0));
        this._zmMaterial.setProperty('disY', cc.v2(0.0,0.0));
        this._zmMaterial.setProperty('xlist', cc.v3(0.0,0.0,0.0));
        this._zmMaterial.setProperty('ylist', cc.v3(0.0,0.0,0.0));
        this._zmMaterial.setProperty('worldSprWidth', this.box.width);
        this._zmMaterial.setProperty('worldSprHeight', this.box.height);
        this._zmMaterial.setProperty('disXSymmetricPos', cc.v2(0.0,0.0));
        this._zmMaterial.setProperty('disYSymmetricPos', cc.v2(0.0,0.0));
        this._zmMaterial.setProperty('xlistSymmetricPos', cc.v3(0.0,0.0,0.0));
        this._zmMaterial.setProperty('ylistSymmetricPos', cc.v3(0.0,0.0,0.0));

    },

    //
    getXYData:function(initPos,movePos,width,height){
        var disX = movePos.x - initPos.x;
        var disY = movePos.y - initPos.y;
        // this.shadowImage
        var XYData = {disX:cc.v2(0,0),disY:cc.v2(0,0),xlist:cc.v3(0,0,0),ylist:cc.v3(0,0,0)}
        if (disX == 0 && disY == 0){
            this.shadowImage.active = false;
        }else if (disY == 0){
            var x1 = 0;
            var x2 = (initPos.x*2 + disX)*0.5;
            this.rotation = 0;
            //水平陰影
            this.shadowImage.active = true;
            this.shadowImage.angle = 0;
            this.shadowImage.height = height;
            this.shadowImage.width = Math.min(Math.abs(disX/2),30);
            this.shadowImage.x = -width*0.5 + disX*0.5;
            this.shadowImage.y = 0;
            if (disX < 0){ //從右邊翻
                x1 = (width - ( (width - initPos.x)*2 - disX)*0.5);
                x2 = width;
                this.shadowImage.angle = 180;
                this.shadowImage.x = width*0.5 + disX*0.5;;
            }
            XYData.disX = cc.v2(x1,x2);
        }else if (disX == 0){
            var y1 = height - (initPos.y*2 +  disY)*0.5;
            var y2 = height;
            this.rotation = 90;
            //垂直陰影
            this.shadowImage.active = true;
            this.shadowImage.angle = 90;
            this.shadowImage.height = width;
            this.shadowImage.width = Math.min(Math.abs(disY/2),30);
            this.shadowImage.x = 0;
            this.shadowImage.y = -height*0.5 + disY*0.5;
            if (disY < 0){  //從上面翻
                y1 = 0;
                y2 = ((height - initPos.y)*2 -  disY)*0.5;
                this.shadowImage.angle = -90;
                this.shadowImage.y = height*0.5 + disY*0.5;
            }
            XYData.disY = cc.v2(y1,y2);
        }else{
            //获取反正切值
            var tanValue = Math.atan(disY/disX);
            // 弧度转角度
            this.rotation = 180/Math.PI*tanValue;
             cc.log(">>>>>>>this.rotation:",this.rotation)
            //角度转弧度
            // rotation = rotation - this._zmMaterialNode.angle;
            // var tanValue = rotation/(180/Math.PI);
            //获取斜边距离
            var disHy = Math.sqrt(disX*disX+disY*disY);
            //cc.log(">>>>>>>disHy:",disHy)
            //获取隐藏部分的y
            var hy = Math.abs((disHy*0.5)/Math.sin(tanValue));
            //获取隐藏部分的x
            var hx = Math.abs((disHy*0.5)/Math.cos(tanValue));

            // y = mx + b 中的m值
            var slopeM = -disX/disY;
            var midPos = cc.v2(0,0);
            midPos.x = (movePos.x+initPos.x)/2;
            midPos.y = (movePos.y+initPos.y)/2;
            // y = mx + b 中的b值，(x,y) = midPos , b = y-mx
            var cutB = midPos.y - slopeM*midPos.x;
            var cutPointX = [0,0];
            var cutPointY = [0,0];
            var cutIndex = 0;

            // 與 x = 0 的交界的y值,y=mx+b => y=cutB
            if( cutB >= 0 && cutB <= height){
                cutPointX[cutIndex] = 0;
                cutPointY[cutIndex] = cutB;
                cutIndex = cutIndex +1;
            }
            // 與 x = width 的交界的y值,y=mx+b => y=slopeM*width+cutB
            if( (slopeM * width + cutB) >= 0 && (slopeM * width + cutB) <= height){
                cutPointX[cutIndex] = width;
                cutPointY[cutIndex] = (slopeM * width + cutB);
                cutIndex = cutIndex +1;
            }
            // 與 y = 0 的交界的x值,x=(y-b)/m => x=-cutB/slopeM
            if( -cutB/slopeM >= 0 && -cutB/slopeM <= width){
                cutPointX[cutIndex] = -cutB/slopeM;
                cutPointY[cutIndex] = 0;
                cutIndex = cutIndex +1;
            }
            // 與 y = height 的交界的x值,x=(y-b)/m => x=(height-cutB)/slopeM
            if( (height-cutB)/slopeM >= 0 && (height-cutB)/slopeM <= width){
                cutPointX[cutIndex] = (height-cutB)/slopeM;
                cutPointY[cutIndex] = height;
                cutIndex = cutIndex +1;
            }

            // cc.log(">>>>>>>>>>cutPointX:",cutPointX)
            // cc.log(">>>>>>>>>>cutPointY:",cutPointY)
            this.shadowImage.active = true;
            if(movePos.x>initPos.x){
                this.shadowImage.angle = this.rotation;
            }else{
                this.shadowImage.angle = this.rotation+180;
            }
            this.shadowImage.height = Math.sqrt((cutPointX[0]-cutPointX[1])*(cutPointX[0]-cutPointX[1]) + (cutPointY[0]-cutPointY[1])*(cutPointY[0]-cutPointY[1]));
            this.shadowImage.width = Math.min(disHy/2,30);
            this.shadowImage.x = (cutPointX[0]+cutPointX[1])/2-width*0.5;
            this.shadowImage.y = (cutPointY[0]+cutPointY[1])/2-height*0.5;

            // cc.log(">>>>>>>>>>disHy:",disHy)
            // cc.log(">>>>>>>>>>disY/disX:",disY/disX)
            // cc.log(">>>>>>>>>>angle:",this.shadowImage.angle)
            // cc.log(">>>>>>>>>>hy:",hy)
            // cc.log(">>>>>>>>>>hx:",hx)
            var pos1 = cc.v2(0,0);
            var pos2 = cc.v2(0,0);
            var pos3 = cc.v2(0,0);
            if (disX > 0 && disY > 0){          //往右上翻牌
                pos1.x = 0;
                pos1.y = height;
                if (initPos.x > initPos.y){
                    pos2.x = hx　+ initPos.x;
                    pos2.y = height;
                    pos3.x = 0;
                    pos3.y = height-(((hx + initPos.x)/hx*(hy+initPos.y)));
                    //cc.log(">>>>>>>>>>>>>>往右上翻牌1")
                }else{
                    pos2.x = 0;
                    pos2.y = height - (hy + initPos.y);
                    pos3.x = (hy + initPos.y)/hy*(hx+initPos.x);
                    pos3.y = height;
                    //cc.log(">>>>>>>>>>>>>>往右上翻牌2")
                }  
            }else if (disX < 0 && disY > 0){    //往左上翻牌
                pos1.x = width;
                pos1.y = height;
                if (width - initPos.x > initPos.y){
                    pos2.x = width - (hx + width - initPos.x);
                    pos2.y = height;
                    pos3.x = width;
                    pos3.y = height-((width - pos2.x)/hx*(hy+initPos.y));
                    //cc.log(">>>>>>>>>>>>>>往左上翻牌1")
                }else{
                    pos2.x = width;
                    pos2.y = height - (hy + initPos.y);
                    pos3.x = width - (hy + initPos.y)/hy*(hx+width - initPos.x);
                    pos3.y = height;
                    //cc.log(">>>>>>>>>>>>>>往左上翻牌2")
                }
                
            }else if (disX > 0 && disY < 0){    //往右下翻牌
                pos1.x = 0;
                pos1.y = 0;
                if (initPos.x > height - initPos.y){
                    pos2.x = hx + initPos.x;
                    pos2.y = 0;
                    pos3.x = 0;
                    pos3.y = pos2.x/hx*(hy+height - initPos.y);
                    //cc.log(">>>>>>>>>>>>>>往右下翻牌1")
                }else{
                    pos2.x = 0;
                    pos2.y = hy + (height - initPos.y);
                    pos3.x = (hy + (height - initPos.y))/hy*hx+initPos.x;
                    pos3.y = 0;
                    //cc.log(">>>>>>>>>>>>>>往右下翻牌2")
                }
                    
            }else if (disX < 0 && disY < 0){    //往左下翻牌
                pos1.x = width;
                pos1.y = 0;
                if (width - initPos.x > height - initPos.y){
                    pos2.x = width - (hx + width - initPos.x);
                    pos2.y = 0;
                    pos3.x = width;
                    pos3.y = (width - pos2.x)/hx*(hy+height - initPos.y);
                    //cc.log(">>>>>>>>>>>>>>往左下翻牌1")
                }else{
                    pos2.x = width;
                    pos2.y = hy + (height - initPos.y);
                    pos3.x = width - (hy + (height - initPos.y))/hy*(hx+width-initPos.x);
                    pos3.y = 0;
                    //cc.log(">>>>>>>>>>>>>>往左下翻牌2")
                }
                    
            }

            var xlist = cc.v3(pos1.x,pos2.x,pos3.x);
            var ylist = cc.v3(pos1.y,pos2.y,pos3.y);

            XYData.xlist = xlist
            XYData.ylist = ylist

        }

        return XYData
    },

    setxy:function(){

        var initPos = cc.v2(this.initPos.x,this.initPos.y);
        var movePos = cc.v2(this.movePos.x,this.movePos.y);
        // if (this._bgMaterialNode.angle == -90){
        //     initPos.x = this.box.height - this.initPos.y;
        //     initPos.y = this.initPos.x;
        //     movePos.x = this.box.height - this.movePos.y;
        //     movePos.y = this.movePos.x;
        // }else if (this._bgMaterialNode.angle == -180){
        //     initPos.x = this.box.width - this.initPos.x;
        //     initPos.y = this.box.height - this.initPos.y;
        //     movePos.x = this.box.width - this.movePos.x;
        //     movePos.y = this.box.height - this.movePos.y;
        // }else if (this._bgMaterialNode.angle == -270){
        //     initPos.x = this.initPos.y;
        //     initPos.y = this.box.width - this.initPos.x;
        //     movePos.x = this.movePos.y;
        //     movePos.y = this.box.width - this.movePos.x;
        // }

        // cc.log(">>>>>>>>>>>>>this.initPos:",this.initPos);
        // cc.log(">>>>>>>>>>>>>this.movePos:",this.movePos);
        // cc.log(">>>>>>>>>>>>>initPos:",initPos);
        // cc.log(">>>>>>>>>>>>>movePos:",movePos);
        var xyData = this.getXYData(initPos,movePos,this.initBox.width,this.initBox.height);

        this._bgMaterial.setProperty('disX', xyData.disX);
        this._bgMaterial.setProperty('disY', xyData.disY);
        this._bgMaterial.setProperty('xlist', xyData.xlist);
        this._bgMaterial.setProperty('ylist', xyData.ylist);

        this._zmMaterial.setProperty('disX', xyData.disX);
        this._zmMaterial.setProperty('disY', xyData.disY);
        this._zmMaterial.setProperty('xlist', xyData.xlist);
        this._zmMaterial.setProperty('ylist', xyData.ylist);

        var xyData = this.getXYData(this.initPos,this.movePos,this.box.width,this.box.height);

        this._zmMaterial.setProperty('disXSymmetricPos', xyData.disX);
        this._zmMaterial.setProperty('disYSymmetricPos', xyData.disY);
        this._zmMaterial.setProperty('xlistSymmetricPos', xyData.xlist);
        this._zmMaterial.setProperty('ylistSymmetricPos', xyData.ylist);

        
    },

    
});
