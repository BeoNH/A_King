import Map from "./AK.Map";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AKing extends cc.Component {
    public static Ins: AKing;

    
    @property(cc.Prefab)
    landPrb: cc.Prefab = null;
    @property(cc.SpriteFrame)
    landScapesFrame: cc.SpriteFrame[] = [];
    @property(cc.Node)
    circleTown:cc.Node = null;
    @property(cc.Node)
    circleSell:cc.Node = null;

    
    @property(cc.Prefab)
    archer: cc.Prefab = null;

    public startCircle: cc.Vec3 = null;   

    public posCellX: number;
    public posCellY: number;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        AKing.Ins = this;
    }

    start () {
        this.startCircle = this.circleTown.position;

        this.randomBase();
        this.checkLandscapes();
    }

    update (dt) {
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
        let randX = ~~(Math.random()*2 +2);
        let randY = ~~(Math.random()*5 +2);

        this.changeLands(randX,randY,1);
        let cellPos = cc.find(`Map/Cell ${randX} ${randY}`, this.node);
        console.log(cellPos);
    }

    checkLandscapes(): void{
        Map.Ins.board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                let cellPos = cc.find(`Map/Cell ${rowIndex} ${colIndex}`, this.node).getComponent(cc.Sprite);
                let a = Map.Ins.board;
                if (cell === 1 || cell === 2) {
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


    onArcher(): void{
        let b = cc.instantiate(this.archer);
        let c = cc.find(`Map/Cell ${this.posCellX} ${this.posCellY}`, this.node);
        b.parent = c;

        this.changeLands(this.posCellX, this.posCellY, 1);
        this.checkLandscapes();
        Map.Ins.board[this.posCellX][this.posCellY] = 2;
  
        this.circleTown.position = this.startCircle;
    }
}
