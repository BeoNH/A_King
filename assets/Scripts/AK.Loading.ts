const { ccclass, property } = cc._decorator;

@ccclass
export default class Loading extends cc.Component {

    @property(cc.Sprite)
    progress: cc.Sprite = null;

    start() {
        this.progress.fillRange = 0;
        cc.director.preloadScene("Menu", (c, t, i) => {
            cc.tween(this.progress).to(1, { fillRange: c / t }).start();
        }, () => {
            cc.tween(this.progress).to(1, { fillRange: 1 }).call(() => {
                cc.director.loadScene("Menu");
            }).start();
        });
    }
}

