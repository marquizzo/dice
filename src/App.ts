/*
 * App.ts
 * ===========
 * Entry from Webpack, generates Three.js View
 * Captures user commands to delegate to View
 */

import View from "./webgl/View";
import { Pane } from "tweakpane";
import { SideTypes } from "~Utils/Constants";

class App {
	private view: View;
	private pane: any;
	private dieSides: SideTypes = 6;

	constructor() {
		const canvasBox = <HTMLCanvasElement>document.getElementById("webgl-canvas");
		this.view = new View(canvasBox);
		this.pane = new Pane();
		this.pane.addInput(this, "dieSides", {
			options: {4: 4, 6: 6, 8: 8, 12: 12, 20: 20},
			label: "Die sides",
		}).on("change", this.dieTypeChanged);

		window.addEventListener("resize", this.resize);
		this.update(0);
	}

	private dieTypeChanged = (ev: any): void => {
		this.view.onDieTypeChange(ev.value);
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
