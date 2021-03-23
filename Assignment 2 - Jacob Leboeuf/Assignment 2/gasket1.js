"use strict";

function colorSet(red, green, blue) {
  this.r = red;
  this.g = green;
  this.b = blue;
}
var colorChoice = [
  new colorSet(1.0, 0.0, 0.0),
  new colorSet(1.0, 1.0, 0.0),
  new colorSet(0.0, 1.0, 1.0),
  new colorSet(0.0, 0.0, 1.0),
  new colorSet(0.0, 0.0, 0.0),
  new colorSet(0.0, 1.0, 0.0),
  new colorSet(1.0, 0.0, 1.0),
  new colorSet(0.5, 0.0, 0.0),
  new colorSet(0.5, 0.5, 0.0),
  new colorSet(0.5, 0.5, 0.5),
  new colorSet(0.0, 0.5, 0.5),
];
var gl;
var points;
var NumPoints = 2500;
var lpCnt = 0;
var cWidth = 512;
var cHeight = 512;
var x = 0;
var y = 0;
var userChoice = new colorSet(1.0, 0.0, 0.0);
var gasketStatus = ("Status").bold();
var colorPickerUsed = false;
// From gasket1.html
var vertex_shader = `
  attribute vec4 vPosition;

  void
  main()
  {
    gl_PointSize = 1.0;
      gl_Position = vPosition;
  }
`;

var fragment_shader = `
  precision mediump float;

  void
  main()
  {
      gl_FragColor = vec4(${colorChoice[lpCnt].r}, ${colorChoice[lpCnt].g}, ${colorChoice[lpCnt].b}, 1.0 );
  }
`;
window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    // Specify a starting point p for our iterations
    // p must lie inside any set of three vertices

    var u = add( vertices[0], vertices[1] );
    var v = add( vertices[0], vertices[2] );
    var p = scale( 0.25, add( u, v ) );

    // And, add our initial point into our array of points

    points = [ p ];

    // Compute new points
    // Each new point is located midway between
    // last point and a randomly chosen vertex

    for ( var i = 0; points.length < NumPoints; ++i ) {
        var j = Math.floor(Math.random() * 3);
        p = add( points[i], vertices[j] );
        p = scale( 0.5, p );
        points.push( p );
    }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShadersNew( gl, vertex_shader, fragment_shader );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};


function render() {
	// First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    // Specify a starting point p for our iterations
    // p must lie inside any set of three vertices

    var u = add( vertices[0], vertices[1] );
    var v = add( vertices[0], vertices[2] );
    var p = scale( 0.25, add( u, v ) );

    // And, add our initial point into our array of points

    points = [ p ];

    // Compute new points
    // Each new point is located midway between
    // last point and a randomly chosen vertex

    for ( var i = 0; points.length < NumPoints; ++i ) {
        var j = Math.floor(Math.random() * 3);
        p = add( points[i], vertices[j] );
        p = scale( 0.5, p );
        points.push( p );
    }
	gl.viewport( x, y, cWidth, cHeight );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );
	var program = initShadersNew(gl, vertex_shader, fragment_shader);
    gl.useProgram( program );
	
	if (!colorPickerUsed) {
		fragment_shader = `
			precision mediump float;

			void
			main()
			{
				gl_FragColor = vec4(${colorChoice[lpCnt].r}, ${colorChoice[lpCnt].g}, ${colorChoice[lpCnt].b}, 1.0 );
			}
		`;
	} else {
		fragment_shader = `
		precision mediump float;

		void
		main()
		{
			gl_FragColor = vec4(${userChoice.r}, ${userChoice.g}, ${userChoice.b}, 1.0 );
		}
    `;
	}
    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    gl.drawArrays( gl.POINTS, 0, points.length );
}

// To make html code work in js file
function initShadersNew(gl, iVShad, iFShad) {
  const vShad = makeShader(gl, gl.VERTEX_SHADER, iVShad);
  const fShad = makeShader(gl, gl.FRAGMENT_SHADER, iFShad);
  const sProg = gl.createProgram();
  gl.attachShader(sProg, vShad);
  gl.attachShader(sProg, fShad);
  gl.linkProgram(sProg);
  
  return sProg;
}

function makeShader(gl, shad, shadSource) {
  const newShad = gl.createShader(shad);
  gl.shaderSource(newShad, shadSource);
  gl.compileShader(newShad);

  return newShad;
}

// Sliders and buttons
var userPoints = document.getElementById("npoints");
var userColor = document.getElementById("colorpicker");
var rgbSliderRed = document.getElementById("red");
var rgbSliderBlue = document.getElementById("blue");
var rgbSliderGreen = document.getElementById("green");
userPoints.oninput = function() {
	NumPoints = this.value;
};
rgbSliderRed.oninput = function () {
	userChoice.r = rgbSliderRed.value / 255.0;
	colorPickerUsed = true;
	userColor.value = rgbToHex(rgbSliderRed.value, rgbSliderGreen.value, rgbSliderBlue.value);
};
rgbSliderGreen.oninput = function () {
	userChoice.g = rgbSliderGreen.value / 255.0;
	colorPickerUsed = true;
	userColor.value = rgbToHex(rgbSliderRed.value, rgbSliderGreen.value, rgbSliderBlue.value);
};
rgbSliderBlue.oninput = function () {
	userChoice.b = rgbSliderBlue.value / 255.0;
	colorPickerUsed = true;
	userColor.value = rgbToHex(rgbSliderRed.value, rgbSliderGreen.value, rgbSliderBlue.value);
};
// rgbToHex function (premise taken from stackOverFlow)
function rgbToHex(r, g, b) {
  const hex = (r << 16) | (g << 8) | (b << 0);
  return '#' + (0x1000000 + hex).toString(16).slice(1);
}
userColor.oninput = function () {
	const userRGB = hexToRGB(userColor.value);
	// converting to (1.0, 0.0, 0.0) format
	rgbSliderRed.value = userRGB.r;
	rgbSliderGreen.value = userRGB.g;
	rgbSliderBlue.value = userRGB.b;
	userChoice.r = userRGB.r / 255.0;
	userChoice.g = userRGB.g / 255.0;
	userChoice.b = userRGB.b / 255.0;
	colorPickerUsed = true;
};
// hexToRGB function (premise taken from stackOverFlow)
function hexToRGB(color) {
	var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  return rgb ? {
    r: parseInt(rgb[1], 16),
    g: parseInt(rgb[2], 16),
    b: parseInt(rgb[3], 16)
  } : null;
}
document.getElementById("bdisplay").onclick = function gasketDisplay() {
	var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    // Specify a starting point p for our iterations
    // p must lie inside any set of three vertices

    var u = add( vertices[0], vertices[1] );
    var v = add( vertices[0], vertices[2] );
    var p = scale( 0.25, add( u, v ) );

    // And, add our initial point into our array of points

    points = [ p ];

    // Compute new points
    // Each new point is located midway between
    // last point and a randomly chosen vertex

    for ( var i = 0; points.length < NumPoints; ++i ) {
        var j = Math.floor(Math.random() * 3);
        p = add( points[i], vertices[j] );
        p = scale( 0.5, p );
        points.push( p );
    }
	gl.viewport( x, y, cWidth, cHeight );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	if (!colorPickerUsed) {
		fragment_shader = `
			precision mediump float;

			void
			main()
			{
				gl_FragColor = vec4(${colorChoice[lpCnt].r}, ${colorChoice[lpCnt].g}, ${colorChoice[lpCnt].b}, 1.0 );
			}
		`;
	} else {
		fragment_shader = `
		precision mediump float;

		void
		main()
		{
			gl_FragColor = vec4(${userChoice.r}, ${userChoice.g}, ${userChoice.b}, 1.0 );
		}
    `;
	}
	
	var program = initShadersNew(gl, vertex_shader, fragment_shader);
    gl.useProgram( program );
	
    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    gl.drawArrays( gl.POINTS, 0, points.length );
	gasketStatus = "Status:"
	gasketStatus = gasketStatus.bold() + " Displayed";
	const displayMessage = document.getElementById("status");
	displayMessage.innerHTML = gasketStatus;
};
document.getElementById("banimate").onclick = function gasketAnimate() {
	var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    // Specify a starting point p for our iterations
    // p must lie inside any set of three vertices

    var u = add( vertices[0], vertices[1] );
    var v = add( vertices[0], vertices[2] );
    var p = scale( 0.25, add( u, v ) );

    // And, add our initial point into our array of points

    points = [ p ];

    // Compute new points
    // Each new point is located midway between
    // last point and a randomly chosen vertex

    for ( var i = 0; points.length < NumPoints; ++i ) {
        var j = Math.floor(Math.random() * 3);
        p = add( points[i], vertices[j] );
        p = scale( 0.5, p );
        points.push( p );
    }
	gl.viewport( x, y, cWidth, cHeight );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	if (!colorPickerUsed) {
		fragment_shader = `
			precision mediump float;

			void
			main()
			{
				gl_FragColor = vec4(${colorChoice[lpCnt].r}, ${colorChoice[lpCnt].g}, ${colorChoice[lpCnt].b}, 1.0 );
			}
		`;
	} else {
		fragment_shader = `
		precision mediump float;

		void
		main()
		{
			gl_FragColor = vec4(${userChoice.r}, ${userChoice.g}, ${userChoice.b}, 1.0 );
		}
    `;
	}
	var program = initShadersNew(gl, vertex_shader, fragment_shader);
    gl.useProgram( program );
	
    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    gl.drawArrays( gl.POINTS, 0, points.length );
	
	setTimeout(() => {
		requestAnimationFrame(function () {
		  if (lpCnt > 10) { // back to original
			lpCnt = 0;
			cWidth = 512;
			cHeight = 512;
			NumPoints = 5000;
			x = 0;
			y = 0;
		  }
		  gasketAnimate(); // recursion
		  gasketStatus = ("Status: ").bold();
		  gasketStatus += `Animating --- Count = ${lpCnt}`;
		  const displayMessage = document.getElementById("status");
		  displayMessage.innerHTML = gasketStatus;
		  lpCnt++;
		  cWidth -= 50;
		  cHeight -= 50;
		  NumPoints -= 500;
		  x += 25;
		  y += 25;
		});
	}, 175);
};
document.getElementById("bclear").onclick = function gasketClear() {
	gasketStatus = ("Status: ").bold() + "Canvas Cleared";
	const displayMessage = document.getElementById("status");
	displayMessage.innerHTML = gasketStatus;
	location.reload();
}
	

