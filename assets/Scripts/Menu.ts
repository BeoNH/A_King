const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    onPlay(): void{
        cc.director.loadScene(`Main`);
    }
}
