function analyseCity(city){
	var pop = 0;
	var xTot = 0;
	var yTot = 0;
	var xMin = Infinity;
	var xMax = -1;
	var yMin = Infinity;
	var yMax = -1;
	
	var food = 0;
	var drink = 0;

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

	getAllResources(city);

	$.each(city.allResources, function(name,amount){
		food += amount * resourceData[name].foodValue;
		drink += amount * resourceData[name].drinkValue;
	});

	city.food = food;
	city.drink = drink;
	city.density = city.population / city.tiles.length;
	var xMean = xTot / city.tiles.length;
	var yMean = yTot / city.tiles.length;
	var radius = Math.max ((xMean - xMin), (yMean - yMin), (xMax - xMean), (yMax - yMean));
	city.center = {"x":xMean,"y":yMean};
	city.radius = radius;
}

function getAllResources(city){
	if(!city.resources) getResources(city);
	if(!city.vicinity) getCityRange(city);
	if(!city.nearbyResources) getResources(city,true);
	return city.allResources = combine(city.resources, city.nearbyResources);
}

function getResources(city, vicinity){
	var resources = {};
	var array = city.tiles;
	if(vicinity) array = city.vicinity;
	$.each(array, function(i,tile){
		tile = lookUpCoord(tile);
		$.each(tile.resources, function(name,amount){
			if(resources[name]){
				resources[name] += amount;
			}
			else{
				resources[name] = amount;
			}
		}); 
	});
	if(vicinity) return city.nearbyResources = resources;
	return city.resources = resources;
}

function getVicinity(city){
	var vicinity = [];
	$.each(city.tiles, function(i,val){
		var tile = lookUpCoord(val);
		var r = val;
		if(tile.borders != null){
			$.each(tile.borders, function(k, val2){
				try{
					var t;
					if(val2 == "left"){
						t = lookUpCoord(r.x - 1, r.y);
					}
					else if(val2 == "below"){
						t = lookUpCoord(r.x, r.y + 1);
					}
					else if(val2 == "above"){
						t = lookUpCoord(r.x, r.y - 1);
					}
					else if(val2 == "right"){
						t = lookUpCoord(r.x + 1, r.y);
					}
					vicinity.push(t.globalPosition);
				}
				catch(e){//coordinate was (most likely) out of bounds
				}
			});
		}
	});
	return city.vicinity = vicinity;
}

function calculateDistances(){
	forEachCity(function(city){
	   city.nearestDistance = distanceToNearestCity(city);
	});
}

function distanceToArea(a1,a2){
	//not necessarily the shortest distance...
	var tile1 = a1.tiles[0];
	var tile2 = a2.tiles[0];
	if(!tile1) return Infinity;
	if(!tile2) return Infinity;
	return euclideanDistance(a1.tiles[0], a2.tiles[0]);
}

function nearestArea(city, type){
	var dist = Infinity;
	var nearest;
	if(type == "river" || type == "road"){
		$.each(world[type + "s"], function(i,val){
			var array = (type == "road") ? val.path : val;
			var t = euclideanDistance(city.tiles[0], array[0].globalPosition);
			if(t < dist){
				dist = t;
				nearest = i;
			}
		});
	}
	else{
		forEachArea(function(area){
			if(area.type == type && area.id != city.id){
				var t = distanceToArea(city,area);
				if(t < dist){
					dist = t;
					nearest = area.id;
				}
			}
		});
	}
	return {"distance":dist, "nearest":nearest};
}

function findNearestAreas(city){
	var a = ["mountain", "river", "water", "grass", "forest", "road"];
	$.each(a, function(i,val){
		city["nearest" + val[0].toUpperCase() + val.substr(1)] = nearestArea(city,val);	
	});
	city.nearestNeighbours = distanceToNearestCity(city,true);
}

function getCityRange(city){
	var vicinity = [];
	if(city.vicinity) vicinity = city.vicinity;
	function add(tile, energy){
		if(tile.type == "settlement") return;
		var unique = true;
		var pos = tile.globalPosition;
		var index = -1;
		$.each(vicinity, function(i,val){
			index = i;
			return (unique = !(pos.x == val.x && pos.y == val.y));
		});
		if(unique){
			pos.e = energy;
			vicinity.push(pos);
		}
		var e = energy - getEnergy(tile);
		if(e <= 0) return;
		if(!unique){
			if(vicinity[index].e >= e) return; //already found a cheaper path to this tile.
			vicinity[index].e = e;
		}
		continueFrom(tile, e);
	};
	function continueFrom(tile, energy){
		$.each(tile.neighbours, function(i,val){
			add(lookUpCoord(val[0],val[1]), energy);
		});
	};
	function getEnergy(tile){
		if(tile.road) return 0.5;
		var cost = costs[tile.type];
		if(!cost) return 1.75;
		return cost;
	}
	var costs = {"water":2.5, "forest":2, "mountain":5, "settlement":6};
	
	$.each(city.tiles, function(i,val){
		var tile = lookUpCoord(val);
		var r = val;
		if(tile.borders != null){
			$.each(tile.borders, function(k, val2){
				try{
					var t;
					if(val2 == "left"){
						t = lookUpCoord(r.x - 1, r.y);
					}
					else if(val2 == "below"){
						t = lookUpCoord(r.x, r.y + 1);
					}
					else if(val2 == "above"){
						t = lookUpCoord(r.x, r.y - 1);
					}
					else if(val2 == "right"){
						t = lookUpCoord(r.x + 1, r.y);
					}
					add(t, 5);
				}
				catch(e){//coordinate was (most likely) out of bounds
				}
			});
		}
	});
	return city.vicinity = vicinity;
}

function Factory(location, inArea, outArea, inResource, outResource){
	this.location = location;
	this.inArea = inArea;
	this.outArea = outArea;
	this.inResource = inResource;
	this.outResource = outResource;
	this.depletes = true;
}

function workFactory(factory){
	var inArea = world.areas[factory.inArea];
	var foundResource = false;
	$.each(inArea.tiles, function(i,tile){
		if(tile.resources[inResource]){
			if(depletes){
				tile.resources[inResource]--;
				if(tile.resources[inResource] <= 0){
					delete(tile.resources[inResource]);
				}
			}
			foundResource = true;
			return false;
		}
	});
	if(foundResource){
		if(!outArea.useableResources[outResource]) return outArea.useableResources[outResource] = 1;
		return outArea.allResources[outResource]++;
	}
}

var recipes = {
	"food" : [["cow"], ["pig"], ["horse"], ["wheat"], ["rice"], ["fish"]],
};

function placeFactory(city, wantedResource){
	var factory;
	var alternatives = recipes[wantedResource];
	$.each(alternatives, function(i,resources){
		var haveAll = resources.length;
		var locations = []; //areas
		$.each(resources, function(k, resource){
			if(city.allResources[resource]){
				haveAll--;
				var str = resourceData[resource].tileType;
				str = str[0].toUpperCase() + str.substr(1);
				locations.push(city["nearest" + str].nearest); //don't do this..
			}
		});
		if(haveAll == 0){
			var location;
			var foundLocation = false;
			$.each(city.vicinity, function(i,loc){
				var tile = lookUpCoord(loc);
				if(tile.factory) return true;
				if(tile.type == "grass"){
					location = tile;
					foundLocation = true;
					tile.factory = true;
					return false;
				}
			});
			if(foundLocation){
				factory = new Factory(location, locations, city, resources, wantedResource);
				return false;
			}
		}
	});
	return factory;
}

function distanceToNearestCity(city,cultureCheck){
	cultureCheck = !!cultureCheck; //Default to false
	var dist = Infinity;
	var nearest;
	var distDiff = (cultureCheck) ? Infinity : -1;
	var nearestOther;
	forEachCity(function(val){
	   if(val.id != city.id){
		 var sameCulture = (val.cultureID == city.cultureID); 
		 var t = euclideanDistance(city.center, val.center);
		 if(t < dist && (!cultureCheck || sameCulture)){
			dist = t;
			nearest = val.id;
		 }
		 else if(t < distDiff && !sameCulture)
		 {
			distDiff = t;
			nearestOther = val.id;
		 }
	   }
	});
	var res = {"distance":dist,"nearest":nearest};
	if(cultureCheck) return {"same":res, "other":
		{"distance":distDiff, "nearest":nearestOther}};
	return res;	
}