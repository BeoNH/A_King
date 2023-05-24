import AI from "./AK.Automation";
import Map from "./AK.Map";
import Town from "./AK.Town";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AKing extends cc.Component {
    public static Ins: AKing;
   
    @property(cc.Node)
    circleTown:cc.Node = null;
    @property(cc.Node)
    circleSell:cc.Node = null;
    @property(cc.Node)
    map: cc.Node = null;
    @property(cc.Prefab)
    timer: cc.Prefab = null;
    @property(cc.Node)
    hoverHM: cc.Node = null;

    @property({ readonly: true, editorOnly: true, serializable: false })
    private HUMAN: string = "---------------- HUMAN -------------------";
    @property(cc.Node)
    castleHuman: cc.Node = null;
    @property(cc.SpriteFrame)
    landScapesFrame: cc.SpriteFrame[] = [];
    @property(cc.Prefab)
    humanBuild: cc.Prefab[] = [];

    @property({ readonly: true, editorOnly: true, serializable: false })
    private ORC: string = "---------------- ORC -------------------";
    @property(cc.Node)
    castleORC: cc.Node = null;
    @property(cc.SpriteFrame)
    landScapesFrameOc: cc.SpriteFrame[] = [];
    @property(cc.Prefab)
    orcBuild: cc.Prefab[] = [];
    

    public startCircle: cc.Vec3 = null;   

    public posCellX: number;
    public posCellY: number;

    public townX: number;
    public townY: number;

    public castleHMX: number;
    public castleHMY: number;

    public isBuilding: boolean = false;

    private collisionManager: cc.CollisionManager;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        AKing.Ins = this;
    }

    start () {

        this.collisionManager = cc.director.getCollisionManager();
        this.collisionManager.enabled = true;
        this.collisionManager.enabledDebugDraw = true;

        this.startCircle = this.circleTown.position;

        this.randomBase();
        this.checkLandscapes();     
    }

    protected update(dt: number): void {
        Map.Ins.board[this.castleHMX][this.castleHMY] = 3;
    }

    //thay doi cac o xung quanh TAM trong mang thanh gia tri z
    changeLands(x:number , y:number, z:number): void{
        let nope = [2,-2,3,-3];
        Map.Ins.board[x][y] = z; //TAM
        if (x - 1 >= 0) { 
            if(!nope.includes(Map.Ins.board[x-1][y])){
                Map.Ins.board[x-1][y] = z;
            }           
            if (y - 1 >= 0 && !nope.includes(Map.Ins.board[x-1][y-1])) {
                Map.Ins.board[x-1][y-1] = z;
            }
        }
        if (y - 1 >= 0) {
            if(!nope.includes(Map.Ins.board[x][y-1])){
                Map.Ins.board[x][y-1] = z ;
            }
            if (x + 1 < Map.Ins.board.length && !nope.includes(Map.Ins.board[x+1][y-1])) {
                Map.Ins.board[x+1][y-1] = z;
            }
        }
        if (x + 1 < Map.Ins.board.length) {
            if(!nope.includes(Map.Ins.board[x+1][y])){
                Map.Ins.board[x+1][y] = z;
            }
            if (y + 1 < Map.Ins.board[0].length && !nope.includes(Map.Ins.board[x+1][y+1])) {
                Map.Ins.board[x+1][y+1] = z;
            }
        }
        if (y + 1 < Map.Ins.board[0].length) {
            if(!nope.includes(Map.Ins.board[x][y+1])){
                Map.Ins.board[x][y+1] = z;
            }
            if (x - 1 >= 0 && !nope.includes(Map.Ins.board[x-1][y+1])) {
                Map.Ins.board[x-1][y+1] = z;
            }
        }
    }  

    randomBase(): void{
        this.castleHMX = ~~(Math.random()*2 +2);
        this.castleHMY = ~~(Math.random()*5 +2);

        let c = cc.find(`Map/Cell ${this.castleHMX} ${this.castleHMY}`, this.node);
        this.castleHuman.name = `Town ${this.castleHMX} ${this.castleHMY}`;
        this.castleHuman.position = cc.v3(c.position.x +35, c.position.y +35);

        this.changeLands(this.castleHMX, this.castleHMY, 1);
    }

    checkLandscapes(): void{
        Map.Ins.board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                let cellPos = cc.find(`Map/Cell ${rowIndex} ${colIndex}`, this.node).getComponent(cc.Sprite);
                let a = Map.Ins.board;

                if (cell === 1 || cell === 2 || cell === 3) {
                    if(a[rowIndex+1][colIndex]==0 && a[rowIndex][colIndex+1]==0){
                        cellPos.spriteFrame = this.landScapesFrame[1];
                    }
                    else if(rowIndex-1>=0 && a[rowIndex-1][colIndex]==0 && a[rowIndex][colIndex+1]==0){
                        cellPos.spriteFrame = this.landScapesFrame[3];
                    }
                    else if(rowIndex-1>=0 && colIndex-1>=0 && a[rowIndex-1][colIndex]==0 && a[rowIndex][colIndex-1]==0){
                        cellPos.spriteFrame = this.landScapesFrame[2];
                    }
                    else if(colIndex-1>=0 && a[rowIndex+1][colIndex]==0 && a[rowIndex][colIndex-1]==0){
                        cellPos.spriteFrame = this.landScapesFrame[4];
                    }
                    else
                    {
                        let arr = Math.random();
                        let rand = arr <0.5 ? 0 : 5;
                        cellPos.spriteFrame = this.landScapesFrame[rand];
                    }
                }
                if(cell === -1 || cell === -2 || cell === -3){
                    if(rowIndex+1<a.length && colIndex+1<row.length && a[rowIndex+1][colIndex]==0 && a[rowIndex][colIndex+1]==0){
                        cellPos.spriteFrame = this.landScapesFrameOc[1];
                    }
                    else if(colIndex+1<row.length && a[rowIndex-1][colIndex]==0 && a[rowIndex][colIndex+1]==0){
                        cellPos.spriteFrame = this.landScapesFrameOc[3];
                    }
                    else if(a[rowIndex-1][colIndex]==0 && a[rowIndex][colIndex-1]==0){
                        cellPos.spriteFrame = this.landScapesFrameOc[2];
                    }
                    else if(rowIndex+1<a.length && a[rowIndex+1][colIndex]==0 && a[rowIndex][colIndex-1]==0){
                        cellPos.spriteFrame = this.landScapesFrameOc[4];
                    }
                    else
                    {
                        let arr = Math.random();
                        let rand = arr <0.5 ? 0 : 5;
                        cellPos.spriteFrame = this.landScapesFrameOc[rand];
                    }
                }
                if(cell === 0){
                    cellPos.spriteFrame = null;
                }
            });
          });        
    }

    onGoldMine(): void{
        this.BuildTown(this.humanBuild[1],`GoldMine`);
    }
    
    onPeasant(): void{
        this.BuildTown(this.humanBuild[2],`Peasant`);
    }

    onArcher(): void{
        this.BuildTown(this.humanBuild[3],`Archer`);
    }

    BuildTown(node: cc.Prefab, name: string): void{
        this.circleTown.position = this.startCircle;

        //xử lý trừ tiền
        let a = cc.find(`${name}/lnCoin`, this.circleTown).getComponent(cc.Label);
        let b = this.castleHuman.children[2].getComponent(cc.Label);
        let c = parseInt(b.string)-parseInt(a.string);
        if(c<0) return;
        b.string = `${c}`;

        //xử lý tăng tiền mua tháp
        let up = this.circleTown.getComponentsInChildren(cc.Label);
        for (let i = 0; i < up.length; i++) {
            up[i].string =  `${parseInt(up[i].string)+120}`;
        }

        //xử lý spawn tháp
        let d = cc.instantiate(node);
        let e = cc.find(`Map/Cell ${this.posCellX} ${this.posCellY}`, this.node);
        d.name = `Town ${this.posCellX} ${this.posCellY}`;
        d.parent = this.node;
        d.position = cc.v3(e.position.x +35, e.position.y +35);
        d.setSiblingIndex(4);
        this.hoverEffect(true,`building`,d.position);
        this.isBuilding = true;
        this.DemNguocTimerIn(d);
        this.changeLands(this.posCellX, this.posCellY, 1);
        this.checkLandscapes();
        Map.Ins.board[this.posCellX][this.posCellY] = 2;
    }

    onSell(): void{
        this.circleSell.position = this.startCircle;
        if(this.isBuilding) return;

        let node = cc.find(`Town ${this.posCellX} ${this.posCellY}`, this.node);
        node.getComponent(Town).drawwww?.destroy();
        node?.destroy();
        this.hoverEffect(true,`destroy`,node.position);


        //xử lý bán tháp
        let b = this.circleSell.children[1].children[0].getComponent(cc.Label);
        let c = this.castleHuman.children[2].getComponent(cc.Label);
        c.string = `${parseInt(c.string)+parseInt(b.string)}`; 

        //xử lý giảm tiền mua tháp
        let down = this.circleTown.getComponentsInChildren(cc.Label);
        for (let i = 0; i < down.length; i++) {
            down[i].string =  `${parseInt(down[i].string)-120}`;
        }
        
        this.changeLands(this.posCellX,this.posCellY,0);
        this.checkLandscapes();
    }

    checkIsTown(): void{
        let aa = this.node.getChildByName(`Town ${this.townX} ${this.townY}`);        
        if(!aa) return;
        let town = aa.getComponent(Town);
        if(!town) return;
        if(town.arrayPosMove.length <= 0) return;
        
        let b = town.arrayPosMove[town.arrayPosMove.length-1].name.split(" ");
        let bb = this.node.getChildByName(`Town ${parseInt(b[1])} ${parseInt(b[2])}`);        
        
        //Điều kiện xử lsy tháp khi nhấc chuột
        if (
          (Map.Ins.board[parseInt(b[1])][parseInt(b[2])] !== -2 && Map.Ins.board[parseInt(b[1])][parseInt(b[2])] !== -3) ||
          (Map.Ins.board[this.townX][this.townY] !== 2) ||
          !town.attack || this.isBuilding ||
          aa.getComponent(sp.Skeleton).defaultSkin === bb.getComponent(sp.Skeleton).defaultSkin)
        {
            town.arrayPosMove = [];
        }        
        town.typeAction();
    }

    hoverEffect( status: boolean, ani?: string, pos?: cc.Vec3): void{
        this.hoverHM.active = status;
        this.hoverHM.setSiblingIndex(100);
        if(status){
            this.hoverHM.getComponent(sp.Skeleton).animation = `${ani}`;
            this.hoverHM.position = pos;
        }
        else{
            this.hoverHM.position = this.startCircle;
        }

        if(ani === `destroy`){
            this.hoverHM.getComponent(sp.Skeleton).loop = false;
            this.scheduleOnce(()=>{
                this.hoverEffect(false);
                this.hoverHM.getComponent(sp.Skeleton).loop = true;
            },1);
        }
    }

    DemNguocTimerIn(target: cc.Node): void{
        let time = cc.instantiate(this.timer);
        time.parent = this.node;
        time.position = target.position;
        time.scale = 0;

        cc.tween(time).to(.5, {scale: 1, position: cc.v3(time.position.x,target.position.y+75)}).start();
        
        let ani = time.getComponent(cc.Animation);
        time.getComponent(cc.Animation).getAnimationState(`timer`).duration = 8;
        ani.on(`finished`, ()=>{
            time.destroy();
            this.hoverEffect(false);
            this.isBuilding = false;
        });
        ani.play();
        
    }
}
