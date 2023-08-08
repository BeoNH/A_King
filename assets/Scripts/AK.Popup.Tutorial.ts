import Tutorial from "./Tutorial";

const { ccclass, property } = cc._decorator;

@ccclass
export default class popupTutorial extends cc.Component {

    bg: cc.Node = null;
    container: cc.Node = null;
    showScale = 1.1;
    startScale = 0.7;

    show(needSetTop: any = true): void {
        if (!this.bg) this.bg = this.node.getChildByName("Bg");
        if (!this.container) this.container = this.node.getChildByName("Container");
        if (needSetTop) {
            this.setTop();
        }
        this.node.active = true;

        this.bg.stopAllActions();
        this.bg.opacity = 0;
        this.bg.runAction(cc.fadeTo(0.2, 128));

        this.container.stopAllActions();
        this.container.opacity = 0;
        this.container.scale = this.startScale;
        this.container.runAction(cc.sequence(
            cc.spawn(cc.scaleTo(0.2, this.showScale), cc.fadeIn(0.2)),
            cc.scaleTo(0.1, 1),
        ));
    }

    dismiss() {
        if (!this.bg) this.bg = this.node.getChildByName("Bg");
        if (!this.container) this.container = this.node.getChildByName("Container");
        var _this = this;

        this.bg.stopAllActions();
        this.bg.opacity = 128;
        this.bg.runAction(cc.fadeOut(0.2));

        this.container.stopAllActions();
        this.container.opacity = 255;
        this.container.scale = 1;
        this.container.runAction(cc.sequence(
            cc.scaleTo(0.1, this.showScale),
            cc.spawn(cc.scaleTo(0.2, this.startScale), cc.fadeOut(0.2)),
            cc.callFunc(_this._onDismissed.bind(this))
        ));
    }

    _onDismissed() {
        this.node.active = false;
    }

    setTop() {
        this.node.setSiblingIndex(this.node.parent.children.length - 1);
    }
}
