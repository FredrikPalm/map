/*Put all dynasty mode specific code here*/
function getMode(){
	return "dynasty";
}

function modeInit(){
	$("#DynastyHeader").text("Dynasty");
}	

function drawPlates(){
	for(var i = 0; i < plates.length; i++){
		var scale = (i * 256) / plates.length;
		cctx.fillStyle = "rgba("+scale+", "+scale+", "+scale+",0.5)";
		var plate = plates[i];
        var minX = plate.minX*world.tileSize;
        var maxX = plate.maxX*world.tileSize;
        var minY = plate.minY*world.tileSize;
        var maxY = plate.maxY*world.tileSize;
		cctx.fillRect(minX,minY,maxX-minX,maxY-minY);
	}
}

function craftNewWorld(tilesize, seed, times){
	var worker = new Worker('scripts/mapGenerator.js');
	worker.addEventListener('message', function(event) {
		if(event.data[0] == "{")
			{
				world = JSON.parse(event.data);
				world.tileSize = tileSize;
				$("#newPlayer").show();
				$("#progress").hide();
				stopLoading();
				var fs = []; forEachCity(function(city){color = function(tile){return getRandomColor(city.cultureID, world.cultures.length, 0.3);}; f = showHideTileGroup(city.vicinity, color); fs.push(f); city.showRange = f;});
				drawWorld3(world);
			}
		else{
 			console.log(event.data);
 			$("#progress").text(event.data);
 		}
	}	, false);
	worker.postMessage({"sizeX":sizeX,"sizeY":sizeY,"mapRules":mapRules,"m":m, "name":name}); // send params
	$("#progress").show();
}

var cultures = [];
var culture = 0;
function cultureTest(){
	var cities = world.cities;
	var areas = world.areas;
	cultures.push([areas[cities[0]]]);
	for(var i = 0; i < cities.length-1; i++){
		var tile = lookUpCoord(areas[cities[i]].tiles[0]);
		if(tile.road){
			var road = world.roads[tile.roadIndex];
			console.log("Road " + i + " is " + road.path.length);
			if(road.path.length > 100){
				culture++;
				cultures[culture] = [areas[cities[i+1]]];
			}
			else{
				cultures[culture].push(areas[cities[i+1]]);
			}
		}
		else{
			culture++;
			cultures[culture] = [areas[cities[i+1]]];
		}
	}
	console.log(cities.length + " => " + cultures);
}

function selectCulture(culture){
	for(var x = 0; x < world.tiles.length; x++)
		for(var y = 0; y < world.tiles[0].length; y++){
			world.tiles[x][y].selected = false;
		};
	for(var k = 0; k < culture.length; k++){
		for(var n = 0; n < culture[k].tiles.length; n++){
			culture[k].tiles[n].selected = true;
		}
	}
	repaint2(world);
}

function drawCultures(start,end){
	for(var i = start; i < end; i++){
		var color = getRandomColor(i,end-start,0.7);
		console.log("drawing culture with color "+color);
		cctx.fillStyle = color;
		cctx.beginPath();
		cctx.moveTo(cultures[i][0].center.x * world.tileSize, cultures[i][0].center.y * world.tileSize);
		
		for(var k = 1; k < cultures[i].length; k++){
			cctx.lineTo(cultures[i][k].center.x * world.tileSize, cultures[i][k].center.y * world.tileSize);
		}

		cctx.closePath();
		cctx.fill();
	}


	return;
	if(start == undefined) start = 0;
	if(end == undefined) end = cultures.length;
	for(var i = start; i < end; i++){
		var xTot = 0;
		var yTot = 0;
		var xMin = Infinity;
		var xMax = -1;
		var yMin = Infinity;
		var yMax = -1;
		for(var k = 0; k < cultures[i].length; k++){
			var x = cultures[i][k].center.x;
			xTot += x;
			var y = cultures[i][k].center.y;
			yTot += y;
			if(x < xMin) {xMin = x;}
			if(x > xMax) {xMax = x;}
			if(y < yMin) {yMin = y;}
			if(y > yMax) {yMax = y;}
		}
		var centerX = Math.round(xTot / cultures[i].length);
		var centerY = Math.round(yTot / cultures[i].length);
		var center = {"x":centerX, "y":centerY};
		var radius = Math.max ((centerX - xMin), (centerY - yMin), (xMax - centerX), (yMax - centerY), 10);
		cultures[i].center = center;
		cultures[i].radius = radius;
        var context = cctx;
        var tileSize = world.tileSize;
		context.beginPath();
		context.arc(centerX*tileSize, centerY*tileSize, radius*tileSize, 0, 2 * Math.PI, false);
		var scale = (i * 256) / (end-start);
		cctx.fillStyle = "rgba("+scale+", "+scale+", "+scale+",0.5)";
		context.fill();
		context.lineWidth = 2;
		context.strokeStyle = '#003300';
		context.stroke();
	}
}