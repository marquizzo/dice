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
	private planeBack: CANNON.Body;
	private planeFront: CANNON.Body;

	constructor(matcap: THREE.Texture) {
		const h = 8;
		const w = h * window.innerWidth / window.innerHeight;
		const d = 10;
		this.mat = new THREE.MeshMatcapMaterial({
			side: THREE.BackSide,
			matcap,
		});

		// Three.js walls
		const geom = new THREE.BoxGeometry(1, 1, d, 4, 1);
		this.mesh = new THREE.Mesh(geom, this.mat);
		this.mesh.receiveShadow = true;

		// Physics walls
		this.planeTop = this.makePlane();
		this.planeTop.quaternion.setFromEuler(Math.PI / 2, 0, 0);

		this.planeBot = this.makePlane();
		this.planeBot.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

		this.planeLeft = this.makePlane();
		this.planeLeft.quaternion.setFromEuler(0, Math.PI / 2, 0);

		this.planeRight = this.makePlane();
		this.planeRight.quaternion.setFromEuler(0, -Math.PI / 2, 0);

		this.planeBack = this.makePlane();
		this.planeBack.quaternion.setFromEuler(0, 0, Math.PI);

		this.planeFront = this.makePlane();
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
		world.addBody(this.planeBack);
		// world.addBody(this.planeFront);
	}

	// Position walls against viewport edges on browser resize
	public onWindowResize(vpW: number, vpH: number): void {
		const h = 8;
		const w = h * window.innerWidth / window.innerHeight;
		const d = 10;

		// Scale room walls
		this.mesh.scale.set(w, h, 1);

		// Position physics planes
		this.planeTop.position.y = h/2;
		this.planeBot.position.y = -h/2;
		this.planeLeft.position.x = -w/2;
		this.planeRight.position.x = w/2;
		this.planeBack.position.z = -d/2;
		this.planeFront.position.z = -d/2;
	}
}