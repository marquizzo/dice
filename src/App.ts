/*
 * App.ts
 * ===========
 * Entry from Webpack, generates Three.js View
 * Captures user commands to delegate to View
 */

import View from "./webgl/View";
import { Pane } from "tweakpane";
import { SideTypes } from "~Utils/Constants";
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
// @ts-ignore JS file
import Gimbal from "~Utils/Gimbal.js";

class App {
	private view: View;
	private pane: any;
	private dieSides: SideTypes = 12;
	private gravity = {x: 0, y: 0};
	private gimbal: Gimbal;

	constructor() {
		const gltfLoader = new GLTFLoader();
		gltfLoader.load("./models/platonics.glb", this.init);

		window.addEventListener("resize", this.resize);
	}

	// Initialize view after models loaded
	private init = (payload: GLTF):void => {
		const canvasBox = <HTMLCanvasElement>document.getElementById("webgl-canvas");
		this.view = new View(canvasBox, payload.scene);

		// Add GUI
		this.pane = new Pane();
		this.pane.containerElem_.style.top = "auto";
		this.pane.containerElem_.style.bottom = "8px";
		
		// Request gyroscope button
		this.pane.addButton({
			title: "Request gyroscope",
			label: "Step 1:"
		}).on("click", this.requestGyroscope);

		this.update(0);
	}

	// Request gyroscope permission from Safari
	private requestGyroscope = (event: Event): void => {
		// Removes btn
		this.pane.remove(event.target);

		// Adds die side selection
		this.pane.addInput(this, "dieSides", {
			options: {4: 4, 6: 6, 8: 8, 12: 12, 20: 20},
			label: "Die sides",
		}).on("change", this.dieTypeChanged);

		// Check browser support
		const motion: any = DeviceMotionEvent;
		if (!motion || !motion.requestPermission) {
			console.warn("This browser does not support requesting DeviceMotionEvent permission.");
			this.addGUIGravity();
			return;
		} 

		// Perform request
		motion.requestPermission().then((response: any) => {
			if (response == 'granted') {
				// Now we can enable the gimbal!
				this.gimbal = new Gimbal();
				this.gimbal.enable();
				const instructions = document.querySelector("#instructions");
				instructions.textContent = "Rotate device to throw the die.";
				return;
			} else {
				this.addGUIGravity();
			}
		});
	}

	// Adds manual gravity control if gyroscope not granted
	private addGUIGravity(): void {
		this.pane.addInput(this, "gravity", {
			picker: 'inline',
			expanded: true,
			label: "Gravity",
			x: { min: -1, max: 1},
			y: { min: -1, max: 1},
		}).on("change", this.gravityChanged);
	}

	// Change die sides
	private dieTypeChanged = (ev: any): void => {
		this.view.onDieTypeChange(ev.value);
	}

	// GUI change to gravity
	private gravityChanged = (ev: any): void => {
		this.view.onGravityChange(this.gravity);
	}

	private resize = (): void => {
		this.view.onWindowResize(window.innerWidth, window.innerHeight);
	}

	// Animation loop
	private update = (t: number): void => {
		if (this.gimbal) {
			this.gimbal.update();
			this.view.onGimbalChange(this.gimbal.quaternion);
		}
		this.view.update(t / 1000);
		requestAnimationFrame(this.update);
	}
}

const app = new App();
