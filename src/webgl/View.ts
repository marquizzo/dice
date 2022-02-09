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
	private light: THREE.SpotLight;

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
		this.scene.background = new THREE.TextureLoader().load("./textures/bgnd.png");
		const matcap = texLoader.load("./textures/envGlassy3.jpg");

		// Cannon setup
		this.world = new CANNON.World({
			gravity: new CANNON.Vec3(0, -9.82, 0),
		});

		this.die = new Die(4, platonics, matcap);
		this.scene.add(this.die.mesh);
		this.world.addBody(this.die.body);

		this.walls = new Walls(matcap);
		this.walls.addToView(this.scene, this.world);

		// Shadow setup
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.light = new THREE.SpotLight(0xffffff, 1, 50, 20, 1);
		this.light.position.set(0, 8, 4);
		this.light.castShadow = true;
		this.scene.add(this.light);
		// this.light.target = this.die.mesh;
		// this.scene.add(this.light.target);

		this.light.shadow.mapSize.width = 1024; // default
		this.light.shadow.mapSize.height = 1024; // default
		this.light.shadow.camera.near = 1; // default
		this.light.shadow.camera.far = 50; // default

		// Set initial sizes
		this.onWindowResize(window.innerWidth, window.innerHeight);
	}

	public onDieTypeChange(sides: SideTypes) {
		this.die.updateGeometry(sides);
	}

	public onGravityChange(gravity: any) {
		this.world.gravity.set(gravity.x, -gravity.y, 0);
	}

	// Apply gimbal rotations to gravity
	public onGimbalChange(rotation: THREE.Quaternion): void {
		this.gravity.set(0, -9.8, 0);
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

		// const pos = this.die.mesh.position;
		// this.light.target = ;
		this.light.updateMatrix();
		this.renderer.render(this.scene, this.camera);
	}
}