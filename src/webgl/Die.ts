/*
 * Shape.ts
 * ===========
 * Placeholder shape to demonstrate setup works. 
 * Has capacity to import custom .glsl shader files
 */

import * as THREE from "three";

import vertShader from "./glsl/torus.vs";
import fragShader from "./glsl/torus.fs";
import { randInt } from "Utils";

type SideCount = 4 | 6 | 8 | 12 | 20;

export default class Die {
	mesh: THREE.Mesh;
	timeU: THREE.IUniform;

	constructor(parentScene: THREE.Scene, sides: SideCount) {
		const geom = this.buildGeometry(sides);
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

	private buildGeometry(sides: SideCount) {
		switch (sides) {
			case 4:
				return new THREE.TetrahedronGeometry(1);
			break;
			case 6:
				return new THREE.BoxGeometry(1);
			break;
			case 8:
				return new THREE.OctahedronGeometry(1);
			break;
			case 12:
				return new THREE.DodecahedronGeometry(1);
			break;
			case 20:
				return new THREE.IcosahedronGeometry(1);
			break;
		}
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