import popupTutorial from "./AK.Popup.Tutorial";
import Sounds from "./AK.Sound";
import Town from "./AK.Town";
import TTown from "./Tutorial.Town";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Tutorial extends cc.Component {
    public static Ins: Tutorial;

    @property(cc.Node)
    Barrier: cc.Node = null;
    @property(cc.Node)
    map: cc.Node = null;
    @property(cc.Prefab)
    timer: cc.Prefab = null;
    @property(cc.Prefab)
    barrierPre: cc.Prefab[] = [];
    @property(cc.Node)
    ping: cc.Node = null;
    @property(cc.Node)
    land: cc.Node = null;

    
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
    @property(cc.Node)
    humanBuild: cc.Node[] = [];
    
    @property(cc.Node)
    castleORC: cc.Node = null;

    @property(cc.Button)
    button1: cc.Button = null;
    @property(cc.Button)
    button2: cc.Button = null;
    @property(cc.Button)
    button3: cc.Button = null;
    @property(cc.Button)
    button4: cc.Button = null;

    @property(popupTutorial)
    popup1:popupTutorial = null;
    @property(popupTutorial)
    popup2:popupTutorial = null;
    @property(popupTutorial)
    popup3:popupTutorial = null;
    @property(popupTutorial)
    popup4:popupTutorial = null;
    @property(popupTutorial)
    popup5:popupTutorial = null;
    @property(popupTutorial)
    popup6:popupTutorial = null;
    

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

        this.castleHuman.position = cc.v3(-348);
        this.castleORC.position = cc.v3(348);
        this.ping.position = cc.v3(1000);

        this.interactableButtons(this.button1,false);
        this.interactableButtons(this.button2,false);
        this.interactableButtons(this.button3,false);
        this.interactableButtons(this.button4,false);

    }

    start () {
        this.startCircle = cc.v3(0,1500);

        cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);

        this.hoverEffect(true,`flagpop`,cc.v3(-420,-45));
        this.scheduleOnce(()=>{
            this.hoverEffect(false);
            this.popup1.show();
        },2);
    }

    popshow(event,customEventData: string){
        this.scheduleOnce(()=>{
            switch (customEventData) {
                case `phase`:
                    this.popup2.show();
                    break;
                case `phase2`:
                    this.startPing(cc.v3(-420));
                    this.interactableButtons(this.button1,true);
                    break;
                case `phase3`:
                    this.startPing(cc.v3(-420));
                    this.interactableButtons(this.button4, true);
                    break;
                case `phase4`:
                    this.popup5.show();
                    break;
                case `phase5`:
                    this.startPing(cc.v3(0));
                    this.interactableButtons(this.button3, true);
                    break;
                case `phase6`:
                    this.draw();
                    this.scheduleOnce(()=>{
                        this.humanBuild[1].getComponent(TTown).typeAction();
                    },1);
                    break;
            }
        },0.4)
    }

    private interactableButtons(target:cc.Button, interactable: boolean){
        target.interactable = interactable;
    }

    private draw(): void{
        let a = this.humanBuild[1].getComponentInChildren(cc.Graphics);
        a.clear();
        a.lineWidth = 8;
        a.moveTo(-280);
        a.lineTo(348);
        a.stroke();
        a.node.parent = this.map;
    }

    onGoldMine(): void{
        if(this.button1.interactable){
            this.BuildTown(this.humanBuild[0],`GoldMine`,cc.v3(-420));
            this.humanBuild[0].getComponent(TTown).typeAction();
            this.startPing(cc.v3(-280));
            this.interactableButtons(this.button1, false);
            this.interactableButtons(this.button2, true);
        }
    }
    
    onPeasant(): void{
        if(this.button2.interactable){
            this.BuildTown(this.humanBuild[1],`Peasant`,cc.v3(-280));
            this.startPing(cc.v3(this.startCircle));
            this.interactableButtons(this.button2, false);
            this.scheduleOnce(()=>{
                this.popup3.show();
            },5);
        }
    }

    BuildTown(node: cc.Node, name: string, pos: cc.Vec3): void{
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
        node.position = pos;
        this.DemNguocTimerIn(node,5);
        //set vị trí thap theo thu tu.
        this.hoverEffect(true,`building`,node.position);

        Sounds.Ins.effect(`build`);
    }

    onSell(): void{
        this.circleSell.position = this.startCircle;
        if(this.isBuilding) return;

        this.humanBuild[0].active = false;
        this.land.children[1].active = false;
        this.land.children[3].active = false;
        this.land.children[4].active = false;
        this.land.children[7].active = false;
        this.land.children[8].active = false;

        this.scheduleOnce(()=>{
            this.popup4.show();
        },2)
        
        this.hoverEffect(true,`destroy`,cc.v3(-420));
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
        this.DemNguocTimerIn(node,5);

        this.interactableButtons(this.button3, false);

        this.scheduleOnce(()=>{
            this.popup6.show();
        },5.2)
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
            if(target.name === `Barrier`){
                target.children[0].destroy();
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

        Sounds.Ins.effect(`click`);
    }

    onClick(event, customEventData: string): void{
        if(this.isBuilding) return;
        let a = cc.Canvas.instance.node;
        this.circleTown.position = a.convertToNodeSpaceAR(event.getCurrentTarget().convertToWorldSpaceAR(cc.Vec3.ZERO));

        if(customEventData == `phase1`){
            this.startPing(cc.v3(-536,110));
        }else{
            this.startPing(cc.v3(-240,104));
        }
    }
    onClickSell(event): void{
        this.startPing(this.startCircle);
        if(event.currentTarget.name == `Barrier`){
            this.circleSell.children[2].active = true;
        }
        else{
            this.circleSell.children[1].active = true;
        }
        let a = cc.Canvas.instance.node;
        this.circleSell.position = a.convertToNodeSpaceAR(event.getCurrentTarget().convertToWorldSpaceAR(cc.Vec3.ZERO));
        this.circleSell.setSiblingIndex(81);
    }   

    startPing(pos: cc.Vec3) {
        cc.Tween.stopAllByTarget(this.ping);
        this.ping.position = pos;
        cc.tween(this.ping)
        .to(0.5, { scale: 1.3 })
        .to(0.5, { scale: 1 })
        .call(() => {
            this.startPing(this.ping.position);
        })
        .start();
    }

}
