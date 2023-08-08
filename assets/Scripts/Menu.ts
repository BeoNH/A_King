const {ccclass, property} = cc._decorator;

@ccclass
export default class Menu extends cc.Component {

    @property(cc.AudioClip)
    musicMenu: cc.AudioClip = null;

    onLoad(): void {
        cc.audioEngine.playMusic(this.musicMenu,true);
    }

    onPlay(): void{
        cc.audioEngine.stopMusic();
        cc.director.loadScene(`Main`);
    }

    onTutorial(): void{
        cc.audioEngine.stopMusic();
        cc.director.loadScene(`Tutorial`);
    }
}
