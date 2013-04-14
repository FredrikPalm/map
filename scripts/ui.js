var filters = [];
var filtersEnabled = true;

function initFilters(){
	//filters are function that draw for every tile
	//there are two kinds: simple (function(tile)) and complex (function(tile,cctx))
	var showPopulation = function(tile, cctx){
		var scale = Math.max(1, tile.population / 100);
		return rgba(255*scale,255*scale,255*scale,0.6);
	};
	var showPlaceNames = function(tile,cctx,xStart,yStart){
		if(tile.type == "settlement"){
			var city = world.areas[tile.field];
			if(tile.globalPosition.x == city.tiles[0].x && tile.globalPosition.y == city.tiles[0].y){
				cctx.fillStyle = "black"
            	cctx.font = "bold "+(10+Math.round(zoomLevel/2))+"px Arial";
            	cctx.fillText(world.areas[tile.field].name, xStart,yStart);
			}
		}
		return false;
	};
	var showCultures = function (tile,cctx,xStart,yStart){
		if(tile.type == "settlement"){
			var city = world.areas[tile.field];
			var color = getRandomColor(city.cultureID,world.cultures.length,0.4);
  			cctx.fillStyle = color;
  			var size = Math.min(16, Math.max(tile.population/50, 1));
  			var sizeHalf = Math.round(size/2);
  			cctx.fillRect(xStart-sizeHalf,yStart-sizeHalf,size,size); 
		}
		return false;
	};
	var showFood = function(tile){
		var resources = tile.resources;
		var food = 0;
		$.each(resources, function(i,val){
			food += val * resourceData[i].foodValue;
		});
	};
	filters = [showPopulation, showPlaceNames];
}

function showTileGroup(group){ //VERY inefficient. Checks if member for EVERY tile drawn on screen.
	var r = function(tile){
		if(isMember(group, tile.globalPosition)){
			return "rgba(130,30,30,0.5)";
		}
		return false;
	};
	filters.push(r);
	return r;
}

var groupCounter = 0;
function showHideTileGroup(group, color){
	var id = groupCounter++;
	function show(){
		$.each(group, function(i,coord){
			var tile = lookUpCoord(coord);
			if(!tile.special) tile.special = {}
			tile.special[id] = color;
		});
	}
	function hide(){
		$.each(group, function(i,coord){
			var tile = lookUpCoord(coord);
			delete(tile.special[id]);
		});
	}
	return {"id":id, "show":show, "hide":hide};
}