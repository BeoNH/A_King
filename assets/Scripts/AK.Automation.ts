import AKing from "./!AKing";
import Map from "./AK.Map";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    public castleOcX: number;
    public castleOcY: number;


    start(): void{

        this.randomBaseOc();
        AKing.Ins.checkLandscapes();
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
}
