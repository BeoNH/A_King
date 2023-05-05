import AKing from "./!AKing";
import Cell from "./AK.Cell";
import Map from "./AK.Map";

const { ccclass, property } = cc._decorator;


@ccclass
export default class Mod extends cc.Component {
	public static Ins: Mod;

	public startPos = [0,0];
	protected onLoad(): void {
		Mod.Ins =  this;
	}
	protected update(dt: number): void {
		
	}

	async move(): Promise<void>{  

      let end = [AKing.Ins.posCellX, AKing.Ins.posCellY];

      aStarSearch(Map.Ins.board, this.startPos, end);

      let a = getPath();
	  let b = [];
	  while (a.length > 0) {
		let pos = a[0];
		a.shift();
		let c = cc.find(`Map/Cell ${pos[0]} ${pos[1]}`, cc.Canvas.instance.node);

		b.push(c);
	  }
	  console.log(b);

	  for (let i = 0; i < b.length; i++) {
		let pos = b[i];	  
		// Tạo tween để di chuyển node tới vị trí mới
		cc.tween(this.node)
		  .to(1, {position: cc.v3(pos.x+35, pos.y+10)})
		  .call(()=>{ })
		  .start();	  
		// Chờ đợi cho tween hoàn thành trước khi tiếp tục
		await new Promise(resolve => setTimeout(resolve, 1000));
		this.node.getComponent(sp.Skeleton).animation = `run`;
	  }
	  this.startPos = end;
	  this.node.getComponent(sp.Skeleton).animation = `idle`;
	}
}

