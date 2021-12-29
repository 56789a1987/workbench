// Reference: http://members.chello.at/~easyfilter/Bresenham.pdf

const { abs, sqrt, floor } = Math;

export function fillLine(x0: number, y0: number, x1: number, y1: number): number[] {
	const points = [];
	const dx = abs(x1 - x0), dy = -abs(y1 - y0);
	const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
	let e = dx + dy;

	while (true) {
		points.push(x0, y0);
		if (x0 === x1 && y0 === y1) {
			break;
		}
		const e2 = e * 2;
		if (e2 >= dy) {
			e += dy;
			x0 += sx;
		}
		if (e2 <= dx) {
			e += dx;
			y0 += sy;
		}
	}

	return points;
}

export function outlineRect(x0: number, y0: number, x1: number, y1: number): number[] {
	const points = [];
	const sx = x0 < x1 ? x0 : x1;
	const sy = y0 < y1 ? y0 : y1;
	const dx = x0 > x1 ? x0 : x1;
	const dy = y0 > y1 ? y0 : y1;

	for (let x = sx; x <= dx; x++) {
		points.push(x, sy, x, dy);
	}

	for (let y = sy + 1; y <= dy - 1; y++) {
		points.push(sx, y, dx, y);
	}

	return points;
}

export function fillRect(x0: number, y0: number, x1: number, y1: number): number[] {
	const points = [];
	const sx = x0 < x1 ? x0 : x1;
	const sy = y0 < y1 ? y0 : y1;
	const dx = x0 > x1 ? x0 : x1;
	const dy = y0 > y1 ? y0 : y1;

	for (let x = sx; x <= dx; x++) {
		for (let y = sy; y <= dy; y++) {
			points.push(x, y);
		}
	}

	return points;
}

export function outlinePolygon(...vertices: number[]) {
	if (vertices.length < 4) {
		return [];
	} else if (vertices.length < 6) {
		return fillLine(vertices[0], vertices[1], vertices[2], vertices[3]);
	} else {
		let points: number[] = [];
		const length = vertices.length;

		for (let i = 0; i < length - 2; i += 2) {
			points = points.concat(fillLine(vertices[i], vertices[i + 1], vertices[i + 2], vertices[i + 3]));
		}

		return points.concat(fillLine(vertices[0], vertices[1], vertices[length - 2], vertices[length - 1]));
	}
}

export function fillPolygon(...vertices: number[]) {
	if (vertices.length < 4) {
		return [];
	} else if (vertices.length < 6) {
		return fillLine(vertices[0], vertices[1], vertices[2], vertices[3]);
	} else {
		const points = [];
		let top = Infinity, right = -Infinity, bottom = -Infinity, left = Infinity;
		let count = 0, nX: number[] = [], vcX: number[] = [], vcY: number[] = [], nodes, i, j;

		for (let i = 0; i < vertices.length; i += 2) {
			const x = vertices[i];
			const y = vertices[i + 1];
			count++;
			vcX.push(x);
			vcY.push(y);
			if (x < left) {
				left = x;
			}
			if (x > right) {
				right = x;
			}
			if (y < top) {
				top = y;
			}
			if (y > bottom) {
				bottom = y;
			}
		}

		for (let y = top; y < bottom; y++) {
			nX.length = 0;
			nodes = 0;
			j = count - 1;

			for (i = 0; i < count; i++) {
				if (vcY[i] < y && vcY[j] >= y || vcY[j] < y && vcY[i] >= y) {
					nX[nodes++] = Math.round(vcX[i] + (y - vcY[i]) / (vcY[j] - vcY[i]) * (vcX[j] - vcX[i]));
				}
				j = i;
			}

			nX.sort((a, b) => a - b);

			for (i = 0; i < nodes; i += 2) {
				if (nX[i] >= right) {
					break;
				}
				if (nX[i + 1] > left) {
					if (nX[i] < left) {
						nX[i] = left;
					}
					if (nX[i + 1] > right) {
						nX[i + 1] = right;
					}
					for (let x = nX[i]; x <= nX[i + 1]; x++) {
						points.push(x, y);
					}
				}
			}
		}

		return points;
	}
}

export function fillPolygon2(...vertices: number[]) {
	return fillPolygon(...vertices).concat(outlinePolygon(...vertices));
}

export function outlineEllipse(ox: number, oy: number, w: number, h: number): number[] {
	if (w < 0 || h < 0) {
		return [];
	}

	const points = [];
	let x = 0, y = -h;
	let e2 = w;
	let dx = y * y, dy = (y * 2 + 1) * e2 * e2;
	let e = dx + dy;

	do {
		points.push(ox - x, oy + y, ox + x, oy + y, ox + x, oy - y, ox - x, oy - y);

		e2 = 2 * e;
		if (e2 >= dy) {
			y++;
			e += dy += 2 * w * w;
		}
		if (e2 < dx) {
			x++;
			e += dx += 2 * h * h;
		}
	} while (y <= 0);

	while (x++ < w) {
		points.push(ox + x, oy, ox - x, oy);
	}

	return points;
}

export function fillEllipse(ox: number, oy: number, w: number, h: number): number[] {
	if (w < 0 || h < 0) {
		return [];
	}

	const points = [];
	let x = 0, y = -h;
	let e2 = w;
	let dx = y * y, dy = (y * 2 + 1) * e2 * e2;
	let e = dx + dy;
	let ly = y;

	do {
		points.push(ox - x, oy + y, ox + x, oy + y, ox + x, oy - y, ox - x, oy - y);
		if (ly !== y) {
			for (let xx = -x + 1; xx < x; xx++) {
				points.push(ox + xx, oy + y);
				if (y !== 0) {
					points.push(ox + xx, oy - y);
				}
			}
			ly = y;
		}

		e2 = 2 * e;
		if (e2 >= dy) {
			y++;
			e += dy += 2 * w * w;
		}
		if (e2 < dx) {
			x++;
			e += dx += 2 * h * h;
		}
	} while (y <= 0);

	while (x++ < w) {
		points.push(ox + x, oy, ox - x, oy);
	}

	return points;
}

export function fillQuadBezierSeg(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): number[] {
	let sx = x2 - x1, sy = y2 - y1;
	let xx = x0 - x1, yy = y0 - y1, xy;
	let dx, dy, err, cur = xx * sy - yy * sx;

	if (xx * sx > 0 || yy * sy > 0) {
		return [];
	}

	let points = [];

	if (sx * sx + sy * sy > xx * xx + yy * yy) {
		x2 = x0;
		x0 = sx + x1;
		y2 = y0;
		y0 = sy + y1;
		cur = -cur;
	}
	if (cur !== 0) {
		xx += sx;
		xx *= sx = x0 < x2 ? 1 : -1;
		yy += sy;
		yy *= sy = y0 < y2 ? 1 : -1;
		xy = 2 * xx * yy;
		xx *= xx;
		yy *= yy;
		if (cur * sx * sy < 0) {
			xx = -xx;
			yy = -yy;
			xy = -xy;
			cur = -cur;
		}
		dx = 4.0 * sy * cur * (x1 - x0) + xx - xy;
		dy = 4.0 * sx * cur * (y0 - y1) + yy - xy;
		xx += xx;
		yy += yy;
		err = dx + dy + xy;
		do {
			points.push(x0, y0);
			if (x0 === x2 && y0 === y2) {
				return points;
			}
			y1 = 2 * err < dx ? 1 : 0;
			if (2 * err > dy) {
				x0 += sx;
				dx -= xy;
				err += dy += yy;
			}
			if (y1) {
				y0 += sy;
				dy -= xy;
				err += dx += xx;
			}
		} while (dy < 0 && dx > 0);
	}
	points = points.concat(fillLine(x0, y0, x2, y2));

	return points;
}

export function fillCubicBezierSeg(
	x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number
): number[] {
	let sx = x0 < x3 ? 1 : -1, sy = y0 < y3 ? 1 : -1;
	let xc = -abs(x0 + x1 - x2 - x3), xa = xc - 4 * sx * (x1 - x2), xb = sx * (x0 - x1 - x2 + x3);
	let yc = -abs(y0 + y1 - y2 - y3), ya = yc - 4 * sy * (y1 - y2), yb = sy * (y0 - y1 - y2 + y3);
	let f, fx, fy, leg = 1, ab, ac, bc, cb, xx, xy, yy, dx, dy, ex, pxy, EP = 0.01;

	if (
		!((x1 - x0) * (x2 - x3) < EP && ((x3 - x0) * (x1 - x2) < EP || xb * xb < xa * xc + EP)) ||
		!((y1 - y0) * (y2 - y3) < EP && ((y3 - y0) * (y1 - y2) < EP || yb * yb < ya * yc + EP))
	) {
		return [];
	}

	if (xa === 0 && ya === 0) {
		sx = floor((3 * x1 - x0 + 1) / 2);
		sy = floor((3 * y1 - y0 + 1) / 2);
		return fillQuadBezierSeg(x0, y0, sx, sy, x3, y3);
	}

	let points = [];
	x1 = (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0) + 1;
	x2 = (x2 - x3) * (x2 - x3) + (y2 - y3) * (y2 - y3) + 1;

	do {
		ab = xa * yb - xb * ya;
		ac = xa * yc - xc * ya;
		bc = xb * yc - xc * yb;
		ex = ab * (ab + ac - 3 * bc) + ac * ac;
		f = ex > 0 ? 1 : sqrt(1 + 1024 / x1);
		ab *= f;
		ac *= f;
		bc *= f;
		ex *= f * f;
		xy = 9 * (ab + ac + bc) / 8;
		cb = 8 * (xa - ya);
		dx = 27 * (8 * ab * (yb * yb - ya * yc) + ex * (ya + 2 * yb + yc)) / 64 - ya * ya * (xy - ya);
		dy = 27 * (8 * ab * (xb * xb - xa * xc) - ex * (xa + 2 * xb + xc)) / 64 - xa * xa * (xy + xa);
		xx = 3 * (3 * ab * (3 * yb * yb - ya * ya - 2 * ya * yc) - ya * (3 * ac * (ya + yb) + ya * cb)) / 4;
		yy = 3 * (3 * ab * (3 * xb * xb - xa * xa - 2 * xa * xc) - xa * (3 * ac * (xa + xb) + xa * cb)) / 4;
		xy = xa * ya * (6 * ab + 6 * ac - 3 * bc + cb);
		ac = ya * ya;
		cb = xa * xa;
		xy = 3 * (xy + 9 * f * (cb * yb * yc - xb * xc * ac) - 18 * xb * yb * ab) / 8;
		if (ex < 0) {
			dx = -dx;
			dy = -dy;
			xx = -xx;
			yy = -yy;
			xy = -xy;
			ac = -ac;
			cb = -cb;
		}
		ab = 6 * ya * ac;
		ac = -6 * xa * ac;
		bc = 6 * ya * cb;
		cb = -6 * xa * cb;
		dx += xy;
		ex = dx + dy;
		dy += xy;
		let valid = false;
		let skip = false;
		for (pxy = xy, fx = fy = f; x0 !== x3 && y0 !== y3;) {
			points.push(x0, y0);
			do {
				if (dx > pxy || dy < pxy) {
					skip = true;
					break;
				}
				y1 = 2 * ex - dy;
				if (2 * ex >= dx) {
					fx--;
					ex += dx += xx;
					dy += xy += ac;
					yy += bc;
					xx += ab;
				}
				if (y1 <= 0) {
					fy--;
					ex += dy += yy;
					dx += xy += bc;
					xx += ac;
					yy += cb;
				}
			} while (fx > 0 && fy > 0);
			if (skip) {
				break;
			}
			if (2 * fx <= f) {
				x0 += sx;
				fx += f;
			}
			if (2 * fy <= f) {
				y0 += sy;
				fy += f;
			}
			if (!valid && dx < 0 && dy > 0) {
				pxy = EP;
				valid = true;
			}
		}
		xx = x0;
		x0 = x3;
		x3 = xx;
		sx = -sx;
		xb = -xb;
		yy = y0;
		y0 = y3;
		y3 = yy;
		sy = -sy;
		yb = -yb;
		x1 = x2;
	} while (leg--);

	points = points.concat(fillLine(x0, y0, x3, y3));
	return points;
}

export function fillCubicBezier(
	x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number
): number[] {
	let points: number[] = [];
	const xc = x0 + x1 - x2 - x3, xa = xc - 4 * (x1 - x2);
	const xb = x0 - x1 - x2 + x3, xd = xb + 4 * (x1 + x2);
	const yc = y0 + y1 - y2 - y3, ya = yc - 4 * (y1 - y2);
	const yb = y0 - y1 - y2 + y3, yd = yb + 4 * (y1 + y2);
	let n = 0, i = 0;
	let fx0 = x0, fx1, fx2, fx3;
	let fy0 = y0, fy1, fy2, fy3;

	let t1 = xb * xb - xa * xc, t2, t: number[] = [];
	if (xa === 0) {
		if (abs(xc) < abs(xb) * 2) {
			t[n++] = xc / (xb * 2);
		}
	} else if (t1 > 0) {
		t2 = sqrt(t1);
		t1 = (xb - t2) / xa;
		if (abs(t1) < 1) {
			t[n++] = t1;
		}
		t1 = (xb + t2) / xa;
		if (abs(t1) < 1) {
			t[n++] = t1;
		}
	}

	t1 = yb * yb - ya * yc;
	if (ya === 0) {
		if (abs(yc) < abs(yb) * 2) {
			t[n++] = yc / (yb * 2);
		}
	} else if (t1 > 0) {
		t2 = sqrt(t1);
		t1 = (yb - t2) / ya;
		if (abs(t1) < 1) {
			t[n++] = t1;
		}
		t1 = (yb + t2) / ya;
		if (abs(t1) < 1) {
			t[n++] = t1;
		}
	}

	t.sort((a, b) => a - b);

	t1 = -1;
	t[n] = 1;

	for (i = 0; i <= n; i++) {
		t2 = t[i];
		fx1 = (t1 * (t1 * xb - 2 * xc) - t2 * (t1 * (t1 * xa - 2 * xb) + xc) + xd) / 8 - fx0;
		fy1 = (t1 * (t1 * yb - 2 * yc) - t2 * (t1 * (t1 * ya - 2 * yb) + yc) + yd) / 8 - fy0;
		fx2 = (t2 * (t2 * xb - 2 * xc) - t1 * (t2 * (t2 * xa - 2 * xb) + xc) + xd) / 8 - fx0;
		fy2 = (t2 * (t2 * yb - 2 * yc) - t1 * (t2 * (t2 * ya - 2 * yb) + yc) + yd) / 8 - fy0;
		fx0 -= fx3 = (t2 * (t2 * (3 * xb - t2 * xa) - 3 * xc) + xd) / 8;
		fy0 -= fy3 = (t2 * (t2 * (3 * yb - t2 * ya) - 3 * yc) + yd) / 8;
		x3 = floor(fx3 + 0.5);
		y3 = floor(fy3 + 0.5);
		if (fx0 !== 0) {
			fx1 *= fx0 = (x0 - x3) / fx0;
			fx2 *= fx0;
		}
		if (fy0 !== 0) {
			fy1 *= fy0 = (y0 - y3) / fy0;
			fy2 *= fy0;
		}
		if (x0 !== x3 || y0 !== y3) {
			points = points.concat(fillCubicBezierSeg(x0, y0, x0 + fx1, y0 + fy1, x0 + fx2, y0 + fy2, x3, y3));
		}
		x0 = x3;
		y0 = y3;
		fx0 = fx3;
		fy0 = fy3;
		t1 = t2;
	}

	return points;
}

export function putPointPairs(points: number[], { data, width, height }: ImageData, r: number, g: number, b: number, a = 0xff) {
	for (let i = 0; i < points.length;) {
		const x = points[i++], y = points[i++];
		if (x < 0 || x >= width || y < 0 || y >= height) {
			continue;
		}
		let idx = (x + y * width) * 4;
		data[idx++] = r;
		data[idx++] = g;
		data[idx++] = b;
		data[idx] = a;
	}
}
