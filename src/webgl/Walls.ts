import * as THREE from "three";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils"; 
import * as CANNON from "cannon-es";

export default class Walls {
	private mat: THREE.Material;
	private mesh: THREE.Mesh;
	private body: CANNON.Body;

	constructor() {
		// const width;
		this.mat = new THREE.MeshNormalMaterial();
		const geomLeft = new THREE.PlaneGeometry(10, 10);
		geomLeft.rotateY(Math.PI / 2);
		geomLeft.translate(-6, 0, 0);
		const geomRight = new THREE.PlaneGeometry(10, 10);
		geomRight.rotateY(-Math.PI / 2);
		geomRight.translate(6, 0, 0);

		const geomAll = mergeBufferGeometries([geomLeft, geomRight]);
		this.mesh = new THREE.Mesh(geomAll, this.mat);


		this.body = new CANNON.Body({
			type: CANNON.Body.STATIC,
			shape: new CANNON.Plane()
		});
		this.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
		this.body.position.y = -2;
	}

	public addToView(scene: THREE.Scene, world: CANNON.World) {
		scene.add(this.mesh);
		world.addBody(this.body);
	}
}