const canvas = document.querySelector("#gl-canvas");
const ctx = canvas.getContext("2d");
let chosen = 0;
let shapeList = [];
const TRANSLATION = 0,
	SCALING = 1;
	ROTATION = 2;
let transformation = TRANSLATION;
const LINE = 0,
	CIRCLE = 1,
	RECTANGLE = 2,
	TRIANGLE = 3,
	POLYGON = 4;
var selectedShape = "line";
const center = [
	{ x: 125, y: 150 },
	{ x: 300, y: 150 },
	{ x: 475, y: 150 },
	{ x: 185, y: 415 },
	{ x: 475, y: 390 },
];
const mouse = {
	drag: null,
	move: null,
};
class Shape {
	constructor(kind) {
		this.kind = kind;
	}
	make() {
		const choiceMade = this.kind === chosen;
		let length = 0;
		if (mouse.drag && mouse.move) {
			length = ((mouse.drag.yInit - mouse.move.y) *(mouse.drag.yInit - mouse.move.y) 
					+ (mouse.drag.xInit - mouse.move.x) * (mouse.drag.xInit - mouse.move.x)) / 20000;
		}
		if (choiceMade && mouse.move && transformation === TRANSLATION) {
			ctx.translate(mouse.move.x - center[chosen].x, mouse.move.y - center[chosen].y);
		} else if (choiceMade && mouse.drag && transformation === SCALING) {
			length = length + 0.05;
			ctx.translate(center[chosen].x, center[chosen].y);
			ctx.scale(length, length);
			ctx.translate(-center[chosen].x, -center[chosen].y);
		} else if (choiceMade && mouse.drag && transformation === ROTATION) {
			ctx.translate(center[chosen].x, center[chosen].y);
			ctx.rotate(length % Math.PI*2.0);
			ctx.translate(-center[chosen].x, -center[chosen].y);
		}
		if (this.kind === LINE) {
			makeLine(choiceMade);
		} else if (this.kind === CIRCLE) {
			makeCircle(choiceMade);
		} else if (this.kind === RECTANGLE) {
			makeRectangle(choiceMade);
		} else if (this.kind === TRIANGLE) {
			makeTriangle(choiceMade);
		} else if (this.kind === POLYGON) {
			makePolygon(choiceMade);
		}
		if (choiceMade && mouse.move && transformation === TRANSLATION) {
			ctx.translate(center[chosen].x - mouse.move.x, center[chosen].y - mouse.move.y);
		} else if (choiceMade && mouse.drag && transformation === SCALING) {
			ctx.translate(center[chosen].x, center[chosen].y);
			ctx.scale(1 / length, 1 / length);
			ctx.translate(-center[chosen].x, -center[chosen].y);
		} else if (choiceMade && mouse.drag && transformation === ROTATION) {
			ctx.translate(center[chosen].x, center[chosen].y);
			ctx.rotate(-length % Math.PI*2.0);
			ctx.translate(-center[chosen].x, -center[chosen].y);
		}
	}
}
window.onload = function init() {
	for (let i = 4; i >= 0; --i) {
		shapeList.push(new Shape(i));
	}
	setInterval(makeCanvas);
	canvas.addEventListener("mousemove", function (event) {
		const domRect = canvas.getBoundingClientRect();
		if (mouse.move === null) {
		  mouse.move = {};
		}
		mouse.move.y = -domRect.top + event.clientY;
		mouse.move.x = -domRect.left + event.clientX;
	});
	canvas.addEventListener("mouseup", function (event) {
		mouse.drag = null;
	});
	canvas.addEventListener("mousedown", function (event) {
		const domRect = canvas.getBoundingClientRect();
		mouse.drag = {
		  xInit: event.clientX - domRect.left,
		  yInit: event.clientY - domRect.top,
		};
	});
	canvas.addEventListener("mouseleave", function (event) {
		mouse.move = null;
		mouse.drag = null;
	});
};
function makeCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let s of shapeList) {
    s.make();
  }
}
const shapesSelection = document.querySelector("#shapesSelection");
if (shapesSelection) {
	shapesSelection.addEventListener("change", function (e) {
		const nShape = e.target.value;
		const sNames = ["line", "circle", "rectangle", "triangle", "polygon"];
		chosen = sNames.indexOf(nShape);
	});
}
const transformationSelect = document.querySelector("#transformationSelect");
if (transformationSelect) {
	transformationSelect.addEventListener("change", function (e) {
		const nTransform = e.target.value;
		const tNames = ["translation", "scaling", "rotation"];
		transformation = tNames.indexOf(nTransform);
	});
}
function makeLine(choiceMade) {
	ctx.strokeStyle = choiceMade ? "red" : "mediumseagreen";
	ctx.beginPath();
	ctx.moveTo(50, 150);
	ctx.lineTo(175, 150);
	ctx.stroke();
}
function makeTriangle(choiceMade) {
	ctx.fillStyle = choiceMade ? "red" : "lightskyblue";
	ctx.beginPath();
	ctx.moveTo(50, 475);
	ctx.lineTo(250, 475);
	ctx.lineTo(250, 325);
	ctx.closePath();
	ctx.fill();
}
function makeCircle(choiceMade) {
	const r = 75;
	ctx.fillStyle = choiceMade ? "red" : "peachpuff";
	ctx.beginPath();
	ctx.arc(300, 150, r, 0, 2.0*Math.PI);
	ctx.fill();
}
function makePolygon(choiceMade) {
	ctx.fillStyle = choiceMade ? "red" : "lightsteelblue";
	ctx.beginPath();
	ctx.moveTo(425, 475);
	ctx.lineTo(525, 475);
	ctx.lineTo(525, 400);
	ctx.lineTo(475, 300);
	ctx.lineTo(425, 400);
	ctx.closePath();
	ctx.fill();
}
function makeRectangle(choiceMade) {
	ctx.fillStyle = choiceMade ? "red" : "lavenderblush";
	ctx.beginPath();
	ctx.rect(425, 75, 100, 150);
	ctx.fill();
}