const {ccclass, property} = cc._decorator;

@ccclass
export default class Menu extends cc.Component {

    @property(cc.AudioClip)
    music: cc.AudioClip = null;

    protected onLoad(): void {
        cc.audioEngine.playMusic(this.music,true);
    }

    onPlay(): void{
        cc.director.loadScene(`Main`);
    }
}
