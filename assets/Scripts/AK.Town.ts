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

    private isAttackTown: boolean = false;
    
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
            this.node.setSiblingIndex(4)
        }
        this.onDestroyTown();        
    }

    typeAction(): void{
        switch (true) {
            case this.attack:
                this.onModSpawn();
                break;
            // case this.defense:
            //     this.onDefense();
            //     break;
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
            },15)
        }
    }

    onMakeGold(): void{
        this.unscheduleAllCallbacks();
        this.schedule(()=>{
            let money = 23; //tien duoc tang them
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

    onDefense(): void{}

    onCollisionStay(other: cc.BoxCollider, self: cc.CircleCollider): void{
        if(!this.isAttackTown && this.defense && other.tag == 1 &&
        other.node.getComponent(sp.Skeleton).defaultSkin !== self.node.getComponent(sp.Skeleton).defaultSkin &&
        !AKing.Ins.isBuilding)
        {
            this.isAttackTown = true;
            this.onShot(other.node);
        }
    }
    onCollisionExit(other: cc.BoxCollider, self: cc.CircleCollider): void{
        // if(other.node.getComponent(cc.Collider).tag !== 1) return;
        console.log(other.name);
        this.isAttackTown = false;
    }

    onShot(taget: cc.Node): void{
        if(taget == null) return;

        let bullet = cc.instantiate(this.Spawner);
        bullet.getComponent(sp.Skeleton).defaultSkin = this.node.getComponent(sp.Skeleton).defaultSkin;
        bullet.parent = this.node;
        bullet.position = cc.v3(0,100);

        let pos = this.node.convertToNodeSpaceAR(taget.convertToWorldSpaceAR(cc.Vec2.ZERO));

        cc.tween(bullet) .delay(0.25) .to(0,{angle:180}) .start();

        cc.tween(bullet)
        .bezierBy(0.5, cc.v2(0,0), cc.v2(35, 300), pos)
        .call(()=>{
            bullet.getComponent(sp.Skeleton).animation = `hit`;
            bullet.getComponent(sp.Skeleton).setCompleteListener((enetry: sp.spine.TrackEntry) => {
                if(enetry.animation.name === `hit`){
                    taget.getChildByName("hpBar").active = true;
                    let hp = taget.getChildByName("hpBar").getChildByName("hp");
                    let max = taget.getComponent(Mod).maxHP;
                    taget.getComponent(Mod).HP -= 5;
                    let hpMod = taget.getComponent(Mod).HP;
                    hp.getComponent(cc.Sprite).fillRange = hpMod/max;

                    bullet.destroy();
                    if(hpMod>0 && taget){
                        this.scheduleOnce(()=>{
                            this.onShot(taget);
                        },1);
                    }
                }
            })
        })     
        .start();
    }

    onDestroyTown(): void{
        if(this.HP <=0){
            let a = this.node.name.split(" ");
            AKing.Ins.changeLands(parseInt(a[1]),parseInt(a[2]),0);
            AKing.Ins.checkLandscapes();
            
            if(!this.attack && !this.defense && !this.support){
                this.node.active = false;
                if(this.node.getComponent(sp.Skeleton).defaultSkin == `Blue`){
                    Popup.Ins.winShow(`Orc`);
                }
                else{
                    Popup.Ins.winShow(`Human`);
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
