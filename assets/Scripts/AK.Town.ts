import AKing from "./!AKing";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Town extends cc.Component {
    public static Ins: Town;

    @property(cc.Boolean)
    attack: boolean = false;
    @property(cc.Boolean)
    defense: boolean = false;
    @property(cc.Boolean)
    support: boolean = false;

    @property(cc.Prefab)
    Spawner: cc.Prefab = null;

    @property(cc.Node)
    drawwww: cc.Node = null;

    public arrayPosMove: cc.Node[] = [];
    
    onLoad(): void{
        Town.Ins = this;

        this.typeAction();
    }

    update(dt): void{
        this.Draw(this.arrayPosMove);
        if(this.arrayPosMove.length <= 0 && this.attack)
        {
            this.node.destroyAllChildren();
        }
    }

    typeAction(): void{
        switch (true) {
            case this.attack:
                this.onModSpawn();
                break;
            case this.defense:
                this.onDefense();
                break;
            case this.support:
                this.onMakeGold();
                break;
            default:
                break;
        }
    }

    Draw(line: cc.Node[]): void{
        if(this.drawwww == null) return;
        let a = this.drawwww.getComponent(cc.Graphics);
        a.clear();

        if(line !== null){
            for (let i = 0; i < line.length-1; i++) {
                a.lineWidth = 8;
                a.moveTo(line[i].position.x + 25,line[i].position.y + 45);
                a.lineTo(line[i+1].position.x+ 25,line[i+1].position.y+ 45);
            }
            a.stroke();
            this.drawwww.parent = AKing.Ins.map;
        }
    }

    onModSpawn(): void{
        this.unscheduleAllCallbacks();
        this.schedule(()=>{
            if(this.arrayPosMove.length > 0){
                let a =  cc.instantiate(this.Spawner);
                a.parent = this.node;
                let worldPos = this.node.convertToWorldSpaceAR(cc.Vec3.ZERO);
                a.position = worldPos;
            }
        },5)
    }

    onMakeGold(): void{
        this.unscheduleAllCallbacks();
        this.schedule(()=>{
            let gold = AKing.Ins.castleHuman.children[2].getComponent(cc.Label);
            gold.string = `${parseInt(gold.string)+15}`;
            this.node.children[0].active = true;
            this.node.children[0].position = cc.v3(0,0);
            cc.tween(this.node.children[0]) .to(1,{position: cc.v3(0,100)}) .call(()=>{ this.node.children[0].active = false}) .start();
        },10)    
    }

    onDefense(): void{}
}
