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

const GEOM = {
	tetra: new THREE.TetrahedronGeometry(1),
	cube: new THREE.BoxGeometry(1),
	octa: new THREE.OctahedronGeometry(1),
	dodeca: new THREE.DodecahedronGeometry(1),
	icos: new THREE.IcosahedronGeometry(1),
};

export default class Die {
	public mesh: THREE.Mesh;
	public body: CANNON.Body;
	public shapePhys: CANNON.ConvexPolyhedron;

	private timeU: THREE.IUniform;

	constructor(sides: SideTypes) {
		/*const mat = new THREE.RawShaderMaterial({
			uniforms: {
				time: {value: 0}
			},
			vertexShader: vertShader,
			fragmentShader: fragShader
		});*/
		// this.timeU = mat.uniforms.time;
		const geom = this.updateGeometry(sides);
		const mat = new THREE.MeshNormalMaterial();
		this.mesh = new THREE.Mesh(geom, mat);
		this.body = new CANNON.Body({
			mass: 5,
			shape: this.shapePhys
		})
	}

	// Returns new geometry based on sides
	private updateGeometry(sides: SideTypes): THREE.BufferGeometry {
		let newGeom: THREE.BufferGeometry;

		switch (sides) {
			case 4:
				newGeom = GEOM.tetra;
			break;
			case 6:
				newGeom = GEOM.cube;
			break;
			case 8:
				newGeom = GEOM.octa;
			break;
			case 12:
				newGeom = GEOM.dodeca;
			break;
			case 20:
				newGeom = GEOM.icos;
			break;
		}

		const pos = newGeom.getAttribute("position").array;
		const vertArray: Array<CANNON.Vec3> = [];
		// Extract geometry into Cannon vertex array
		for(let i3 = 0; i3 < pos.length; i3 += 3) {
			vertArray.push(new CANNON.Vec3(
				pos[i3 + 0],
				pos[i3 + 1],
				pos[i3 + 2],
			));
		}
		this.shapePhys = new CANNON.ConvexPolyhedron({ vertices: vertArray });

		return newGeom;
	}

	public onDieTypeChange(sides: SideTypes) {
		const newGeom = this.updateGeometry(sides);
		this.mesh.geometry = newGeom;
	}

	public update(secs: number): void {
		// this.timeU.value = secs;
		this.mesh.position.copy(this.body.position as any as THREE.Vector3);
		this.mesh.quaternion.copy(this.body.quaternion as any as THREE.Quaternion);
	}
}