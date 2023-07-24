import Sounds from "./AK.Sound";
import Town from "./AK.Town";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Tutorial extends cc.Component {
    public static Ins: Tutorial;

    @property(cc.Node)
    Barrier: cc.Node = null;
    @property(cc.Prefab)
    timer: cc.Prefab = null;
    @property(cc.Prefab)
    barrierPre: cc.Prefab[] = [];
    @property(cc.Node)
    ping: cc.Node = null;

    
    @property({ readonly: true, editorOnly: true, serializable: false })
    private HUMAN: string = "---------------- HUMAN -------------------";
    @property(cc.Node)
    castleHuman: cc.Node = null;
    @property(cc.Node)
    circleTown:cc.Node = null;
    @property(cc.Node)
    circleSell:cc.Node = null;
    @property(cc.Node)
    hoverHM: cc.Node = null;
    @property(cc.Prefab)
    humanBuild: cc.Prefab[] = [];
    
    @property(cc.Node)
    castleORC: cc.Node = null;
    

    public startCircle: cc.Vec3 = null;   

    public posCellX: number;
    public posCellY: number;

    public townX: number;
    public townY: number;

    public isBuilding: boolean = false;
    private collisionManager: cc.CollisionManager;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Tutorial.Ins = this;

        this.circleTown.active = true;
        this.circleSell.active = true;

        this.castleHuman.position = cc.v3(-348,-5);
        this.castleORC.position = cc.v3(348,-5);
    }

    start () {
        // this.collisionManager = cc.director.getCollisionManager();
        // this.collisionManager.enabled = true;
        // this.collisionManager.enabledDebugDraw = false;

        this.startCircle = cc.v3(0,1500);

        cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    protected update(dt: number): void {}

    onGoldMine(): void{
        this.BuildTown(this.humanBuild[1],`GoldMine`,cc.v3());
    }
    
    onPeasant(): void{
        this.BuildTown(this.humanBuild[2],`Peasant`,cc.v3());
    }

    BuildTown(node: cc.Prefab, name: string, pos: cc.Vec3): void{
        this.circleTown.position = this.startCircle;
        if(this.isBuilding) return;

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
        d.parent = this.node;
        d.position = cc.v3(pos.x +35, pos.y +35);
        //set vị trí thap theo thu tu.
        this.hoverEffect(true,`building`,d.position);

        Sounds.Ins.effect(`build`);
    }

    onSell(): void{
        this.circleSell.position = this.startCircle;
        if(this.isBuilding) return;

        let node = cc.find(`Town ${this.posCellX} ${this.posCellY}`, this.node);
        node.getComponent(Town).drawwww?.destroy();
        node?.destroy();
        this.hoverEffect(true,`destroy`,node.position);
        Sounds.Ins.effect(`destroyTown`);


        //xử lý bán tháp
        let b = this.circleSell.children[1].children[0].getComponent(cc.Label);
        this.changeMoney(parseInt(b.string));

        //xử lý giảm tiền mua tháp
        let down = this.circleTown.getComponentsInChildren(cc.Label);
        for (let i = 0; i < down.length; i++) {
            down[i].string =  `${parseInt(down[i].string)-120}`;
        }
        
    }

    onDestroyBarrrier(): void{
        this.circleSell.position = this.startCircle;

        let b = this.circleSell.children[2].children[0].getComponent(cc.Label);

        this.changeMoney(parseInt(b.string)); 
        let node = this.Barrier;
        Sounds.Ins.effect(`destroyBarrier`);
        this.hoverEffect(true,`removingTree`, node.position);
        this.DemNguocTimerIn(node,15);

    }

    DemNguocTimerIn(target: cc.Node, timeCount: number): void{
        this.isBuilding = true;
        let time = cc.instantiate(this.timer);
        time.parent = this.node;
        time.position = target.position;
        time.scale = 0;

        cc.tween(time).to(.5, {scale: 1, position: cc.v3(time.position.x,target.position.y+75)}).start();
        
        let ani = time.getComponent(cc.Animation);
        time.getComponent(cc.Animation).getAnimationState(`timer`).duration = timeCount;
        ani.on(`finished`, ()=>{
            time.destroy();
            this.hoverEffect(false);
            this.isBuilding = false;
            Sounds.Ins.effectStop();
            if(target.parent === this.Barrier){
                target.destroy();
            }
            else if(target.getComponent(Town).support || target.getComponent(Town).defense){
                target.getComponent(Town).typeAction();
            }
        });
        ani.play();  
    }

    //xử lý các hiệu ứng khi tương tác
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

    changeMoney(money: number): void{
        let gold = Tutorial.Ins.castleHuman.children[2].getComponent(cc.Label);
        gold.string = `${parseInt(gold.string)+money}`;
    }

    onTouchStart(event): void {
        this.circleTown.position = this.startCircle;
        this.circleSell.position = this.startCircle;
        this.circleSell.children[1].active = false;
        this.circleSell.children[2].active = false;
    }

    onClick(event): void{
        let a = cc.Canvas.instance.node;

        this.circleTown.position = a.convertToNodeSpaceAR(event.getCurrentTarget().convertToWorldSpaceAR(cc.Vec3.ZERO));
        this.circleTown.setSiblingIndex(80);
    }
    onClickSell(event): void{
        this.circleSell.children[2].active = true;
        this.circleSell.position = event.getCurrentTarget();
        this.circleSell.setSiblingIndex(81);
    }

}
