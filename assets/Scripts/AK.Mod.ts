import AKing from "./!AKing";
import Cell from "./AK.Cell";
import Map from "./AK.Map";
import Town from "./AK.Town";
import AI from "./AK.Automation";

const { ccclass, property } = cc._decorator;


@ccclass
export default class Mod extends cc.Component {
	public static Ins: Mod;

	@property(cc.Float)
	dame: number = 0;
	@property(cc.Integer)
    maxHP: number = 0;

	public HP: number = 0;

	private count: number = 1;
	private isAttack: boolean = false;

	protected onLoad(): void {
		Mod.Ins =  this;

		this.HP = this.maxHP;

		this.move();
	}
	protected update(dt: number): void {
		this.onDestroy();
	}

	public move(): void{
		let town = this.node.parent.getComponent(Town);
		if(town.arrayPosMove.length <= 1) return;

		//chuyển toạ độ điểm về toạ độ tháp.
		let pos = town.arrayPosMove[this.count];
		let worldPos = pos.convertToWorldSpaceAR(cc.Vec3.ZERO);
		let pps = this.node.parent.convertToNodeSpaceAR(worldPos);

		//Kiểm tra nếu điểm cuối có còn tháp không
		let last = town.arrayPosMove[town.arrayPosMove.length-1].name.split(" ");

		//thay đổi hướng node theo đúng chiều.
		let a = pos.name.split(" ");
		let b = town.arrayPosMove[this.count-1].name.split(" ");
		if(parseInt(a[1]) < parseInt(b[1])){
			this.node.scaleX = 0.5;
		}else{ this.node.scaleX = -0.5;}
		
		//Kiểm tra quay dung huong chay
		// Tạo tween để di chuyển node tới vị trí mới
		cc.tween(this.node)
		.to(1, {position: cc.v3(pps.x+60, pps.y+35)})
		.call(()=>{
			if(this.count < town.arrayPosMove.length -1 && Map.Ins.board[last[1]][last[2]] !== 0){
				this.count++;
				this.move();
			}else {
				this.count = 1;
				this.node.getComponent(sp.Skeleton).animation = 'idle';
				town.arrayPosMove = [];
			}
		})
		.start();
	}

	onCollisionEnter(other: cc.BoxCollider, self: cc.Collider): void{
		if(!this.isAttack && other.tag == 1 && 
			other.node.getComponent(sp.Skeleton).defaultSkin !== self.node.getComponent(sp.Skeleton).defaultSkin &&
			other.node){
				let a = other.node.name.split(" ");
				let b = cc.find(`Map/Cell ${a[1]} ${a[2]}`, cc.Canvas.instance.node);
				//kiểm tra thap co thuoc đường đi không nếu không ngắt va chạm
				if(other.node.getComponent(Town)){
					if(!self.node.parent.getComponent(Town).arrayPosMove.includes(b)){
						return;
					}
				}
				this.isAttack = true;
				this.node.pauseAllActions();
				this.node.getComponent(sp.Skeleton).animation = `attack1`;
				this.node.getComponent(sp.Skeleton).timeScale = 0.5;
				//callback lại mỗi khi animation chạy xong.
				this.node.getComponent(sp.Skeleton).setCompleteListener((entry: sp.spine.TrackEntry)=>{
					if(entry.animation.name == "attack1" ) {
						this.onAtack(other.node);
					}
				})
		}
	}

	onCollisionExit(other: cc.BoxCollider, self): void{
		if(other.tag !== 1) return;
		this.isAttack = false;
		this.node.getComponent(sp.Skeleton).timeScale = 1;
		this.node.getComponent(sp.Skeleton).animation = `run`;
		this.node.resumeAllActions();
	}

	onAtack(taget: cc.Node): void{
		if(taget == null) return;
		taget.getChildByName("hpBar").active = true;
		let hp = taget.getChildByName("hpBar").getChildByName("hp");
		if(taget.getComponent(Town)){
			let max = taget.getComponent(Town).maxHP;
			taget.getComponent(Town).HP -= this.dame;
			let hpTown = taget.getComponent(Town).HP;
			hp.getComponent(cc.Sprite).fillRange = hpTown/max;
		}
		else if(taget.getComponent(Mod)){
			let max = taget.getComponent(Mod).maxHP;
			taget.getComponent(Mod).HP -= this.dame;
			let hpMod = taget.getComponent(Mod).HP;
			hp.getComponent(cc.Sprite).fillRange = hpMod/max;			
		}
	}

	protected onDestroy(): void {
		if(this.HP<=0){
			this.node.stopAllActions();
			this.node.getComponent(sp.Skeleton).animation = `death`;
			this.node.destroy();
			if(this.node.getComponent(sp.Skeleton).defaultSkin == `Blue`){
				AI.Ins.changeMoney(5);
			}else{
				AKing.Ins.changeMoney(5);
			}
		}
	}
}

