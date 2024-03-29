import AKing from "./!AKing";
import AI from "./AK.Automation";
import Map from "./AK.Map";
import Mod from "./AK.Mod";
import Popup from "./AK.Popup";
import Sounds from "./AK.Sound";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Town extends cc.Component {
    public static Ins: Town;

    @property(cc.Integer)
    maxHP: number = 0;

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
    public HP: number = 0;
    public myMoney: number = 23;

    private isAttackTown: boolean = true;
    
    onLoad(): void{
        Town.Ins = this;

        this.HP = this.maxHP;
    }

    update(dt): void{
        this.Draw(this.arrayPosMove);
        if(this.arrayPosMove.length <= 0 && this.attack)
        {
            for (let i = 1; i < this.node.childrenCount; i++) {
                this.node.children[i].destroy();
            }
        }

        if(Popup.Ins.node.children[0].active){
            this.arrayPosMove = [];
            this.myMoney = 0;
            this.node.setSiblingIndex(4)
        }
        this.onDestroyTown();  
    }

    typeAction(): void{
        switch (true) {
            case this.attack:
                this.onModSpawn();
                break;
            case this.defense:
                this.isAttackTown = false;
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
                if(this.node.getComponent(sp.Skeleton).defaultSkin == `Blue`){
                    a.moveTo(line[i].position.x + 25,line[i].position.y + 45);
                    a.lineTo(line[i+1].position.x+ 25,line[i+1].position.y+ 45);
                }
                else
                {
                    a.moveTo(line[i].position.x + 45,line[i].position.y + 25);
                    a.lineTo(line[i+1].position.x+ 45,line[i+1].position.y+ 25);
                }
            }
            a.stroke();
            this.drawwww.parent = AKing.Ins.map;
        }
    }

    onModSpawn(): void{
        this.unscheduleAllCallbacks();
        if(this.arrayPosMove.length > 0){
            let a =  cc.instantiate(this.Spawner);
            a.parent = this.node;
            this.scheduleOnce(()=>{
                this.onModSpawn();
            },14)
        }
    }

    onMakeGold(): void{
        this.unscheduleAllCallbacks();
        this.schedule(()=>{
            let money = this.myMoney; //tien duoc tang them
            if(this.node.getComponent(sp.Skeleton).defaultSkin == `Red`){
                AI.Ins.changeMoney(money);
            }else{
                AKing.Ins.changeMoney(money);
            }
            this.node.children[0].active = true;
            this.node.children[0].position = cc.v3(0,0);
            this.node.children[0].getComponent(cc.Label).string = `${money}`;
            cc.tween(this.node.children[0]) .to(1,{position: cc.v3(0,100)}) .call(()=>{ this.node.children[0].active = false}) .start();
        },5)    
    }

    onCollisionStay(other: cc.BoxCollider, self: cc.CircleCollider): void{
        if(!this.isAttackTown && this.defense && other.tag == 1 &&
        other.node.getComponent(sp.Skeleton).defaultSkin !== self.node.getComponent(sp.Skeleton).defaultSkin)
        {
            this.isAttackTown = true;

            this.schedule(()=>{
                this.onShot(other.node);
            },2)
        }
    }
    onCollisionExit(other: cc.BoxCollider, self: cc.CircleCollider): void{
        // if(other.node.getComponent(cc.Collider).tag !== 1) return;
        if(this.defense && other.node.getComponent(Mod)){
            this.unscheduleAllCallbacks();
            this.isAttackTown = false;
        }
    }

    onShot(taget: cc.Node): void{
        if(taget == null) return;

        let bullet = cc.instantiate(this.Spawner);
        bullet.getComponent(sp.Skeleton).defaultSkin = this.node.getComponent(sp.Skeleton).defaultSkin;
        bullet.parent = this.node;
        bullet.position = cc.v3(0,100);

        let pos = this.node.convertToNodeSpaceAR(taget?.convertToWorldSpaceAR(cc.Vec2.ZERO));

        cc.tween(bullet) .delay(0.25) .to(0,{angle:180}) .start();

        cc.tween(bullet)
        .bezierBy(0.5, cc.v2(0,0), cc.v2(35, 300), pos)
        .call(()=>{
            bullet.getComponent(sp.Skeleton).animation = `hit`;
            bullet.getComponent(sp.Skeleton).setCompleteListener((enetry: sp.spine.TrackEntry) => {
                if(enetry.animation.name === `hit`){
                    if(!taget.children) return;
                    taget.getChildByName("hpBar").active = true;
                    let hp = taget.getChildByName("hpBar").getChildByName("hp");
                    let max = taget.getComponent(Mod).maxHP;
                    taget.getComponent(Mod).HP -= 4;
                    let hpMod = taget.getComponent(Mod).HP;
                    hp.getComponent(cc.Sprite).fillRange = hpMod/max;
                }
                bullet.destroy();
            })
        })     
        .start();
    }

    onDestroyTown(): void{
        if(this.HP <=0){
            let a = this.node.name.split(" ");
            AKing.Ins.changeLands(parseInt(a[1]),parseInt(a[2]),0);
            AKing.Ins.checkLandscapes();

            //xử lý giảm tiền mua tháp
            let down = AKing.Ins.circleTown.getComponentsInChildren(cc.Label);
            for (let i = 0; i < down.length; i++) {
                down[i].string =  `${parseInt(down[i].string)-120}`;
            }
            
            if(!this.attack && !this.defense && !this.support){
                this.node.active = false;
                if(this.node.getComponent(sp.Skeleton).defaultSkin == `Blue`){
                    Popup.Ins.winShow(`Orc`,true);
                }
                else{
                    Popup.Ins.winShow(`Human`,true);
                }
            }
            else{
                this.node.destroy();
                this.drawwww?.destroy();
                if(this.node.getComponent(sp.Skeleton).defaultSkin == `Blue`){
                    AKing.Ins.hoverEffect(true,`destroy`,this.node.position);
                    AI.Ins.changeMoney(10);
                }
                else{
                    AI.Ins.hoverEffectOc(true,`destroy`,this.node.position);
                    AKing.Ins.changeMoney(10);
                }
            }

            Sounds.Ins.effect(`destroyTown`);
        } 
    }
}
