/*
 * Die.ts
 * ===========
 * Single die visualization with physics body
 */

import * as THREE from "three";
import * as CANNON from "cannon-es";

import vertShader from "./glsl/die.vs";
import fragShader from "./glsl/die.fs";
import { randInt, texLoader } from "~Utils";
import { SideTypes } from "~Utils/Constants";

interface Matcaps {
	gold: THREE.Texture,
	glass: THREE.Texture
}

export default class Die {
	private geom: THREE.BufferGeometry;
	private mat: THREE.RawShaderMaterial;
	private platonics: THREE.Group;
	public mesh: THREE.Mesh;

	private boundShape: CANNON.ConvexPolyhedron;
	public body: CANNON.Body;
	public bounceMat: CANNON.Material;

	private timeU: THREE.IUniform;
	private mapU: THREE.IUniform;

	constructor(sides: SideTypes, platonics: THREE.Group, matcaps: Matcaps) {
		this.platonics = platonics;

		this.mat = new THREE.RawShaderMaterial({
			uniforms: {
				time: { value: 0 },
				uEnvGold: { value: matcaps.gold },
				uEnvGlass: { value: matcaps.glass },
				uMap: { value: null }
			},
			vertexShader: vertShader,
			fragmentShader: fragShader
		});
		this.timeU = this.mat.uniforms.time;
		this.mapU = this.mat.uniforms.uMap;

		this.bounceMat = new CANNON.Material("die-bounce");
		this.body = new CANNON.Body({
			mass: 1,
			material: this.bounceMat,
			linearDamping: 0.1
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

		// Update number mapping
		const map = texLoader.load(`./textures/map${name}.png`);
		map.anisotropy = 16;
		map.flipY = false;
		this.mapU.value = map;

		if (!this.mesh) {
			this.mesh = new THREE.Mesh(this.geom, this.mat);
			this.mesh.castShadow = true;
		} else {
			this.mesh.geometry = this.geom;
		}

		// Build physics bounding shape
		const pos = this.geom.getAttribute("position").array;
		const vertArray: Array<CANNON.Vec3> = [];
		let dupe: CANNON.Vec3;

		for(let i3 = 0; i3 < pos.length; i3 += 3) {
			// Find duplicates
			dupe = vertArray.find((elem) => 
				elem.x === pos[i3 + 0] &&
				elem.y === pos[i3 + 1] &&
				elem.z === pos[i3 + 2]
			);

			// Add to array if no dupe found
			if (!dupe) {
				vertArray.push(new CANNON.Vec3(
					pos[i3 + 0],
					pos[i3 + 1],
					pos[i3 + 2],
				));
			}
		}

		const randFloat = THREE.MathUtils.randFloatSpread;

		// Reset body
		this.boundShape = new CANNON.ConvexPolyhedron({ vertices: vertArray });
		this.body.addShape(this.boundShape);
		this.body.position.set(0, randFloat(10), 0);
		this.body.velocity.setZero();

		this.body.angularVelocity.set(
			randFloat(10),
			randFloat(10),
			randFloat(10)
		);
	}

	public update(secs: number): void {
		this.timeU.value = secs;
		this.mesh.position.copy(this.body.position as any as THREE.Vector3);
		this.mesh.quaternion.copy(this.body.quaternion as any as THREE.Quaternion);
	}
}
