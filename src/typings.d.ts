declare interface Window {
	playFlappyGame(): void;
	flappyGamePlaying: boolean;
	onFlappyGameStart(callback: () => void): void;
	onFlappyGameExit(callback: () => void): void;
	compileComposer(text: string): any;
}

declare interface Performance {
	memory?: {
		jsHeapSizeLimit: number,
		totalJSHeapSize: number,
		usedJSHeapSize: number,
	}
}

// Calculator

declare class Calculator {
	constructor(elements: {
		top: HTMLElement,
		bottom: HTMLElement,
		deg: HTMLElement,
		rad: HTMLElement,
		buttons: HTMLElement[],
	});

	readonly topScreen: HTMLElement;
	readonly bottomScreen: HTMLElement;
	readonly currentNumber: string;
	readonly hasEvaluated: boolean;
	readonly justPressedZero: boolean;
	readonly SCREEN_SIZE: number;
	readonly useRad: boolean;

	onEvaluate: (result: string) => any;
	onError: (error: string) => any;

	updateBottomDisplay(): void;
	updateTopDisplay(end?: string): void;
	clearCurrentNumber(): void;
	reset(): void;
	error(error: string): void;
}
