const fs = require('fs');
const path = require('path');
const process = require('process');
const canvas = require('canvas');

const imagesPath = path.join('assets-src', 'icons');
let totalW = 0, totalH = 0;

function getColorType(name, x, y, r, g, b) {
	if (r === 0 && g === 0 && b === 255) {
		return 0;
	} else if (r === 255 && g === 255 && b === 0) {
		return 1;
	} else if (r === 0 && g === 0 && b === 0) {
		return 2;
	} else if (r === 255 && g === 255 && b === 255) {
		return 3;
	} else {
		throw new Error(`Invalid color (${r}, ${g}, ${b}) at (${x}, ${y}) in "${name}".`);
	}
}

function normalize(text) {
	return text.replace(/"/g, '\'').replace(/\n/g, '\r\n').replace(/\r\r/g, '\r');
}

fs.promises.readdir(imagesPath)
	.then(files => files.filter(file => /\.png$/i.test(file)))
	.then(files => Promise.all(files.map(async file => {
		const name = file.replace(/\.png$/i, '');
		const image = await canvas.loadImage(path.join(imagesPath, file));
		const { width, height } = image;

		totalH += height;
		if (totalW < width * 4) {
			totalW = width * 4;
		}

		const inCanvas = canvas.createCanvas(width, height);
		const inCtx = inCanvas.getContext('2d');
		inCtx.drawImage(image, 0, 0);

		const inData = inCtx.getImageData(0, 0, width, height).data;
		const outData = new canvas.ImageData(width * 4, height);

		for (let i = 0; i < inData.length / 4; i++) {
			if (inData[i * 4 + 3] !== 0) {
				let idx = i * 4;
				const x = i % width, y = (i / width) | 0;
				const type = getColorType(name, x, y, inData[idx++], inData[idx++], inData[idx]);

				let outIdx = (x + type * width + y * width * 4) * 4;
				outData.data[outIdx++] = 255;
				outData.data[outIdx++] = 255;
				outData.data[outIdx++] = 255;
				outData.data[outIdx++] = 255;
			}
		}

		return { name, width, height, data: outData };
	})))
	.then(async images => {
		const outCanvas = canvas.createCanvas(totalW, totalH);
		const outCtx = outCanvas.getContext('2d');
		const object = {};
		let top = 0;

		for (const image of images) {
			outCtx.putImageData(image.data, 0, top);
			object[image.name] = {
				y: top,
				w: image.width,
				h: image.height,
			};
			top += image.height;
		}

		const type = `{ [key: string]: { y: number; w: number; h: number; } }`;
		const code = JSON.stringify(object, null, '\t');
		await Promise.all([
			fs.promises.writeFile('src/assets/images/icons-build.png', outCanvas.toBuffer()),
			fs.promises.writeFile('src/icons-build.ts', normalize(`/* tslint:disable */\n\nexport const ICONS: ${type} = ${code};\n`)),
		]);

		console.log(`Built ${images.length} icons`);
	})
	.then(() => process.exit());
