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

class App {
	private view: View;
	private pane: any;
	private dieSides: SideTypes = 4;
	private gravity = {x: 0, y: 9.82};

	constructor() {
		const gltfLoader = new GLTFLoader();
		gltfLoader.load("./models/platonics.glb", this.init);

		window.addEventListener("resize", this.resize);
	}

	private init = (payload: GLTF):void => {
		console.log(payload);
		const canvasBox = <HTMLCanvasElement>document.getElementById("webgl-canvas");
		this.view = new View(canvasBox, payload.scene);

		// Add GUI
		this.pane = new Pane();
		this.pane.addInput(this, "dieSides", {
			options: {4: 4, 6: 6, 8: 8, 12: 12, 20: 20},
			label: "Die sides",
		}).on("change", this.dieTypeChanged);
		this.pane.addInput(this, "gravity", {
			picker: 'inline',
			expanded: true,
			label: "Gravity",
			x: { min: -10, max: 10},
			y: { min: -10, max: 10},
		}).on("change", this.gravityChanged);
		this.update(0);
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
		this.view.update(t / 1000);
		requestAnimationFrame(this.update);
	}
}

const app = new App();
