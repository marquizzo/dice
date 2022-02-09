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
// @ts-ignore
import Gimbal from "~Utils/Gimbal.js";

class App {
	private view: View;
	private pane: any;
	private dieSides: SideTypes = 12;
	private gravity = {x: 0, y: 9.82};
	private gimbal: Gimbal;

	constructor() {
		const gltfLoader = new GLTFLoader();
		gltfLoader.load("./models/platonics.glb", this.init);

		window.addEventListener("resize", this.resize);
	}

	private init = (payload: GLTF):void => {
		const canvasBox = <HTMLCanvasElement>document.getElementById("webgl-canvas");
		this.view = new View(canvasBox, payload.scene);

		// Add GUI
		this.pane = new Pane();
		console.log(this.pane);
		const btn = this.pane.addButton({
			title: "Request gyroscope",
			label: "Click"
		}).on("click", this.requestGyroscope);

		this.pane.addInput(this, "dieSides", {
			options: {4: 4, 6: 6, 8: 8, 12: 12, 20: 20},
			label: "Die sides",
		}).on("change", this.dieTypeChanged);

		this.pane.addInput(this, "gravity", {
			picker: 'inline',
			expanded: true,
			label: "Gravity",
			x: { min: -30, max: 30},
			y: { min: -30, max: 30},
		}).on("change", this.gravityChanged);
		this.update(0);
	}

	// Request gyroscope permission from Safari
	private requestGyroscope = (event: Event): void => {
		this.pane.remove(event.target);

		const motion: any = DeviceMotionEvent;

		if (!motion || !motion.requestPermission) {
			console.warn("This browser does not support requesting DeviceMotionEvent permission.");
			return;
		}
		
		motion.requestPermission().then((response: any) => {
			if (response == 'granted') {
				// Now we can enable the gimbal!
				this.gimbal = new Gimbal();
				this.gimbal.enable();
			}
		});

	}

	private dieTypeChanged = (ev: any): void => {
		this.view.onDieTypeChange(ev.value);
	}

	private gravityChanged = (ev: any): void => {
		this.view.onGravityChange(this.gravity);
	}

	private resize = (): void => {
		this.view.onWindowResize(window.innerWidth, window.innerHeight);
	}

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
