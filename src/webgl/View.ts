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

export default class View {
	// Three.js
	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	private clock: THREE.Clock;
	private camera: THREE.PerspectiveCamera;

	// Cannon
	private world: CANNON.World;
	private gravity = new THREE.Vector3();

	private walls: Walls;
	private die: Die;

	constructor(canvasElem: HTMLCanvasElement, platonics: THREE.Group) {
		// Three.js setup
		this.renderer = new THREE.WebGLRenderer({
			canvas: canvasElem,
			antialias: true,
		});
		this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
		this.camera.position.z = 10;
		this.clock = new THREE.Clock(true);
		this.scene = new THREE.Scene();

		const envs = {
			matte: texLoader.load("./textures/envMatte1.png"),
			gold: texLoader.load("./textures/envGold3.png"),
			glass: texLoader.load("./textures/envGlassy3.jpg"),
		};

		// Cannon setup
		this.world = new CANNON.World({
			gravity: new CANNON.Vec3(0, -30, 0),
		});

		this.die = new Die(12, platonics, envs);
		this.scene.add(this.die.mesh);
		this.world.addBody(this.die.body);

		this.walls = new Walls(envs.matte);
		this.walls.addToView(this.scene, this.world);

		// Set initial sizes
		this.onWindowResize(window.innerWidth, window.innerHeight);
	}

	public onDieTypeChange(sides: SideTypes) {
		this.die.updateGeometry(sides);
	}

	public onGravityChange(gravity: any) {
		this.world.gravity.set(0, -gravity.y, gravity.x);
	}

	// Apply gimbal rotations to gravity
	public onGimbalChange(rotation: THREE.Quaternion): void {
		this.gravity.set(0, -30, 0);
		this.gravity.applyQuaternion(rotation);
		this.world.gravity.set(this.gravity.x, this.gravity.y, this.gravity.z);
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