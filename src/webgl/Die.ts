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
import { randInt, texLoader } from "~Utils";
import { SideTypes } from "~Utils/Constants";

export default class Die {
	private geom: THREE.BufferGeometry;
	private mat: THREE.MeshMatcapMaterial;
	private platonics: THREE.Group;
	public mesh: THREE.Mesh;

	private boundShape: CANNON.ConvexPolyhedron;
	public body: CANNON.Body;

	private timeU: THREE.IUniform;

	constructor(sides: SideTypes, platonics: THREE.Group, matcap: THREE.Texture) {
		this.platonics = platonics;
		this.mat = new THREE.MeshMatcapMaterial({
			matcap: matcap
			// map: texture
		});
		/*this.mat = new THREE.RawShaderMaterial({
			uniforms: {
				time: {value: 0}
			},
			vertexShader: vertShader,
			fragmentShader: fragShader
		});
		this.timeU = this.mat.uniforms.time;*/
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
		let name: string;
		switch (sides) {
			case 4:
				name = "Tetra";
			break;
			case 6:
				name = "Hexa";
			break;
			case 8:
				name = "Octa";
			break;
			case 12:
				name = "Dodeca";
			break;
			case 20:
				name = "Icos";
			break;
		}
		this.geom = (<THREE.Mesh>this.platonics.getObjectByName(name)).geometry;
		const map = texLoader.load(`./textures/map${name}.jpg`);
		map.anisotropy = 16;
		map.flipY = false;
		this.mat.map = map;
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
		// Reset body
		this.boundShape = new CANNON.ConvexPolyhedron({ vertices: vertArray });
		this.body.addShape(this.boundShape);
		this.body.position.set(0, 0, -3);
		this.body.velocity.setZero();

		const randFloat = THREE.MathUtils.randFloatSpread;
		this.body.angularVelocity.set(
			randFloat(10),
			randFloat(10),
			randFloat(10)
		);
	}

	public update(secs: number): void {
		// this.timeU.value = secs;
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