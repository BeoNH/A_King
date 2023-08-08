const { ccclass, property } = cc._decorator;

@ccclass
export default class MenuSetting extends cc.Component {

    @property(cc.Node)
    panel: cc.Node = null;
    @property(cc.Toggle)
    toggleMusic: cc.Toggle = null;

    protected start(): void {
        this.panel.active = false;
        this.panel.scale = 0;

        this.toggleMusic.node.on(`toggle`,()=>{
            if(this.toggleMusic.isChecked){
                this.toggleMusic.node.getChildByName(`lnKey`).getComponent(cc.Label).string = `On`;
                cc.audioEngine.resumeMusic();
            }
            else{
                this.toggleMusic.node.getChildByName(`lnKey`).getComponent(cc.Label).string = `Off`;
                cc.audioEngine.pauseMusic();
            }
        });
    }

    showMenu() {
        let isShow = !this.panel.active;
        cc.Tween.stopAllByTarget(this.panel);
        if (isShow) {
            this.panel.active = true;
            cc.tween(this.panel).to(0.3, { scale: 1 }).start();
        } else {
            cc.tween(this.panel).to(0.3, { scale: 0 }).call(() => {
                this.panel.active = false;
            }).start();
        }
    }
}
