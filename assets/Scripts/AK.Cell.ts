import AKing from "./!AKing";
import Map from "./AK.Map";
import Mod from "./AK.Mod";
import Town from "./AK.Town";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Cell extends cc.Component {

    start() {

      cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
      this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMousDown, this);
      this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
      this.node.on(cc.Node.EventType.MOUSE_UP, this.onMousUp, this);
    }

    //Sử dụng chuột để chon đường đi (Tối ưu: chuyển sang dạng touch để có thể build điện thoại)
    onTouchStart(event): void {
      AKing.Ins.circleTown.position = AKing.Ins.startCircle;
      AKing.Ins.circleSell.position = AKing.Ins.startCircle;
      AKing.Ins.circleSell.children[1].active = false;
      AKing.Ins.circleSell.children[2].active = false;

      
      this.node.on(cc.Node.EventType.MOUSE_MOVE,this.onMouseMove,this);
    }

    onTouchEnd(event): void{
      this.checkBoard();
      console.log(this.node.name);
      
    }

    onMousDown(event): void{
      let nameParts = this.node.name.split(" ");
      AKing.Ins.townX = parseInt(nameParts[1]);
      AKing.Ins.townY = parseInt(nameParts[2]);

      let aa = cc.find(`Town ${AKing.Ins.townX} ${AKing.Ins.townY}`,cc.Canvas.instance.node);
      if(!aa || aa.getComponent(sp.Skeleton).defaultSkin == `Red`) return;
      let town = aa.getComponent(Town);
      town.arrayPosMove = [];
    }

    onMouseMove(event): void {
      let aa = cc.find(`Town ${AKing.Ins.townX} ${AKing.Ins.townY}`,cc.Canvas.instance.node);
      if(!aa || aa.getComponent(sp.Skeleton).defaultSkin == `Red`) return;
      let town = aa.getComponent(Town);

      let node = this.node.name.split(" ");
      let rowIndex = parseInt(node[1]);
      let colIndex = parseInt(node[2]);
      
      if (event.getButton() === cc.Event.EventMouse.BUTTON_LEFT){
        //xử lý thêm điểm vào nếu node trong mảng thì lùi lại 1 ô, nếu không thì kiểm tra khác 4 và thêm vào mảng
        // câu điều kiện rút gọn (ternary operator);
        town.arrayPosMove.includes(this.node) //kiểm tra có trong mảng ko
          ? town.arrayPosMove.splice(town.arrayPosMove.indexOf(this.node) + 1) : (
            Map.Ins.board[rowIndex][colIndex] != 4 && town.arrayPosMove.push(this.node)
          );
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
        AKing.Ins.circleSell.children[1].active = true;
        AKing.Ins.circleSell.position = node;
        AKing.Ins.circleSell.setSiblingIndex(101);
      }
      else if(Map.Ins.board[AKing.Ins.posCellX][AKing.Ins.posCellY] == 4){
        AKing.Ins.circleSell.children[2].active = true;
        AKing.Ins.circleSell.position = node;
        AKing.Ins.circleSell.setSiblingIndex(101);
      }
      console.log(Map.Ins.board[AKing.Ins.posCellX][AKing.Ins.posCellY]);
    }

}

