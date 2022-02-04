/*
 * Shape.ts
 * ===========
 * Placeholder shape to demonstrate setup works. 
 * Has capacity to import custom .glsl shader files
 */

import * as THREE from "three";

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
	mesh: THREE.Mesh;
	timeU: THREE.IUniform;

	constructor(parentScene: THREE.Scene, sides: SideTypes) {
		const geom = this.getGeometry(sides);
		/*const mat = new THREE.RawShaderMaterial({
			uniforms: {
				time: {value: 0}
			},
			vertexShader: vertShader,
			fragmentShader: fragShader
		});*/
		const mat = new THREE.MeshNormalMaterial();
		// this.timeU = mat.uniforms.time;
		this.mesh = new THREE.Mesh(geom, mat);
		parentScene.add(this.mesh);
	}

	// Returns new geometry based on sides
	private getGeometry(sides: SideTypes) {
		switch (sides) {
			case 4:
				return GEOM.tetra;
			break;
			case 6:
				return GEOM.cube;
			break;
			case 8:
				return GEOM.octa;
			break;
			case 12:
				return GEOM.dodeca;
			break;
			case 20:
				return GEOM.icos;
			break;
		}
	}

	public onDieTypeChange(sides: SideTypes) {
		const newGeom = this.getGeometry(sides);
		this.mesh.geometry = newGeom;
	}

	public update(secs: number): void {
		// this.timeU.value = secs;
		this.mesh.rotation.set(
			Math.sin(secs / 10) * 2 * Math.PI,
			Math.cos(secs / 10) * 2 * Math.PI,
			0
		);
	}
}