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
var NumPoints = 5000;
var lpCnt = 0;
var cWidth = 512;
var cHeight = 512;
var x = 0;
var y = 0;
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
	
	fragment_shader = `
		precision mediump float;

		void
		main()
		{
			gl_FragColor = vec4(${colorChoice[lpCnt].r}, ${colorChoice[lpCnt].g}, ${colorChoice[lpCnt].b}, 1.0 );
		}
    `;
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
      render(); // recursion
      lpCnt++;
      cWidth -= 50;
      cHeight -= 50;
      NumPoints -= 500;
	  x += 25;
	  y += 25;
    });
  },150);
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