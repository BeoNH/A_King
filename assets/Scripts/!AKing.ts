import Map from "./AK.Map";
import Town from "./AK.Town";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AKing extends cc.Component {
    public static Ins: AKing;

    @property(cc.SpriteFrame)
    landScapesFrame: cc.SpriteFrame[] = [];
    @property(cc.Node)
    circleTown:cc.Node = null;
    @property(cc.Node)
    circleSell:cc.Node = null;
    @property(cc.Node)
    map: cc.Node = null;

    @property({ readonly: true, editorOnly: true, serializable: false })
    private HUMAN: string = "HUMAN";
    @property(cc.Node)
    castleHuman: cc.Node = null;
    @property(cc.Prefab)
    humanBuild: cc.Prefab[] = [];
    @property(cc.Prefab)
    archer: cc.Prefab = null;
    @property(cc.Prefab)
    peasant: cc.Prefab = null;
    

    public startCircle: cc.Vec3 = null;   

    public posCellX: number;
    public posCellY: number;

    public townX: number;
    public townY: number;

    public castleX: number;
    public castleY: number;

    public graphics: cc.Graphics[] = [];

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        AKing.Ins = this;
    }

    start () {
        this.startCircle = this.circleTown.position;

        this.randomBase();
        this.checkLandscapes();     
    }

    protected update(dt: number): void {
        Map.Ins.board[this.castleX][this.castleY] = -1;
    }

    //thay doi cac o xung quanh TAM trong mang thanh gia tri z
    changeLands(x:number , y:number, z:number): void{
        Map.Ins.board[x][y] = z; //TAM
        if (x - 1 >= 0) { 
            if(Map.Ins.board[x-1][y] !== 2){
                Map.Ins.board[x-1][y] = z;
            }           
            if (y - 1 >= 0 && Map.Ins.board[x-1][y-1] !== 2) {
                Map.Ins.board[x-1][y-1] = z;
            }
        }
        if (y - 1 >= 0) {
            if(Map.Ins.board[x][y-1] !==2){
                Map.Ins.board[x][y-1] = z ;
            }
            if (x + 1 < Map.Ins.board.length && Map.Ins.board[x+1][y-1] !==2) {
                Map.Ins.board[x+1][y-1] = z;
            }
        }
        if (x + 1 < Map.Ins.board.length) {
            if(Map.Ins.board[x+1][y] !==2){
                Map.Ins.board[x+1][y] = z;
            }
            if (y + 1 < Map.Ins.board[0].length && Map.Ins.board[x+1][y+1] !== 2) {
                Map.Ins.board[x+1][y+1] = z;
            }
        }
        if (y + 1 < Map.Ins.board[0].length) {
            if(Map.Ins.board[x][y+1] !== 2){
                Map.Ins.board[x][y+1] = z;
            }
            if (x - 1 >= 0 && Map.Ins.board[x-1][y+1] !== 2) {
                Map.Ins.board[x-1][y+1] = z;
            }
        }
    }  

    randomBase(): void{
        this.castleX = ~~(Math.random()*2 +2);
        this.castleY = ~~(Math.random()*5 +2);

        let c = cc.find(`Map/Cell ${this.castleX} ${this.castleY}`, this.node);
        this.castleHuman.name = `Town ${this.castleX} ${this.castleY}`;
        this.castleHuman.position = cc.v3(c.position.x +35, c.position.y +35);

        this.changeLands(this.castleX, this.castleY, 1);
        
  
        let cellPos = cc.find(`Map/Cell ${this.castleX} ${this.castleY}`, this.node);
        console.log(cellPos);
    }

    checkLandscapes(): void{
        Map.Ins.board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                let cellPos = cc.find(`Map/Cell ${rowIndex} ${colIndex}`, this.node).getComponent(cc.Sprite);
                let a = Map.Ins.board;

                if (cell === 1 || cell === 2 || cell === -1) {
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
                else{
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
        d.setSiblingIndex(50);
        this.changeLands(this.posCellX, this.posCellY, 1);
        this.checkLandscapes();
        Map.Ins.board[this.posCellX][this.posCellY] = 2;
    }

    onSell(): void{
        this.circleSell.position = this.startCircle;

        let a = cc.find(`Town ${this.posCellX} ${this.posCellY}`, this.node);
        a.destroy();

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

        for (let i = 0; i < Map.Ins.row ; i++) {
            for (let j = 0; j < Map.Ins.col; j++) {
                if(Map.Ins.board[i][j] == 2){
                    this.changeLands(i,j,1);
                    Map.Ins.board[i][j] = 2;
                }
            } 
        }
        this.checkLandscapes();
    }

    checkIsTown(): void{
        let aa = this.node.getChildByName(`Town ${this.townX} ${this.townY}`);        
        if(aa == null) return;
        let town = aa.getComponent(Town);
        if(town.arrayPosMove.length <= 0) return;
  
        let a = town.arrayPosMove[0].name.split(" ");
        let b = town.arrayPosMove[town.arrayPosMove.length-1].name.split(" ");
  
        if (
          (Map.Ins.board[parseInt(b[1])][parseInt(b[2])] !== 2 && Map.Ins.board[parseInt(b[1])][parseInt(b[2])] !== -1) ||
          (Map.Ins.board[parseInt(a[1])][parseInt(a[2])] !== 2) ||
          !town.attack) 
        {
            town.arrayPosMove = [];
        }

        town.typeAction();
      }
}
