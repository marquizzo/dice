/*
 * View.ts
 * ===========
 * Topmost Three.js class. 
 * Controls scene, cam, renderer, and objects in scene.
 */

import * as THREE from "three";
import * as CANNON from "cannon-es";
import Die from "./Die";
import Walls from "./Walls";
import { texLoader } from "~Utils";
import { SideTypes } from "~Utils/Constants";

const GRAVITY_MAGNITUDE = 60;

export default class View {
	// Three.js
	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	private clock: THREE.Clock;
	private camera: THREE.PerspectiveCamera;

	// Cannon
	private world: CANNON.World;
	private gravVec = new THREE.Vector3();
	private contactMat: CANNON.ContactMaterial;

	private walls: Walls;
	private die: Die;

	constructor(canvasElem: HTMLCanvasElement, platonics: THREE.Group) {
		// Three.js setup
		this.renderer = new THREE.WebGLRenderer({
			canvas: canvasElem,
			antialias: true,
		});
		this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
		this.camera.position.z = 40;
		this.clock = new THREE.Clock(true);
		this.scene = new THREE.Scene();

		const envs = {
			matte: texLoader.load("./textures/envMatte1.png"),
			gold: texLoader.load("./textures/envGold3.png"),
			glass: texLoader.load("./textures/envGlassy3.jpg"),
		};

		// Cannon setup
		this.world = new CANNON.World({
			gravity: new CANNON.Vec3(0, 0, 0),
		});

		this.die = new Die(12, platonics, envs);
		this.scene.add(this.die.mesh);
		this.world.addBody(this.die.body);

	
		this.walls = new Walls(envs.matte);
		this.walls.addToView(this.scene, this.world);

		const wallBounceMat = this.walls.bounceMat;
		const dieBounceMat = this.die.bounceMat;
		const contactOptions = {friction: 0.1, restitution: 0.5 };
		this.contactMat = new CANNON.ContactMaterial(wallBounceMat, dieBounceMat, contactOptions);
		this.world.addContactMaterial(this.contactMat);

		// Set initial sizes
		this.onWindowResize(window.innerWidth, window.innerHeight);
	}

	// Change die sides
	public onDieTypeChange(sides: SideTypes) {
		this.die.updateGeometry(sides);
	}

	// Manual gravity change
	public onGravityChange(input: any) {
		let zMagnitude = 1.0 - Math.sqrt(input.x * input.x + input.y * input.y);
		zMagnitude = Math.max(zMagnitude, 0.0);
		this.gravVec.set(input.x, input.y, zMagnitude);
		this.gravVec.normalize();
		this.gravVec.multiplyScalar(GRAVITY_MAGNITUDE);
		this.world.gravity.set(this.gravVec.x, -this.gravVec.y, -this.gravVec.z);
	}

	// Apply gimbal rotations to gravity
	public onGimbalChange(rotation: THREE.Quaternion): void {
		this.gravVec.set(0, -60, 0);
		this.gravVec.applyQuaternion(rotation);
		this.world.gravity.set(this.gravVec.x, this.gravVec.y, this.gravVec.z);
	}

	public onWindowResize(vpW: number, vpH: number): void {
		this.renderer.setSize(vpW, vpH);
		this.camera.aspect = vpW / vpH;
		this.camera.updateProjectionMatrix();
		this.walls.onWindowResize(vpW, vpH);
	}

	public update(secs: number): void {
		const delta = Math.min(this.clock.getDelta(), 0.5);
		this.world.step(delta);
		this.die.update(secs);

		this.renderer.render(this.scene, this.camera);
	}
}