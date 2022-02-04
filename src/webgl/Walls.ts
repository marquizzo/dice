import * as THREE from "three";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils"; 
import * as CANNON from "cannon-es";

export default class Walls {
	private mat: THREE.Material;
	private mesh: THREE.Mesh;
	private planeBot: CANNON.Body;
	private planeTop: CANNON.Body;
	private planeLeft: CANNON.Body;
	private planeRight: CANNON.Body;

	constructor() {
		const w = 12;
		const h = 8;
		const d = 10;
		this.mat = new THREE.MeshNormalMaterial();

		// Three.js walls
		const geomLeft = new THREE.PlaneGeometry(d, h);
		geomLeft.rotateY(Math.PI / 2);
		geomLeft.translate(-w/2, 0, 0);
		const geomRight = new THREE.PlaneGeometry(d, h);
		geomRight.rotateY(-Math.PI / 2);
		geomRight.translate(w/2, 0, 0);
		const geomTop = new THREE.PlaneGeometry(w, d);
		geomTop.rotateX(Math.PI / 2);
		geomTop.translate(0, h/2, 0);
		const geomBot = new THREE.PlaneGeometry(w, d);
		geomBot.rotateX(-Math.PI / 2);
		geomBot.translate(0, -h/2, 0);

		// Make mesh
		const geomAll = mergeBufferGeometries([geomLeft, geomRight, geomTop, geomBot]);
		this.mesh = new THREE.Mesh(geomAll, this.mat);

		// Cannon walls
		this.planeBot = this.makePlane();
		this.planeBot.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
		this.planeBot.position.y = -h/2;

		this.planeTop = this.makePlane();
		this.planeTop.quaternion.setFromEuler(Math.PI / 2, 0, 0);
		this.planeTop.position.y = h/2;

		this.planeLeft = this.makePlane();
		this.planeLeft.quaternion.setFromEuler(0, Math.PI / 2, 0);
		this.planeLeft.position.x = -w/2;

		this.planeRight = this.makePlane();
		this.planeRight.quaternion.setFromEuler(0, -Math.PI / 2, 0);
		this.planeRight.position.x = w/2;
	}

	private makePlane(): CANNON.Body {
		const boundPlane = new CANNON.Plane();
		const planeBody = new CANNON.Body({
			type: CANNON.Body.STATIC,
			shape: boundPlane
		});
		return planeBody;
	}

	public addToView(scene: THREE.Scene, world: CANNON.World) {
		scene.add(this.mesh);
		world.addBody(this.planeBot);
		world.addBody(this.planeTop);
		world.addBody(this.planeLeft);
		world.addBody(this.planeRight);
	}
}