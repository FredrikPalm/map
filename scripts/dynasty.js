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

function generateCultures(){
	cultures = [];
	analyseCities();
	cultures = findCultures(Math.round(world.cities.length / 5));
}

function findCultures(amount){
	var clusterCentra = [];
	var clusters = [];
	var hasChanged = true;
	var cities = world.cities;
	var areas = world.areas;
	for(var i = 0; i < cities.length; i++){
		var city = areas[cities[i]];
		if(i % amount == 0){
			clusterCentra.push(city.center);
			clusters.push([]);
		}
		city.cultureID = -1;
	}
	
	while(hasChanged){
		hasChanged = false;
		for(var i = 0; i < cities.length; i++){
			var minDistance = Infinity;
			var cluster = 0;
			var city = areas[cities[i]];
			for(var k = 0; k < clusterCentra.length; k++){
				var distance = euclideanDistance(clusterCentra[k], city.center);
				if(distance < minDistance){
					minDistance = distance;
					cluster = k;
				}
			}
			if(city.cultureID != culture){
				hasChanged = true;
				clusters[cluster].push(city);
				if(city.cultureID !== -1){
					var index = member(city, clusters[city.cultureID]); //temporary solution
					cultures[city.cultureID].splice(index, 1); 
				}
				city.cultureID = culture;
			}	
		}
		if(!hasChanged) break;
		for(var i  = 0; i < clusters.length; i++){
			var xTot = 0;
			var yTot = 0;
				
			for(var k = 0; k < clusters[i].length; k++){
				var x = clusters[i][k].center.x;
				var y = clusters[i][k].center.y;
				xTot += x;
				yTot += y;				
			}
			var xMean = xTot / clusters[i].length;	
			var yMean = yTot / clusters[i].length;
			clusterCentra[i] = {"x":xMean,"y":yMean};
		}
	}
	return clusters;
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

function analyseCities(){
	//adds population
	//adds center
	//adds radius
	for(var i = 0; i < world.cities.length; i++){
		var city = world.areas[world.cities[i]];
		var pop = 0;
		var xTot = 0;
		var yTot = 0;
		var xMin = Infinity;
		var xMax = -1;
		var yMin = Infinity;
		var yMax = -1;
		for(var k = 0; k < city.tiles.length; k++){
			var tile = lookUpCoord(city.tiles[k]);
			if(tile.population !== undefined) pop += tile.population;
			var x = city.tiles[k].x;
			var y = city.tiles[k].y;
			xTot += x;
			yTot += y;
			if(x < xMin){ xMin = x; }
			if(x > xMax){ xMax = x; }
			if(y < yMin){ yMin = y; }
			if(y > xMax){ yMax = y; }
		}
		city.population = pop;
		var xMean = xTot / city.tiles.length;
		var yMean = yTot / city.tiles.length;
		var radius = Math.max ((xMean - xMin), (yMean - yMin), (xMax - xMean), (yMax - yMean));
		city.center = {"x":xMean,"y":yMean};
		city.radius = radius;
	}
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