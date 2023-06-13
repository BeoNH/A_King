import AKing from "./!AKing";
import Map from "./AK.Map";
import Town from "./AK.Town";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AI extends cc.Component {
    public static Ins: AI;

    @property(cc.Node)
    hoverOC: cc.Node = null;

    private isBuildOc: boolean = false;

    private castleOcX: number;
    private castleOcY: number;

    private idxTangTien: number = 0;
    private luongTienTang: number[] = [0,120,240,360,480,600,720,840,960];

    onLoad(): void{
        AI.Ins = this;
    }

    start(): void{

        this.randomBaseOc();
        AKing.Ins.checkLandscapes();

        this.buildOc(AKing.Ins.orcBuild[1], `GoldMine`);
    }

    update(dt): void{
        Map.Ins.board[this.castleOcX][this.castleOcY] = -3;
        let rand = ~~(Math.random() < 0.5 ? 2 : 3);
        this.buildOc(AKing.Ins.orcBuild[rand], `Warrior`);
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
                if(cell === -1 && cellNode.name != `Cell ${this.castleOcX} ${this.castleOcY}`){
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

        AKing.Ins.changeLands(parseInt(name[1]),parseInt(name[2]),-1);
        Map.Ins.board[parseInt(name[1])][parseInt(name[2])] = -2;
        AKing.Ins.checkLandscapes();
    }

    changeMoney(money: number): void{
        let gold = AKing.Ins.castleORC.children[2].getComponent(cc.Label);
        gold.string = `${parseInt(gold.string)+money}`;
    }

    buildOc(node: cc.Prefab, name: string): void{
        if(this.isBuildOc == true) return;
        
        let money = cc.find(`${name}/lnCoin`, AKing.Ins.moneyBarTowers).getComponent(cc.Label).string;
        let cost = - parseInt(money) - this.luongTienTang[this.idxTangTien];
        let caslte = AKing.Ins.castleORC.children[2].getComponent(cc.Label).string;
        if(parseInt(caslte) < -cost) return;
        this.idxTangTien++;
        
        this.isBuildOc = true;
        let a = cc.instantiate(node);
        a.parent = cc.Canvas.instance.node;
        a.setSiblingIndex(6);

        if(name == `GoldMine` || name == `Tower`){
            this.getRandomTownPos(a);
        }
        else if(name == `Warrior` || name == `Hunter`)
        {
            this.getRandomTownPos(a);

            //Tự tìm đường đến điểm chỉ định.
            this.getWayPosMove(a, AKing.Ins.castleHuman);
        }
        
        this.changeMoney(cost);
        this.hoverEffectOc(true,`building`,a.position);
        this.DemNguocTimerIn(a);
    }

    getWayPosMove(startPos: cc.Node , endPos: cc.Node): void{
        let attack = startPos.getComponent(Town);
        let nameS = startPos.name.split(" ");
        let start = [parseInt(nameS[1]), parseInt(nameS[2])];

        let nameE = endPos.name.split(" ");
        let end = [parseInt(nameE[1]), parseInt(nameE[2])];

        aStarSearch(Map.Ins.board, start, end);

        let b = getPath();
        while (b.length > 0) {
            let pos = b[0];
            b.shift();
            let c = cc.find(`Map/Cell ${pos[0]} ${pos[1]}`, cc.Canvas.instance.node);

            attack.arrayPosMove.push(c);
        }
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
            this.idxTangTien--;
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
            this.isBuildOc = false;
            this.hoverEffectOc(false);
            target.getComponent(Town).typeAction();
        });
        ani.play();       
    }
}
