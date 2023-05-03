import Cell from "./AK.Cell";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Landscape extends cc.Component {

    @property(cc.Prefab)
    archerPrb: cc.Prefab = null;
    @property(cc.Prefab)
    landPrb: cc.Prefab = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);

    }

    // update (dt) {}

    onTouchStart(event: cc.Event.EventTouch): void {
        if(this.node.children[0].active == true){
            this.node.children[0].active = false;
        }
    }

        
    onTouchEnd(event: cc.Event.EventTouch): void {
        if(this.node.children[0].active == false){
            this.node.children[0].active = true;
        }else{
            this.node.children[0].active = false;
        }
      }

      onArcher(): void{
        let a = cc.instantiate(this.landPrb);
        cc.Canvas.instance.node.addChild(a);
        a.position = this.node.position;

        let b = cc.instantiate(this.archerPrb);
        cc.Canvas.instance.node.addChild(b);
        b.position = this.node.position;

        this.node.destroy();

      }
}
