import AKing from "./!AKing";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Map extends cc.Component {
    public static Ins: Map;

    @property(cc.Prefab)
    squere: cc.Prefab = null;

    @property(cc.Integer)
    col: number = 9;
    @property(cc.Integer)
    row: number = 15; 

    public board: number[][] = [];

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Map.Ins = this;

        this.Chessboard();

        // this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchStart, this);
        // this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    // update (dt) {}
    Chessboard(): void{
        for (let x = 0; x < this.row; x++) {
            this.board[x] = [];
            for (let y = 0; y < this.col; y++) {
                let a = cc.instantiate(this.squere);
                a.parent = this.node;
                a.setContentSize(70,70);
                a.name = `Cell ${x} ${y}`;
                this.board[x][y] = 0;
                a.position = new cc.Vec3(x*70 - this.node.width/2, y*70 - this.node.height/2);
                a.setSiblingIndex(0);
            }
        }
    }
}
