var eventsID = 0;

function histEvent(chance, effect, args){
	this.id = eventsID++ - 1;
	this.baseChance = chance;
	this.currChance = chance;
	this.inEffect = false;
	this.effect = effect;
	this.args = args;
}

/*	NEEDED CULTURE PARAMETERS
	relations: [[cultureID, relation], ...];
*/
/* NEEDED CITY PARAMETERS
	relations: [[cityID, relation]...];
	roads: [[to, length]...];
	nearestRiver: 
	nearestMountain: 
	nearestForest:
	nearestLake: 
	nearestWater: 
	religions: [[id, prominence]...]; 
*/

function histFact(evaluation, effect){
	this.evaluation = evaluation;
	this.effect = effect;
	this.inEffect = false;
};

function cityHistFacts(culture,city){
	this.wars = 0;
	this.relations = [];
	this.roads = roads[city.tiles[0].roadIndex];
	for(var i = 0; i < culture.length; i++){
		//k
	}
};

function Evaluator(field, city, comparison, cutOff){
	var value = 0;
	for(var i = 0; i < city.tiles.length; i++){
		var tile = lookUpCoord(city.tiles[i]);
		if(tile.resources.value === undefined) continue;
			value += tile.resources.field;
	}
	function a(change){
		if(change !== undefined){ 
			value += change;
		}
		return comparison(value / city.population, cutOff);
	};
	return a;
}

function generateCultures(){
	cultures = [];
	analyseCities();
	cultures = findCultures(Math.round(world.cities.length / 5));
}

function findCultures(amount){
	var clusterCentra = [];
	var culture = 0;
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

function makeEffectFunction(city,culture){
	// i want to call this function to get a function I can call to get an effect function
	// var temp = makeEffectFunction(city,culture)
	// var effect = temp([["greatPerson", 5]["greatSolder",-5]])
	// effect() -> city.h.greatPerson.currChange += 5; 
	return function(){
		var effects = arguments;
		return function(){
			$.each(effects, function(i,val){
				var name = val[0];
				var increase = val[1];
				city.h[name].currChance += increase;
			});
			return true;
		};
	};
}

function histFacts(culture, city)
{	if(city.population === undefined){
		city.population = countPopulation(city);
	}	

	var less = function(a,b){return a < b;};
	var more = function(a,b){return a > b;};
	var same = function(a,b){return Math.abs(a-b) < 1;};
	var m = makeEffectFunction(culture,city);
	//								  returns false if one-shot
	/* variable, 	                 evaluator,                        effect,   
	Ab=Abundance, La = Lack						
												                  //use +-Infinity to set to 0 or 1000                          */
	this.AbFood = new histFact(Evaluator("food", city, more, 1), m(["Rebellion", -2])),
	this.LaFood = new histFact(Evaluator("food", city, less, 0.5), m(["Rebellion", 2])),
	this.AbIron = new histFact(Evaluator("iron", city, more, 0.02), m(["MilitaryMight", 1]))
}


function parseDotNotation(str){
	// seperate string into array
	var array = str.split(".");
	array.unshift(window);
	var a = lookUpIn(array);
	return a;
}

function lookUpIn(array){
	var res = array[0];
	var i;
	for(i = 1; i < array.length-1; i++){
		res = res[array[i]];
	}
	return [res, array[i]];
}

function makeEventEffect(city,culture){
	return function(){
		var effects = arguments;
		for(var i = 0; i < effects.length; i++){
			var a;
			if(effects[i][0].indexOf("city") == 0){
				print("shouldn't happen");
			}
			if(effects[i][0].indexOf(".") !== -1){
				print("shouldn't happen");
				var a = parseDotNotation(effects[i][0]);
				effects[i][0] = a[0]; //world.tiles.10.10
				effects[i][2] = effects[i][1]; //"*0.9"
				effects[i][1] = a[1]; //"population"]
			}
			else{ // if the string is just "Anarchy", assume city.h.Anarchy is meant
				a = [city.h, effects[i][0]];
				var name = effects[i][0];
				var value = effects[i][1];
				effects[i][0] = city; //{}?	
				effects[i][2] = value; //"*0.9"
				effects[i][1] = "currChance"; //Anarchy
				effects[i][3] = ["h", name];
			}
		}
		return function(){
			$.each(effects, function(i,val){
				//      item, field, change
				change(val[0],val[1],val[2], val[3]);
			});
			return true;
		};
	}
}

function change(item, field, str, fields){
	var operator = str[0];
	var value = parseInt(str.substr(1),10);
	if(fields !== undefined){
		for(var i = 0; i < fields.length; i++){
			item = item[fields[i]];
		}	
	}
	if(operator == "="){
		item[field] = value;
	}
	else if(operator == "+"){
		item[field] += value;
	}
	else if(operator == "-"){
		item[field] -= value;
	}
	else if(operator == "*"){
		item[field] *= value;
	}
	else if(operator == "/"){
		item[field] /= value;
	}
	else if(operator == ">"){
		if(item[field] !== 0){
			item[field] += value;
		}
	}
	else{
		print("err: " + operator + " " + value);
	}
}

function testEffects(){
	var m = makeEventEffect();
	print(world.tiles[10][10].population);
	var t = m(["world.tiles.10.10.population", "=999"],["Anarchy"]);
	var t2 = m(["world.tiles.10.10.population", "+1"]);
	var t3 = m(["world.tiles.10.10.selected", "=true"]);
	t();
	t2();
	print(world.tiles[10][10].population);
	t3();
	print(world.tiles[10][10].selected);
}

function findOnGoingEvents(){
	var areas = world.areas; var cities = world.cities;
	for(var i = 0; i < cities.length; i++){
		var city = areas[cities[i]];
		$.each(city.h, function(n,val){
			if(val.inEffect){
				var id = val.lastID;
				print("H: Found event " + n + " in " + cities[i] + " that started " + city.h[n].lastStart);
			}
		});
	}
}

var histEvents = function(culture, city)
{	//								  returns false if one-shot
	/* variable, 	        base chance,      effect,           args   */
	//probably should have a mean length as well: great warrior lasts 10 years +-10 for instance
	var m = makeEventEffect(city,culture);
	this.Anarchy = new histEvent(1, m(["Anarchy","+50"],["GreatLeader","=0"],["CivilWar","+5"])),
	this.Authoritarian = new histEvent(4, m(["Democracy", "=0"],["Dictatorship","+3"],["CivilWar","-2"],["GreatArtist","-3"])),
	this.CivilWar = new histEvent(1, function(culture,city,arg1){ }, 1),
	this.ConqueredByX = new histEvent(0,function(culture,city,arg1){}, 1),
	this.ConqueredX = new histEvent(0, function(culture,city,arg1){}, 1),
	this.Democracy = new histEvent(2, function(culture,city){}, 0), // if: low amount of aggression, high amount of wisdom   effect: + weak, + great person
	this.Dictatorship = new histEvent(1, function(culture,city){},0),
	this.Drought = new histEvent(2, function(culture,city){},0),
	this.GoldenAge = new histEvent(1, function(culture,city){},0),
	this.GreatArtist = new histEvent(5, function(culture,city){},0),
	this.GreatLeader = new histEvent(5, function(culture,city){},0),
	this.GreatEngineer = new histEvent(5, function(culture,city){},0),
	this.GreatPhilosopher = new histEvent(30, m(["GreatPhilosopher","+500"],["Democracy", ">10"],["Dictatorship","-3"],["CivilWar","-2"],["GreatArtist","+3"])),
	this.GreatWarrior = new histEvent(5, function(culture,city){},0),
	this.HappensOnce = new histEvent(5, m(["HappensOnce", "=1000"],["HappensOften", "=0"])),
	this.HappensOften = new histEvent(100, function(){});
	this.HeldOffByX = new histEvent(0, function(culture,city,arg1){},1),
	this.HeldOffX = new histEvent(0, function(culture,city,arg1){},1), //       if: turmoil and neither is strong
	this.InConflictWithX = new histEvent(2, function(culture,city,arg1){},1),
	this.LawAbiding = new histEvent(2, function(culture,city){},0),
	this.Matriarchy = new histEvent(1, function(culture,city){},0), //      if: low amount of men                                 effect: great person is woman
	this.MilitaryMight = new histEvent(0, function(culture,city){},0), //    if: high iron, great engineer, etc.                   effect: + in Turmoil, + great warrior
	this.Missionary = new histEvent(0, function(culture, city){},0),
	this.Monogenous = new histEvent(0, function(culture,city){},0), //     if: high distance to nearest culture	           effect: - wisdom, + weak, - tradesmen
	this.Plague = new histEvent(1, function(culture,city){},0),
	this.Poor = new histEvent(0, function(culture,city){},0),//              if: low value                                         effect: - democracy, + rebellion, + aggression
	this.Racism = new histEvent(4, function(culture,city,arg1){},1),            //if: low distance to nearest culture                   effect: + in Turmoil, - wisdom
	this.Rebellion = new histEvent(2, function(culture,city){},0), // this.if: low amount of food                                effect: pop down, wealth down
	this.ReceivedReligionFrom = new histEvent(0,function(culture,city,arg1){},0),
	this.Religious = new histEvent(6, function(culture,city,arg1){},1), 
	this.Rich = new histEvent(0, function(culture,city){},0),             // if: high value                                        effect: + democracy, + rebellion, - wisdom
	this.SpawnedReligion = new histEvent(2, function(culture,city,arg1){},1),
	this.SpreadReligionTo = new histEvent(0,function(culture,city,arg1){},1),
	this.Tradesmen = new histEvent(2, function(culture,city,arg1){},1), //         if: has abundance of resource, or lacks one.	   effect: + wealth, + in Turmoil, + Democracy
	this.WarRidden = new histEvent(0, function(culture,city){},0), //        if: several wars                                      effect: + aggression, + great warrior
	this.Weak = new histEvent(0, function(culture,city){},0)// 	     if: lost war, low iron, low aggression, etc.

	//there will be a few special interacting events, like these:
	/*
	this.SpreadReligionTo
	this.ReceivedReligionFrom
	this.InWarWith
	this.SpreadPlagueTo
	this.SentEmigrantsTo
	this.ReceivedImmigrantsFrom
	*/
};

function initHistory(){
	for(var i = 0; i < cultures.length; i++){
		for(var k = 0; k < cultures[i].length; k++) {
			var city = cultures[i][k];
			city.h = {};
			city.h = new histEvents(cultures[i],city);
			city.facts = new histFacts(cultures[i],city);
			city.history = {};
		}
	}
}

function generateRandomPlaceName(area){
	var type = area.type;
	var baseName = generateFirstName(); // need to mess these up a bit with regexp first
	var end = "";
	if(type == "mountain"){
		baseName = generateFirstName("Male");
		end = mountainNames[random(0,mountainNames.length-1)];
	}
	else if(type == "water"){
		end = lakeNames[random(0,lakeNames.length-1)];
	}
	else if(type == "settlement"){
		//
	}
	else if(type == "forest"){
		end = forestNames[random(0,forestNames.length-1)];
	}
	return baseName + end;
}

var riverNames = [
	"run", " river", "song"
];

var lakeNames = [
	"pond",
	" lake",
	" sea",

	"vaer",
];

var forestNames = [
	" forest", "elk",
];

var mountainNames = [
 " mountains", " rocks",
];

var settlementNames = [
	" place", "town", " town", " village", " home", " castle"
];

function generateHistory(years){
	print("generating history over " +years + " years");
	var t1 = new Date();
	initHistory();
	var year = -1;
	var idCounter = 0;
	while(year++ < years-1){
		for (var i = 0; i < cultures.length; i++){
			for (var k = 0; k < cultures[i].length; k++) {
				var city = cultures[i][k];

				// first let effects play out
				// then gather facts
				// then new effects

				$.each(city.h, function(n,val){
					if(val.inEffect)
						val.effect(cultures[i],city);
				});

				$.each(city.facts, function(n,val){
					if(val.inEffect){
						val.effect(cultures[i],city);
					}
				});

				$.each(city.h, function(name,val){
					var r = random(0,1000);
					var currEvent = val;
					if(currEvent.currChance > r){
						if(!currEvent.inEffect){
							var id = idCounter++;
							currEvent.lastID = id;
							currEvent.lastStart = year;
						//	print("###CREATING HISTORY!! " + name + " at " + i + " " + k + " " + year);
							if(city.history[year] == undefined){
								city.history[year] = {"eventsStart":[], "eventsEnd":[]};
							}
							city.history[year].eventsStart.push({"event":name, "id":id});
						}
						print("Event continues: " + name + " in " + city.id);
						currEvent.inEffect = true; currEvent.effect(cultures[i],city);
					}
					else if(currEvent.inEffect){
						currEvent.inEffect = false;
						if(city.history[year] == undefined){
							city.history[year] = {"eventsStart":[], "eventsEnd":[]};
						}
						city.history[year].eventsEnd.push({"event":name, "id":currEvent.lastID, "started":currEvent.lastStart, "lasted":year-currEvent.lastStart});
					}
					val.currChance = val.baseChance;
				});
			}
		}
	}
	var t2 = new Date();
	timeDiff(t2,t1, "Generating history for " + world.cities.length + " cities over " + years + " years, took: ");
}