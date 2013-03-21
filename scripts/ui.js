var filters = [];
var filtersEnabled = true;

function initFilters(){
	//filters are function that draw for every tile
	//there are two kinds: simple (function(tile)) and complex (function(tile,cctx))
	var showPopulation = function(tile, cctx){
		var scale = Math.max(1, tile.population / 1000);
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
			var color = getRandomColor(city.cultureID,world.cultures.length,0.7);
  			cctx.fillStyle = color;
  			cctx.fillRect(xStart-5,yStart-5,10,10); 
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
	filters = [showPopulation, showCultures, showPlaceNames];
}