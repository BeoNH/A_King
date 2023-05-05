import AKing from "./!AKing";
import Map from "./AK.Map";
import Mod from "./AK.Mod";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Cell extends cc.Component {

    private collisionManager: cc.CollisionManager;


    // LIFE-CYCLE CALLBACKS:

    start() {

      cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
      this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);

      this.collisionManager = cc.director.getCollisionManager();
      this.collisionManager.enabled = true;
      this.collisionManager.enabledDebugDraw = true;

    }


    onTouchStart(event: cc.Event.EventTouch): void {
      AKing.Ins.circleTown.position = AKing.Ins.startCircle;
      AKing.Ins.circleSell.position = AKing.Ins.startCircle;
    }


    onTouchEnd(event: cc.Event.EventTouch): void{
      this.checkBoard();
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

