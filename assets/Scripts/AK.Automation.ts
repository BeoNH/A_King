import AKing from "./!AKing";
import Map from "./AK.Map";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AI extends cc.Component {
    public static Ins: AI;

    @property(cc.Node)
    hoverOC: cc.Node = null;

    private castleOcX: number;
    private castleOcY: number;

    private idxTangTien: number = 0;
    private luongTienTang: number[] = [0,120,240,360,480];

    onLoad(): void{
        AI.Ins = this;
    }

    start(): void{

        this.randomBaseOc();
        AKing.Ins.checkLandscapes();

        //this.buildOc(AKing.Ins.orcBuild[1], `GoldMine`);
        this.buildOc(AKing.Ins.orcBuild[2], `Warrior`);

    }

    update(dt): void{
        Map.Ins.board[this.castleOcX][this.castleOcY] = -3;
    }


    randomBaseOc(): void{
        this.castleOcX = ~~(Math.random()*2 +11);
        this.castleOcY = ~~(Math.random()*5 +2);

        let c = cc.find(`Map/Cell ${this.castleOcX} ${this.castleOcY}`, cc.Canvas.instance.node);
        AKing.Ins.castleORC.name = `Town ${this.castleOcX} ${this.castleOcY}`;
        AKing.Ins.castleORC.position = cc.v3(c.position.x +35, c.position.y +35);

        AKing.Ins.changeLands(this.castleOcX, this.castleOcY, -1);
    }

    getRandomTownPos(node: cc.Node):void {
        let arr: cc.Node[] = [];
        Map.Ins.board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                let cellNode = cc.find(`Map/Cell ${rowIndex} ${colIndex}`, cc.Canvas.instance.node);
                if(cell === -1){
                    arr.push(cellNode);
                }
            });
        });

        if(!arr) return;
        let rand = ~~(Math.random()*arr.length);
        let nodePos = arr[rand];
        let name = nodePos.name.split(" ");
        node.position = cc.v3(nodePos.position.x+35, nodePos.position.y+35);
        node.name = `Town ${name[1]} ${name[2]}`;
        console.log(arr);

        AKing.Ins.changeLands(parseInt(name[1]),parseInt(name[2]),-1);
        Map.Ins.board[parseInt(name[1])][parseInt(name[2])] = -2;
        AKing.Ins.checkLandscapes();
    }

    changeMoney(money: number): void{
        let gold = AKing.Ins.castleORC.children[2].getComponent(cc.Label);
        gold.string = `${parseInt(gold.string)+money}`;
    }

    buildOc(node: cc.Prefab, name: string): void{
        let a = cc.instantiate(node);
        a.parent = cc.Canvas.instance.node;
        a.setSiblingIndex(4);

        if(name == `GoldMine`){
            this.changeMoney(-170 - this.luongTienTang[this.idxTangTien]);
            this.idxTangTien++;

            let rand = ~~(Math.random()*3-1);
            let b = cc.find(`Map/Cell ${this.castleOcX+1} ${this.castleOcY+rand}`, cc.Canvas.instance.node);
            a.position = cc.v3(b.position.x + 35, b.position.y+35);
            a.name = `Town ${this.castleOcX+1} ${this.castleOcY+rand}`;

            AKing.Ins.changeLands(this.castleOcX+1,this.castleOcY +rand,-1);
            Map.Ins.board[this.castleOcX+1][this.castleOcY+ rand] = -2;
            AKing.Ins.checkLandscapes();
        }
        else if(name == `Warrior`)
        {
            this.changeMoney(-200 - this.luongTienTang[this.idxTangTien]);
            this.idxTangTien++;
            this.getRandomTownPos(a);
        }
        
        this.hoverEffectOc(true,`building`,a.position);
        AKing.Ins.isBuilding = true;
        this.DemNguocTimerIn(a);
    }

    hoverEffectOc( status: boolean, ani?: string, pos?: cc.Vec3): void{
        this.hoverOC.active = status;
        this.hoverOC.setSiblingIndex(100);
        if(status){
            this.hoverOC.getComponent(sp.Skeleton).animation = `${ani}`;
            this.hoverOC.position = pos;
        }
        else{
            this.hoverOC.position = AKing.Ins.startCircle;
        }

        if(ani === `destroy`){
            this.hoverOC.getComponent(sp.Skeleton).loop = false;
            this.scheduleOnce(()=>{
                this.hoverEffectOc(false);
                this.hoverOC.getComponent(sp.Skeleton).loop = true;
            },1);
        }
    }

    DemNguocTimerIn(target: cc.Node): void{
        let time = cc.instantiate(AKing.Ins.timer);
        time.parent = cc.Canvas.instance.node;
        time.position = target.position;
        time.scale = 0;

        cc.tween(time).to(.5, {scale: 1, position: cc.v3(time.position.x,target.position.y+75)}).start();
        
        let ani = time.getComponent(cc.Animation);
        time.getComponent(cc.Animation).getAnimationState(`timer`).duration = 8;
        ani.on(`finished`, ()=>{
            time.destroy();
            this.hoverEffectOc(false);
            AKing.Ins.isBuilding = false;
        });
        ani.play();
        
    }
}
