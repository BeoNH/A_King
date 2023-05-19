import AKing from "./!AKing";
import Map from "./AK.Map";
import Mod from "./AK.Mod";
import Town from "./AK.Town";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Cell extends cc.Component {

    private collisionManager: cc.CollisionManager;


    start() {

      cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
      this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMousDown, this);
      this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
      this.node.on(cc.Node.EventType.MOUSE_UP, this.onMousUp, this);

      this.collisionManager = cc.director.getCollisionManager();
      this.collisionManager.enabled = true;
      this.collisionManager.enabledDebugDraw = true;
    }

    //Sử dụng chuột để chon đường đi (Tối ưu: chuyển sang dạng touch để có thể build điện thoại)
    onTouchStart(event): void {
      AKing.Ins.circleTown.position = AKing.Ins.startCircle;
      AKing.Ins.circleSell.position = AKing.Ins.startCircle;

      
      this.node.on(cc.Node.EventType.MOUSE_MOVE,this.onMouseMove,this);
    }
       
    onTouchEnd(event): void{
      this.checkBoard();
    }

    onMousDown(event): void{
      let nameParts = this.node.name.split(" ");
      AKing.Ins.townX = parseInt(nameParts[1]);
      AKing.Ins.townY = parseInt(nameParts[2]);
    }

    onMouseMove(event): void {
      let aa = cc.find(`Town ${AKing.Ins.townX} ${AKing.Ins.townY}`,cc.Canvas.instance.node);
      if(aa == null) return;
      let town = aa.getComponent(Town);

      if (event.getButton() === cc.Event.EventMouse.BUTTON_LEFT){
          if(town.arrayPosMove.includes(this.node)){
            let index = town.arrayPosMove.indexOf(this.node);
            town.arrayPosMove.splice(index + 1);
          }else{
            town.arrayPosMove.push(this.node);
          }
      }
    }

    onMousUp(event): void{
      AKing.Ins.checkIsTown();
      // console.log(AKing.Ins.arrayPosMove); 
    }

    checkBoard(): void{
      let nameParts = this.node.name.split(" ");
      AKing.Ins.posCellX = parseInt(nameParts[1]);
      AKing.Ins.posCellY = parseInt(nameParts[2]);

      let node = cc.v3(this.node.position.x +35, this.node.position.y +35);
      if(Map.Ins.board[AKing.Ins.posCellX][AKing.Ins.posCellY] == 1){
        AKing.Ins.circleTown.position = node;
        AKing.Ins.circleTown.setSiblingIndex(100);
      }
      else if(Map.Ins.board[AKing.Ins.posCellX][AKing.Ins.posCellY] == 2){
        AKing.Ins.circleSell.position = node;
        AKing.Ins.circleSell.setSiblingIndex(101);
      }
      console.log(Map.Ins.board[AKing.Ins.posCellX][AKing.Ins.posCellY]);
    }

}

