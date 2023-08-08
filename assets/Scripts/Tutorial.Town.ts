import Mod from "./AK.Mod";
import Popup from "./AK.Popup";
import Sounds from "./AK.Sound";
import Town from "./AK.Town";
import Tutorial from "./Tutorial";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TTown extends cc.Component {
    public static Ins: TTown;

    @property(cc.Integer)
    maxHP: number = 0;

    @property(cc.Boolean)
    attack: boolean = false;
    @property(cc.Boolean)
    support: boolean = false;

    @property(cc.Prefab)
    Spawner: cc.Prefab = null;

    public HP: number = 0;
    public myMoney: number = 23;
    
    onLoad(): void{
        TTown.Ins = this;

        this.HP = this.maxHP;
    }
    protected update(dt: number): void {
        this.onDestroyTown();
    }

    typeAction(): void{
        switch (true) {
            case this.attack:
                this.onModSpawn();
                break;
            case this.support:
                this.onMakeGold();
                break;
            default:
                break;
        }
    }

    public move(taget: cc.Node): void{
        taget.getComponent(sp.Skeleton).animation = `run`;
		cc.tween(taget)
		.to(10, {position: cc.v3(975)})
        .call(()=>{
            taget.getComponent(sp.Skeleton).animation = `attack1`;
            taget.getComponent(sp.Skeleton).timeScale = 0.6;
            this.schedule(()=>{
                let max = Tutorial.Ins.castleORC.getComponent(TTown).maxHP;
                Tutorial.Ins.castleORC.getComponent(TTown).HP -= 8;
                let hpTown = Tutorial.Ins.castleORC.getComponent(TTown).HP;
                const fillValue = hpTown / max > 0 ? hpTown / max : 0;
                Tutorial.Ins.castleORC.children[3].children[0].getComponent(cc.Sprite).fillRange = fillValue;
                if(hpTown <= 0){
                    this.unscheduleAllCallbacks();
                }
            },1);
        })
		.start();
	}

    onDestroyTown(): void{
        if(this.HP <=0){
            Tutorial.Ins.castleORC.active = false;
            Tutorial.Ins.hoverEffect(true,`destroy`,cc.v3(348));
            Tutorial.Ins.humanBuild[1].removeAllChildren();
            Sounds.Ins.effect(`destroyTown`);
            Popup.Ins.winShow(`Human`,false);
        }
    }

    onModSpawn(): void{
        this.unscheduleAllCallbacks();

        let a =  cc.instantiate(this.Spawner);
        a.parent = this.node;
        this.move(a);
    }

    onMakeGold(): void{
        this.unscheduleAllCallbacks();
        this.schedule(()=>{
            let money = this.myMoney; //tien duoc tang them

            Tutorial.Ins.changeMoney(money);

            this.node.children[0].active = true;
            this.node.children[0].position = cc.v3(0,0);
            this.node.children[0].getComponent(cc.Label).string = `${money}`;
            cc.tween(this.node.children[0]) .to(1,{position: cc.v3(0,100)}) .call(()=>{ this.node.children[0].active = false}) .start();
        },10)    
    }
}
