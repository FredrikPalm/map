// Fills the buffer with the values that define a rectangle.
function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2]), gl.STATIC_DRAW);
}

var program;
var positionLocation;
var colorLocation;

function getColorString(r,g,b,a){
	return "rgba("+r+", "+g+", "+b+", "+a+")";
}

function getRandomColor(index, length, alpha){
	var frequency = length;
	var center = 128;
    var width = 127;
	var red   = Math.floor(Math.sin(frequency*index+2) * width + center);
    var green = Math.floor(Math.sin(frequency*index+0) * width + center);
    var blue  = Math.floor(Math.sin(frequency*index+4) * width + center);
    return getColorString(red,green,blue,alpha);
}

function initGL(){
	gl = canvas.getContext("experimental-webgl");
	if (!gl) {
    	return;
  	}

	// setup GLSL program
	vertexShader = createShaderFromScriptElement(gl, "2d-vertex-shader");
	fragmentShader = createShaderFromScriptElement(gl, "2d-fragment-shader");
	program = createProgram(gl, [vertexShader, fragmentShader]);
	gl.useProgram(program);

	// look up where the vertex data needs to go.
	var positionLocation = gl.getAttribLocation(program, "a_position");

	// lookup uniforms
	var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
	var colorLocation = gl.getUniformLocation(program, "u_color");

	// set the resolution
	gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

  // Create a buffer.
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	// draw world
	console.log("P-WEBGL");
	var t1 = new Date();
	for (var x = 0; x < world.tiles.length; x++) {
		for(var y = 0; y < world.tiles[0].length; y++){
	    // Setup a random rectangle
	    	setRectangle(
	        	gl, x*scale, y*scale, scale, scale);

	    	// Set a random color.
	    	var color = getColorForTile(world.tiles[x][y]);
	   		gl.uniform4f(colorLocation, color.r, color.g, color.b, 1);

	    	// Draw the rectangle.
	    	gl.drawArrays(gl.TRIANGLES, 0, 6);
		}
	}
	var t2 = new Date();
	timeDiff(t2,t1,"#Drawing took ");
}


function repaint3(){
	for (var x = 0; x < world.tiles.length; x++) {
		for(var y = 0; y < world.tiles[0].length; y++){
					    // Setup a random rectangle
		    setRectangle(
		        gl, x * world.tileSize, y *  world.tileSize, world.tileSize, world.tileSize);

		    // Set a random color.
		    gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);

		    // Draw the rectangle.
		    gl.drawArrays(gl.TRIANGLES, 0, 6);
		}
	}

}