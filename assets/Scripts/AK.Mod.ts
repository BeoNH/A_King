import AKing from "./!AKing";
import Cell from "./AK.Cell";
import Map from "./AK.Map";
import Town from "./AK.Town";

const { ccclass, property } = cc._decorator;


@ccclass
export default class Mod extends cc.Component {
	public static Ins: Mod;

	private count: number = 1;

	protected onLoad(): void {
		Mod.Ins =  this;

		this.move();
	}

	public move(): void{
		let town = this.node.parent.getComponent(Town);
		if(town.arrayPosMove.length <= 1) return;
	  	this.node.getComponent(sp.Skeleton).animation = `run`;

		let pos = town.arrayPosMove[this.count];
		let worldPos = pos.convertToWorldSpaceAR(cc.Vec3.ZERO);
		// Tạo tween để di chuyển node tới vị trí mới
		cc.tween(this.node)
		.to(1, {position: worldPos})
		.call(()=>{
			if(this.count < town.arrayPosMove.length -1){
				this.count++;
				this.move();
			}else {
				this.count = 1;
				this.node.getComponent(sp.Skeleton).animation = 'idle';
			}
		})
		.start();
	}
}

