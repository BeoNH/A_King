const { ccclass, property } = cc._decorator;

@ccclass
export default class Loading extends cc.Component {

    @property(cc.Sprite)
    progress: cc.Sprite = null;


    async preloadSceneAsync(sceneName: string) {
        return new Promise<void>((resolve, reject) => {
            cc.director.preloadScene(sceneName, (c, t, i) => {
                cc.tween(this.progress).to(1, { fillRange: c/t }).start();
            }, () => {
                resolve();
            });
        });
    }

    async start() {
        this.progress.fillRange = 0;

        await this.preloadSceneAsync("Menu");
        cc.tween(this.progress).to(1, { fillRange: 0.5 }).start();

        await this.preloadSceneAsync("Main");
        cc.tween(this.progress).to(1, { fillRange: 1 }).start();

        cc.director.loadScene("Menu");
    }
}

