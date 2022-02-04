import * as THREE from "three";
import * as CANNON from "cannon-es";

export default class Walls {
	public mesh: THREE.Mesh;
	public body: CANNON.Body;

	constructor() {
		this.body = new CANNON.Body({
			type: CANNON.Body.STATIC,
			shape: new CANNON.Plane()
		});
		this.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
		this.body.position.y = -2;
	}

	public addToView(scene: THREE.Scene, world: CANNON.World) {
		world.addBody(this.body);
	}
}