/*
 * Walls.ts
 * ===========
 * Box geometry with physical bounding walls to constrain all dice
 */

import * as THREE from "three";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils"; 
import * as CANNON from "cannon-es";

const DEPTH = 10;
const HEIGHT = 20;

export default class Walls {
	private mat: THREE.Material;
	private mesh: THREE.Mesh;
	private planeBot: CANNON.Body;
	private planeTop: CANNON.Body;
	private planeLeft: CANNON.Body;
	private planeRight: CANNON.Body;
	private planeBack: CANNON.Body;
	private planeFront: CANNON.Body;

	public bounceMat: CANNON.Material;

	constructor(matcap: THREE.Texture) {
		this.mat = new THREE.MeshMatcapMaterial({
			side: THREE.BackSide,
			matcap,
		});

		// Three.js walls
		const geom = new THREE.BoxGeometry(1, 1, DEPTH, 4, 1);
		this.mesh = new THREE.Mesh(geom, this.mat);
		this.mesh.receiveShadow = true;

		// Physics walls
		this.bounceMat = new CANNON.Material("wall-bounce");

		this.planeTop = this.makePlane(this.bounceMat);
		this.planeTop.quaternion.setFromEuler(Math.PI / 2, 0, 0);

		this.planeBot = this.makePlane(this.bounceMat);
		this.planeBot.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

		this.planeLeft = this.makePlane(this.bounceMat);
		this.planeLeft.quaternion.setFromEuler(0, Math.PI / 2, 0);

		this.planeRight = this.makePlane(this.bounceMat);
		this.planeRight.quaternion.setFromEuler(0, -Math.PI / 2, 0);

		this.planeBack = this.makePlane(this.bounceMat);
		this.planeBack.quaternion.setFromEuler(0, 0, Math.PI);

		this.planeFront = this.makePlane(this.bounceMat);
		this.planeFront.quaternion.setFromEuler(0, Math.PI, 0); // y-rotation bugfix
	}

	private makePlane(material: CANNON.Material): CANNON.Body {
		const boundPlane = new CANNON.Plane();
		const planeBody = new CANNON.Body({
			type: CANNON.Body.STATIC,
			shape: boundPlane,
			material: material
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
		world.addBody(this.planeFront);
	}

	// Re-position walls against viewport edges on browser resize
	public onWindowResize(vpW: number, vpH: number): void {
		const w = HEIGHT * window.innerWidth / window.innerHeight;

		// Scale room walls
		this.mesh.scale.set(w, HEIGHT, 1);

		// Position physics planes
		this.planeTop.position.y = HEIGHT/2;
		this.planeBot.position.y = -HEIGHT/2;
		this.planeLeft.position.x = -w/2;
		this.planeRight.position.x = w/2;
		this.planeBack.position.z = -DEPTH/2;
		this.planeFront.position.z = DEPTH/2;
	}
}