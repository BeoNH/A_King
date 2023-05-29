import AKing from "./!AKing";
import AI from "./AK.Automation";
import Map from "./AK.Map";
import Mod from "./AK.Mod";

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
        this.typeAction()
    }

    update(dt): void{
        this.Draw(this.arrayPosMove);
        if(this.arrayPosMove.length <= 0 && this.attack)
        {
            for (let i = 1; i < this.node.childrenCount; i++) {
                this.node.children[i].destroy();
            }
        }
        this.onDestroy();        
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
                a.moveTo(line[i].position.x + 25,line[i].position.y + 45);
                a.lineTo(line[i+1].position.x+ 25,line[i+1].position.y+ 45);
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
            if(this.node.getComponent(sp.Skeleton).defaultSkin == `Red`){
                AI.Ins.changeMoney(15);
            }else{
                AKing.Ins.changeMoney(15);
            }
            this.node.children[0].active = true;
            this.node.children[0].position = cc.v3(0,0);
            cc.tween(this.node.children[0]) .to(1,{position: cc.v3(0,100)}) .call(()=>{ this.node.children[0].active = false}) .start();
        },10)    
    }

    onDefense(): void{}

    onCollisionEnter(other: cc.Collider, self: cc.CircleCollider): void{
        if(!this.isAttackTown && this.defense && other.tag == 1 &&
        other.node.getComponent(sp.Skeleton).defaultSkin !== self.node.getComponent(sp.Skeleton).defaultSkin)
        {
            this.isAttackTown =  true;
            this.onShot(other.node);
        }
    }
    onCollisionExit(other: cc.Collider, self: cc.CircleCollider): void{
        if(other.node.getComponent(cc.Collider).tag !== 1) return;
        this.isAttackTown = false;
    }

    onShot(taget: cc.Node): void{
        if(taget == null) return;

        let bullet = cc.instantiate(this.Spawner);
        bullet.getComponent(sp.Skeleton).defaultSkin = this.node.getComponent(sp.Skeleton).defaultSkin;
        bullet.parent = this.node;
        bullet.position = cc.v3(0,100);

        let pos = this.node.convertToNodeSpaceAR(taget.convertToWorldSpaceAR(cc.Vec3.ZERO));
        let dir = taget.position.clone().sub(bullet.position);
        let angleShot = Math.atan2(dir.x, dir.y) * 180 / Math.PI;

        let shot = cc.tween(bullet)
        .to(0, { angle: angleShot })
        .delay(1)
        .to(0.2, { position: pos})
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
                        this.onShot(taget);
                    }
                }
            })
        })        
        .start();
    }

    onDestroy(): void{
        if(this.HP <=0){
            let a = this.node.name.split(" ");
            AKing.Ins.changeLands(parseInt(a[1]),parseInt(a[2]),0);
            AKing.Ins.checkLandscapes();
            AKing.Ins.hoverEffect(true,`destroy`,this.node.position);
            this.node.destroy();

            if(this.node.getComponent(sp.Skeleton).defaultSkin == `Blue`){
				AI.Ins.changeMoney(10);
			}else{
				AKing.Ins.changeMoney(10);
			}
        } 
    }
}
