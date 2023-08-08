import AKing from "./!AKing";
import Sounds from "./AK.Sound";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Popup extends cc.Component {
    public static Ins: Popup;

    @property(cc.Node)
    flagHuman: cc.Node = null;
    @property(cc.Node)
    flagOrc: cc.Node = null;
    @property(cc.Node)
    BGWin: cc.Node = null;
    @property(cc.Node)
    BGLose: cc.Node = null;
    @property(cc.SpriteFrame)
    lost: cc.SpriteFrame = null;

    onLoad(): void{
        Popup.Ins = this;

        this.node.children[0].active = false;

        this.BGWin.active = false;
        this.BGLose.active = false;
        
        this.BGWin.width = this.BGLose.width = 0;
        this.flagHuman.height = 0;
        this.flagOrc.height = 0;
    }

    winShow(node: string, check: boolean): void{
        if(check){
            AKing.Ins.circleSell.active = false;
            AKing.Ins.circleTown.active = false;
        }
        
        this.node.children[0].active = true;
        if(node == `Human`){
            this.BGWin.active = true;
            cc.tween(this.BGWin) .to(1, {width: 1400}) .start();

            this.flagHuman.getComponent(cc.Sprite).spriteFrame = this.imgName(`Win1`);
            this.flagOrc.getComponent(cc.Sprite).spriteFrame = this.imgName(`Lost`);

            this.flagHuman.children[1].getComponent(sp.Skeleton).animation = `victoryHuman`;
            this.flagOrc.children[1].getComponent(sp.Skeleton).animation = `stand`;
        }
        else{
            this.BGLose.active = true;
            cc.tween(this.BGLose) .to(1, {width: 1400}) .start();

            this.flagHuman.getComponent(cc.Sprite).spriteFrame = this.imgName(`Lost`);
            this.flagOrc.getComponent(cc.Sprite).spriteFrame = this.imgName(`Win2`);

            this.flagHuman.children[1].getComponent(sp.Skeleton).animation = `stand2`;
            this.flagOrc.children[1].getComponent(sp.Skeleton).animation = `victoryOrc`;
        }
        cc.tween(this.flagHuman) .to(1, {height: 688}).start();
        cc.tween(this.flagOrc) .to(1, {height: 688}).start();

        Sounds.Ins.effect(`done`);
    }

    imgName(name: string) {
        return cc.resources.get(`graph/sheets/main/${name}`, cc.SpriteFrame);
    }

    onToMenu(): void{
        cc.director.loadScene(`Menu`);
    }
}
