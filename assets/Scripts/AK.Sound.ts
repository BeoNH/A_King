const {ccclass, property} = cc._decorator;

@ccclass
export default class Sounds extends cc.Component {
    public static Ins: Sounds;

    @property(cc.Node)
    barSound: cc.Node = null;
    @property(cc.Toggle)
    toggleMusic: cc.Toggle = null;
    @property(cc.Toggle)
    toggleSound: cc.Toggle = null;

    private effectOn: boolean;

    @property(cc.AudioClip)
    music: cc.AudioClip = null;
    @property(cc.AudioClip)
    soundsClick: cc.AudioClip = null;
    @property(cc.AudioClip)
    soundsBuild: cc.AudioClip = null;
    @property(cc.AudioClip)
    soundsDestroyTown: cc.AudioClip = null;
    @property(cc.AudioClip)
    soundsDestroyBarrier: cc.AudioClip = null;
    @property(cc.AudioClip)
    soundsDone: cc.AudioClip = null;

    onLoad(): void{
        Sounds.Ins = this;

        cc.audioEngine.playMusic(this.music,true);
    }

    protected start(): void {
        this.barSound.position.x = -850;
        this.effectOn = true;


        this.toggleMusic.node.on(`toggle`,()=>{
            if(this.toggleMusic.isChecked){
                cc.audioEngine.resumeMusic();
            }
            else{
                cc.audioEngine.pauseMusic();
            }
        });

        this.toggleSound.node.on(`toggle`, ()=>{
            if(this.toggleSound.isChecked){
                this.effectOn = true;
                cc.audioEngine.setEffectsVolume(1);
            }
            else{
                this.effectOn = false;
                cc.audioEngine.setEffectsVolume(0);
            }
        })
    }

    isShow(): void{
        let isShow = this.barSound.position.x;
        cc.Tween.stopAllByTarget(this.barSound);
        if(isShow == -850){
            cc.tween(this.barSound).to(0.5, {position: cc.v3(-703, this.barSound.position.y)}).start();
        }else{
            cc.tween(this.barSound).to(0.5, {position: cc.v3(-850, this.barSound.position.y)}).start();
        }
    }

    effect(name: string) {
        if(this.effectOn){
            switch (name) {
                case `click`:
                    cc.audioEngine.playEffect(this.soundsClick, false);
                    break;
                case `build`:
                    cc.audioEngine.playEffect(this.soundsBuild, true);
                    break;
                case `destroyTown`:
                    cc.audioEngine.playEffect(this.soundsDestroyTown, false);
                    break;
                case `destroyBarrier`:
                    cc.audioEngine.playEffect(this.soundsDestroyBarrier, true);
                    break;
                case `done`:
                    cc.audioEngine.stopAll();
                    cc.audioEngine.playEffect(this.soundsDone, false);
                    break;
                default:
                    break;
            }
        }
    }

    effectStop(): void{
        cc.audioEngine.stopAllEffects();
    }

}
