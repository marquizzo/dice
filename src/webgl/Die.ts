/*
 * Shape.ts
 * ===========
 * Placeholder shape to demonstrate setup works. 
 * Has capacity to import custom .glsl shader files
 */

import * as THREE from "three";
import * as CANNON from "cannon-es";

import vertShader from "./glsl/torus.vs";
import fragShader from "./glsl/torus.fs";
import { randInt } from "~Utils";
import { SideTypes } from "~Utils/Constants";

const PLATONICS = {
	TETRA: new THREE.TetrahedronGeometry(1),
	CUBE: new THREE.BoxGeometry(1),
	OCTA: new THREE.OctahedronGeometry(1),
	DODECA: new THREE.DodecahedronGeometry(1),
	ICOS: new THREE.IcosahedronGeometry(1),
};

export default class Die {
	private geom: THREE.BufferGeometry;
	private mat: THREE.Material;
	public mesh: THREE.Mesh;

	private boundShape: CANNON.ConvexPolyhedron;
	public body: CANNON.Body;

	private timeU: THREE.IUniform;

	constructor(sides: SideTypes) {
		this.mat = new THREE.MeshNormalMaterial();
		this.body = new CANNON.Body({
			mass: 1,
		});
		this.updateGeometry(sides);
	}

	// Updates die geometry & bounding box by sides
	public updateGeometry(sides: SideTypes): void {
		// Removes old shape if it exists
		if (this.boundShape) {
			this.body.removeShape(this.boundShape);
		}

		// Pick new geom
		switch (sides) {
			case 4:
				this.geom = PLATONICS.TETRA;
			break;
			case 6:
				this.geom = PLATONICS.CUBE;
			break;
			case 8:
				this.geom = PLATONICS.OCTA;
			break;
			case 12:
				this.geom = PLATONICS.DODECA;
			break;
			case 20:
				this.geom = PLATONICS.ICOS;
			break;
		}
		if (!this.mesh) {
			this.mesh = new THREE.Mesh(this.geom, this.mat);
		} else {
			this.mesh.geometry = this.geom;
		}

		// Build physics bounding shape
		const pos = this.geom.getAttribute("position").array;
		const vertArray: Array<CANNON.Vec3> = [];

		for(let i3 = 0; i3 < pos.length; i3 += 3) {
			vertArray.push(new CANNON.Vec3(
				pos[i3 + 0],
				pos[i3 + 1],
				pos[i3 + 2],
			));
		}
		this.boundShape = new CANNON.ConvexPolyhedron({ vertices: vertArray });
		this.body.addShape(this.boundShape);
	}

	public update(secs: number): void {
		this.mesh.position.copy(this.body.position as any as THREE.Vector3);
		this.mesh.quaternion.copy(this.body.quaternion as any as THREE.Quaternion);
	}
}


/*const mat = new THREE.RawShaderMaterial({
	uniforms: {
		time: {value: 0}
	},
	vertexShader: vertShader,
	fragmentShader: fragShader
});
this.timeU = mat.uniforms.time;*/