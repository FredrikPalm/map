var world;
var areas;// = {"totalAmount":0,"mountain":0,"water":0,"grass":0,"forest":0,"sand":0,"id":0};
var selected;
var idCounter=0;
var depthMax = 20;
var seed;
var	resizable = false;
var h; //window height
var w; //window width
var m;  //m is the mersenne twister used to generate random numbers
var maxHeight; //no longer used
var minHeight;
var mode; //dynasty or colonization
var filter;
var center;
var localMapTileSize;
var year = 0;
var yearInc = 1;
var seasons = ["Spring", "Summer", "Fall", "Winter"];
var season = 0;
var uiClick;
var uiHover;
var uiHoverEnd;
var uiDblClick;
var zoomState = false;
var zoomLevel = 1;
var zoomMax = 24;
var zoomMin = 1;
var xScroll = 0;
var yScroll = 0;
var dx = 0;
var dy = 0;
var scrollRate = 25;
var debug;
var tileTypes = ["grass","water","forest","mountain", "settlement"];
var mapRules = {"water":{"freq":0.20,"size":{"min":0.05,"max":0.08}}, 
				"mountain":{"freq":0.1,"size":{"min":0.005,"max":0.02}}, 
				"forest":{"freq":0.25,"size":{"min":0.05,"max":0.25}},
				"settlement":{"freq":0,"size":{"min":0,"max":0}}};		
var resourceData = 
{
/*  variable, 			Name, Value, TileType, AreaType, Chance of Occuring, Foodvalue, Drinkvalue, Depletion   */
	'cow':new Resource("Cow", 80, 'grass', 'shallow', 5, 200, 10),
	'sheep':new Resource("Sheep", 60, 'grass', 'any', 2, 150, 0),
	'horse':new Resource("Horse",70, 'grass', 'deep', 1, 180, 0),
	'wheat':new Resource("Wheat",50, 'grass', 'any', 10, 100, 0),
	'stone':new Resource("Stone",10, 'mountain', 'any', 10, 0, 0),
	'iron':new Resource("Iron",100, 'mountain', 'any', 0.15, 0, 0),
	'copper':new Resource("Copper",70, 'mountain', 'any', 0.20, 0, 0),
	'coal':new Resource("Coal",20, 'mountain', 'any', 2, 0, 0),
	'wood':new Resource("Wood",10, 'forest', 'any', 100, 0, 0),
	'pigs':new Resource("Pigs",50, 'forest', 'any', 3, 150, 0),
	'fish':new Resource("Fish",10, 'water', 'any', 10, 100, 0),
	'dwater':new Resource("Drinking Water",1, 'water', 'shallow', 100, 0, 100),
	'sand':new Resource("Sand",1,'sand','any',100, 0, 0)
}
var rivers;
var roads;

/*
		CLASSES

*/

function World(sizeX,sizeY){
	this.tiles = [];
	this.sizeX = sizeX;
	this.sizeY = sizeY;
	this.tileSize = 4;
	this.dynasty = {};
	this.options = {};
	this.areas = {};
	this.people = [];
	this.cities = [];
	this.cultures = [];
	this.roads = [];
	this.rivers = [];
}

function Resource(name, value, type, areaType, chance, foodValue, drinkValue)
{
	this.name = name;
	this.value = value;
	this.tileType = type;
	this.areaType = areaType;
	this.chance = chance;
	this.foodValue = foodValue;
	this.drinkValue = drinkValue;
}

function Tile(gP, type, neighbours) {
	this.globalPosition = gP; // position in world
	this.localPosition; // position on screen. null if not in view
	this.type = type; // grass, forest, mountain, water
//	this.neighbours = neighbours; // tiles surrounding this one
//	this.spaces = []; // subtiles (3x3)
	this.selected = false; // whether the tile is currently selected or not
	this.field = null; //the lake, mountain range, forest or grassland this tile is a part of
	this.resources =  {};
	this.baseValue = 0;
	this.value = 0;
	this.population = 0;
	this.people = [];
	this.community = null;//deprecated
	this.borders = null;
	this.depth;
	this.height;
}

function inBounds(world,x,y){
	return (x >= 0 && x < world.tiles.length && y >= 0 && y < world.tiles[0].length);
}

function Area(){
	this.tiles;
	this.type;
	this.id;
	this.name;
}

function addToArea(area,location){
	area.tiles.push(location); //TILE ID!!
	lookUpCoord(location).field = area.id;
}
function appendAreas(area1,area2){
	/*This can probably be improved*/
	for(var i = 0; i < area2.tiles.length; i++)
	{
		addToArea(area1, area2.tiles[i]);
	}
	areas['totalAmount'] = areas['totalAmount'] - 1;
	areas[area2.type] = areas[area2.type] - 1;
	delete areas[area2.id];
}
function removeFromArea(area,location){
	$.each(area.tiles, function(i,val){
		if(val == undefined){ return true; }
		if(val.x == location.x && val.y == location.y){
			area.tiles.splice(i,1);
			return false;
		}
	});
}

function memberTile(array,tile){
	var index = -1;
	$.each(array, function(i,val){
		if(val.x == tile.x && val.y == tile.y){
			index = i;
			return false;
		}
	});
	return index;
}

function isMember(array,tile){
	return memberTile(array,tile) != -1;
}

function forEachTile(f){
	$.each(world.tiles, function(x,val){
		$.each(val, function(y, tile){
		   return f(tile,x,y);
		});
	});
}

function forEachCity(f){
   $.each(world.cities, function(i,val){
       return f(world.areas[val]);
   });
}

function forEachArea(f){
	$.each(world.areas, function(i,val){
		if(i[0] == "a") return f(val);
	});
}

function combine(){
	var res = {};
	$.each(arguments, function(i,val){
		$.each(val, function(name, value){
			if(res[name]){
				res[name] += value; //doesn't really work unless they are numbers.
			}
			else{
				res[name] = value;
			}
		});
	});
	return res;
}

function merge(){
	var obj1 = arguments[0];
	for(var i = 1; i < arguments.length; i++){
		$.each(arguments[i], function(name,value){
			if(obj1[name]){
				obj1[name] += value; //doesn't really work unless they are numbers.
			}
			else{
				obj1[name] = value;
			}
		});
	}
	return obj1;
}



function timeDiff(t0,t1,message){
	print(message + (t0.getTime() - t1.getTime()) +  "ms");
}

function plusMinus(value, diff){
	return random(value-diff,value+diff);
}

function random(min,max){
	if(max == undefined){
		max = min;
		min = 0;
	}
	min = Math.ceil(min);
	max = Math.floor(max);
	if(max < min){
		var swap = max;
		max = min;
		min = swap;
	}
	var res = Math.round(m.random()*(max-min)+min);
	return res;
}

function trim(str) { //use $.trim(String)
    str.replace(/^\s*/, '').replace(/\s*$/, ''); 
   return str;
} 

function generateUniqueId() { //returns unique nr. useful when waiting for information from ajax-requests.
    return idCounter++;
}

function member(element, array){
	for(var i = 0; i < array.length; i++){
		if(element == array[i]){
			return i;	
		}
	}
	return -1;
}

Array.prototype.remove = function(e) {
  var i = member(e,this);
  if(i == -1) return this.length;
  return this.length -= this.splice(i,1).length;
};

function getUrlVar(afterChar) {
	afterChar = (afterChar == undefined) ? "#" : afterChar;
	var index = window.location.href.indexOf(afterChar);
    if (index != -1) {
        return window.location.href.substr(index + afterChar.length);
    } else {
        return "";
    }
}

function rgba(r,g,b,a){
	return {"r":r,"g":g,"b":b,"a":a};
}

function saveWorld(compress){
	if(compress){
		//not loss less
		delete(world.areas);
		delete(world.cities);	//would need to save names, history etc somewhere.
		delete(world.cultures);
		delete(world.rivers);
		delete(world.roads);
		delete(world.people);
		forEachTile(function(tile){
			delete(tile.neighbours);
			delete(tile.community);
			delete(tile.borders);
			delete(tile.globalPosition);
			delete(tile.special);
			delete(tile.selected);
			delete(tile.value);
			delete(tile.baseValue);
			delete(tile.field);
		});
	}
	return JSON.stringify(world);
}