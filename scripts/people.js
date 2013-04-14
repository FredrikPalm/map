var people = 0;
var allPeople = [];

function Family(father, mother, children){
	this.father = (father == undefined) ? null : father; //these have to be id s...
	this.mother = (mother == undefined) ? null : mother; 
	this.children = (children == undefined) ? [] : children;
}

function Dynasty(){
	this.root;
	this.leader;
	this.heir;
	this.property;
}

function lookUpCoord(x,y){
	return (y == undefined) ? world.tiles[x.x][x.y] : world.tiles[x][y];
} //move to shared resources

function Person(location, family, gender, fname, sname, id, age, DoB, traits, faction){
	this.id = people++;
	var ranGender = "Male";
	if(random(1) == 0){
		ranGender = "Female";
	}
	//location must be coordinates
	if(location == undefined){
		this.location = randomTile(randomCity()).globalPosition;
	}
	else if(location.globalPosition == undefined){
		this.location = location;
	}
	else{
		this.location = location.globalPosition;
	}
	this.gender = (gender == undefined) ? ranGender : gender;  
	this.fname = (fname == undefined) ? generateFirstName(this.gender) : fname;
	this.sname = (sname == undefined) ? generateSurName() : sname;
	this.family = (family == undefined) ? new Family() : family;
	this.DoB = (DoB == undefined) ? year : DoB;
	this.age = (age == undefined) ? (year - this.DoB) : age;
	if(traits == undefined)
	{
		this.traits = {};
		generateTraits(this,family);
	}
	else{
		this.traits = traits;
	}
	this.faction = (faction == undefined) ? null : faction;
}

	/* TRAITS 
	 * data-format     : name, description, threshold, conflicts
	 * character-trait : name, count, active (if count >= threshold => active else dormant)
	 * trigger-format  : whenToCheck, effect(person)
	 */
function Trait(name, count, active)
{
	this.name = name;
	this.count = (count == undefined) ? 0 : count;
	this.active = (active == undefined) ? false : active; //true if count >= threshold
}

function TraitTrigger(whenToCheck, effect){
	this.whenToCheck = whenToCheck; // event ID i.e "CharacterBorn", "CharacterComingOfAge".
	this.effect = effect; //a function of Person
}
	traitTriggers = 
	{
		'dad_was_authoritarian':new TraitTrigger("CharacterComesOfAge", function(person){
			if(person.family.father.traits["authoritarian"] >= 1){
				incrementTrait(person, "authoritarian", 50);
				incrementTrait(person, "kind", 25);
			}
		}),
		'randomBirth':new TraitTrigger("CharacterBirth", function(person){
			generateTraits(person);
		})//, add hereditary traits as well.
		
	};

	/*TODO:
	 * Consider adding several levels for each trait. Will probably make the game more fun, and in some cases make more sense
	 */ 
function TraitData(name, desc, threshold, conflicts, mChance, fChance, noTurningBack){
	this.name = name; // unique name
	this.desc = desc; // description
	this.threshold = threshold; // if count is lower than threshold then the trait is dormant
	this.conflicts = conflicts; // list of traits that contradict this one
	this.maleRandomChance = mChance; //chance for a male child to randomly get the trait.
	this.femaleRandomChance = fChance; //chance for a female child to randomly get the trait.
	this.noTurningBack = noTurningBack; //true means there is no way of removing this trait.
}

traitsData = 
{	
	/* TODO: make sure that conflicts are set so that no permanent traits are removed.

	/* variable, 			      Name,         Description,     Threshold, Conflicts, maleRandomChance, femaleRandomChance, noTurningBack*/
	'aggressive': new TraitData("Aggressive", "Reckless and brutal.", 5, ["calm", "cautious"], 15/100, 10/100, false),
	'ambitious' : new TraitData("Ambitious", "Determined to improve", 5, ["childish"], 5/100, 5/100, false),
	'attractive': new TraitData("Attractive", "People are drawn to <name>.", 2, ["ugly"], 20/100, 25/100, false),
	'autistic'  : new TraitData("Autistic", "Unresponsive and compulsive.", 1, ["flirty", "naturalLeader"], 2/1000, 1/1000, true),
	'brave'     : new TraitData("Brave", "Not afraid of new challenges, risks, or death", 5, ["cowardly"], 10/100, 10/100, false),
	'blind'     : new TraitData("Blind", "<name> can not see.", 1, [], 1/1000, 1/1000, true),
	'calm'      : new TraitData("Calm", "Doesn't get agitated or afraid easily", 5, ["aggressive", "wild"], 10/100, 10/100, false),
	'cautious'  : new TraitData("Cautious", "Acts only when certain", 5, ["aggressive", "confident"], 10/100, 10/100, false),
	'childish'  : new TraitData("Childish", "Immature. Not interested in honorable endeavours", 4, ["ambitious"], 5/100, 5/100, false),
	'confident' : new TraitData("Confident", "Doesn't second guess <his/her> own decisions", 5, ["cautious"], 10/100, 10/100, false),
	'cowardly'  : new TraitData("Cowardly", "Fears death and injury.", 5, ["brave"], 10/100, 10/100, false),
	'cruel'     : new TraitData("Cruel", "Enjoys treating others poorly", 8, ["kind", "generous"], 10/100, 10/100, false),
	'deaf'      : new TraitData("Deaf", "<name> can not hear", 1, [], 1/500, 1/500, true),
	'dwarf'		: new TraitData("Dwarf", "Suffers from dwarfism", 1, [], 1/40000, 1/40000, true),
	'fertile'   : new TraitData("Fertile", "<hidden>", 1, ["infertile"], 0, 0, false),
	'flirty'    : new TraitData("Flirty", "", 5, ["faithful"], 20/100, 20/100, false),
	'generous'  : new TraitData("Generous", "", 5, ["cruel"], 20/100, 20/100, false),
	'hemophiliac':new TraitData("Hemophiliac", "<name>'s blood does not clot or coagulate", 1, [], 1/100000, 1/1000000, true),
	'homosexual': new TraitData("Homosexual", "Prefers <genderPlural>", 1, [], 0/100, 0/100, false),
	'lucky'     : new TraitData("Lucky", "Blessed with an unfailing luck", 1, ["unlucky"], 2/100, 2/100, false),
	'naturalLeader':new TraitData("Natural Leader", "", 1, ["shy"], 1/100, 1/100, true),
	'scholarly' : new TraitData("Scholarly", "Doesn't act on a hunch", 5, ["wild", "superstitious"], 10/100, 10/100, false),
	'superstitious':new TraitData("Superstitious", "Has a tendency to fall for questionable logic", 5, ["superstitious"], 10/100, 10/100, false),
	'pious'     : new TraitData("Pious", "Faithful belief in a higher power", 5, [], 20/100, 20/100, false),
	'ugly'      : new TraitData("Ugly", "Blessed with a face only a mother could love", 3, ["attractive"], 10/100, 10/100, false),
	'unfaithful': new TraitData("Unfaithful", "One partner is not enough", 3, ["faithful", "honorable"], 10/100, 10/100, false),
	'unlucky'   : new TraitData("Unlucky", "", 1, ["lucky"], 1/100, 1/100, false),
	'wild'      : new TraitData("Wild", "", 5, ["scholarly", "calm"], 20/100, 20/100, false),
	'witty'     : new TraitData("Witty", "", 4, ["dull"], 20/100, 20/100, false),
	'wise'      : new TraitData("Wise","", 5, [], 10/100, 10/100, false),
}

function generateTraits(person, family){
	if(person.traits == undefined) person.traits = {};
	var keys = Object.keys(traitsData);
	var c = (person.gender == "Male");
	for(var i = 0; i < keys.length; i++){
		if(c){
			if(random(1000000) <= 1000000*traitsData[keys[i]].maleRandomChance){
				incrementTrait(person, keys[i], 1, family == undefined);
			}
	
		}
		else{
			if(random(1000000) <= 1000000*traitsData[keys[i]].femaleRandomChance){
				incrementTrait(person, keys[i], 1, family == undefined);
			}
		}
	}
	if(family != undefined && family.mother != null && family.father != null)
	{
	}
}

function incrementTrait(person, trait, chance, ignoreThreshold){
	ignoreThreshold = (ignoreThreshold == undefined) ? false : ignoreThreshold;
	if(chance == undefined || random(1000000) <= chance*1000000){
		if(person.traits[trait] == undefined){
			person.traits[trait] = new Trait(trait);
		}
		var data = traitsData[trait];
		if(ignoreThreshold){
			person.traits[trait].count = data.threshold;
		}
		else{
			person.traits[trait].count++;
		}
		if(data.threshold <= person.traits[trait].count && noConflictingTraits(person, trait)){
			person.traits[trait].active = true;
			//event?
		}		
		for(var i = 0; i < data.conflicts.length; i++)
		{
			if(person.traits[data.conflicts[i]] == undefined){
				person.traits[data.conflicts[i]] = new Trait(data.conflicts[i]);
			}
			person.traits[data.conflicts[i]].count--;
			if(data.threshold > person.traits[trait].count || noConflictingTraits(person, trait)){
				if(!traitsData[trait].noTurningBack && !ignoreThreshold){
					person.traits[trait].active = false;
				}
				//event?
			}
		}
	}	
}	

function noConflictingTraits(person, ctrait){
	for(var i = 0; i < traitsData[ctrait].conflicts.length; i++){
		if(traitActive(person, traitsData[ctrait].conflicts[i])){
			return false;
		}
	}
	return true;
}

function traitActive(person, trait){
	if(person.traits[trait] == undefined) return false;
	else return person.traits[trait].active;
}
	
function trait(person,trait){
	if(person.traits[trait] == undefined) return 0;
	return person.traits[trait];
}

function generateSurName(){
	var r = random(0,surnames.length-1);
	return surnames[r];
}
	
function generateFirstName(gender){
	 if(gender == "Male"){
		var r = random(0,maleNames.length-1);
		return maleNames[r];
	 }
	 else{
		var r = random(0,femaleNames.length-1);
		return femaleNames[r];
	 }
}
	
function generatePerson(location, gender){
	if(location == undefined){
		//place person in random settlement
		//try to find the source of this. shouldn't happen..
		alert(2);
	}
	return person = new Person(location, undefined, gender);
}	
	
function generateChild(mother, father, gender){
	return child = new Person(mother.location, new Family(father, mother), gender);	
}

function displayTraits(person){
	var res = $("<div></div>").addClass("characterTraits");
	var keys = Object.keys(person.traits);
	for(var i = 0; i < keys.length; i++){
		if(person.traits[keys[i]].active && !person.traits[keys[i]].hidden){
			res.append($("<div></div>").addClass("characterTrait").text(traitsData[keys[i]].name));
		}
	}
	return res;
}

function displayPerson(person){
	var viewer = $("#eventViewer");
	var name = $("<div></div>").addClass("characterName").text(person.fname + " " + person.sname);
	var close = "<div class='close'>close</div>";
	var age = $("<div></div>").addClass("characterAge").text(person.age);
	var location = $("<div></div>").addClass("characterLocation").text(person.location);
	viewer.append(name).append(age).append(location).append(displayTraits(person)).append(close);
	
}

function createDynasty(root){
	var dynasty = new Dynasty();
	if(root == undefined){
		root = generatePerson();
	}
	dynasty.root = root;
	dynasty.factionLeader = root;
	return world.dynasty = dynasty;
}

function removePersonFromTile(person,tile){
	return; //TODO FIX, only store person ids in cities. This was bad anyway
	if(tile == undefined) return;
	var index = member(person,tile.people);
	if(index != -1){
		tile.people = tile.people.splice(index, 1);
		tile.population--;
	}
}

function movePersonTo(person,location){
	return; //TODO FIX, only store person ids in cities.
	removePersonFromTile(person, world.tiles[person.location.x][person.location.y]);
	location.people.push(person);
	location.population++
}

function randomTile(area){
	var r = area.tiles[random(0,area.tiles.length)];
	if (!r.x){
	 r = r[random(0,r.length)];
	}
	return lookUpCoord(r);
}

function randomCity(){
	return cities[random(0,cities.length)];
}

function changeCityPopulation(city, amount){
	// affects city.population and density. 
	if(amount != 0){
		city.population += amount;
		city.density = city.population / city.tiles.length;
		var perTile = Math.round(amount / city.tiles.length); 
		$.each(city.tiles, function(i, tile){
			lookUpCoord(tile).population += perTile;
		});
	}	
}

function changeCitySize(city, amount){
	// affects city.tiles and density
	var oldDensity = city.population / (city.tiles.length);
	city.density = city.population / (city.tiles.length + amount);
	if(amount > 0){
		var candidates = [];
		$.each(city.tiles, function(i,val){
			var tile = lookUpCoord(val);
			var r = val;
			//"move" people from this tile to the new
			tile.population -= Math.round(Math.min(tile.population, Math.abs(oldDensity - city.density)));
			if(tile.borders != null)
				$.each(tile.borders, function(k, val2){
					try{
						if(val2 == "left"){
							var t = lookUpCoord(r.x - 1, r.y);
							if(t.type == "grass")
								candidates.push(t);
						}
						else if(val2 == "below"){
							var t = lookUpCoord(r.x, r.y + 1);
							if(t.type == "grass")
								candidates.push(t);
						}
						else if(val2 == "above"){
							var t = lookUpCoord(r.x, r.y - 1);
							if(t.type == "grass")
								candidates.push(t);
						}
						else if(val2 == "right"){
							var t = lookUpCoord(r.x + 1, r.y);
							if(t.type == "grass")
								candidates.push(t);
						}
					}
					catch(e){//coordinate was (most likely) out of bounds
					}
				});
		});
		candidates = candidates.sort(function(a,b){return b.value - a.value;});
		var i = 0; 
		while(amount-- && i < candidates.length){
			var tile = candidates[i];
			tile.type = "settlement";
			delete(tile.ruin);
			tile.newSettlement = true;
			//remove tile from old field
			if(tile.field != undefined){
				//TODO fix...
				var area = world.areas[tile.field];
				removeFromArea(area,tile.globalPosition);
			}
			$.each(tile.neighbours, function(i,val){
				var neighbour = lookUpCoord(val[0],val[1]);
				var nx = val[0] - tile.globalPosition.x;
				var ny = val[1] - tile.globalPosition.y;
				if(Math.abs(nx) != Math.abs(ny)){
					if(neighbour.type != "settlement"){
						//add border
						switch(nx){
							case -1:
								tile.borders.push("left"); 
								neighbour.borders.push("right");
								break;
							case 1:
								tile.borders.push("right");
								neighbour.borders.push("left");
								break;
							case 0:
								switch(ny){
									case -1:
										tile.borders.push("above");
										neighbour.borders.push("below");
										break;
									case 1:
										tile.borders.push("below");
										neighbour.borders.push("above");
										break;
								}
								break;
						}
					}
					else if(neighbour.type == "settlement"){
						//remove border
						switch(nx){
							case -1:
								tile.borders.remove("left"); 
								neighbour.borders.remove("right");
								break;
							case 1:
								tile.borders.remove("right");
								neighbour.borders.remove("left");
								break;
							case 0:
								switch(ny){
									case -1:
										tile.borders.remove("above");
										neighbour.borders.remove("below");
										break;
									case 1:
										tile.borders.remove("below");
										neighbour.borders.remove("above");
										break;
								}
								break;
						}
					}
				}
			});
			//add tile to new field
			tile.field = city.id;
			addToArea(city, tile.globalPosition);
			tile.population = Math.round(city.density);
			i++;
		}
		$.each(city.vicinity, function(i,val){
			if(val == undefined) return true;
			var tile = lookUpCoord(val);
			if(tile.type == "settlement"){
				city.vicinity.splice(i,1);
			}
		});
		getCityRange(city);
	}
	else if(amount < 0){
		amount = Math.min(city.tiles.length - 1, Math.abs(amount)); // at least one tile left
		var candidates = [];
		$.each(city.tiles, function(i,val){
			var tile = lookUpCoord(val);
			tile.population += Math.abs(oldDensity - city.density);
			candidates.push(tile);
		});
		candidates = candidates.sort(function(a,b){return a.value - b.value;});
		i = 0;
		while(amount-- && i < candidates.length){
			var tile = candidates[i];
			removeFromArea(city,tile.globalPosition);
			tile.type = "grass";
			tile.ruin = true;
			delete(tile.newSettlement);
			tile.field = "?";
			var alone = true;
			$.each(tile.neighbours, function(i,val){
				var neighbour = lookUpCoord(val[0],val[1]);
				var nx = val[0] - tile.globalPosition.x;
				var ny = val[1] - tile.globalPosition.y;
				if(Math.abs(nx) != Math.abs(ny)){
					if(neighbour.type != "grass"){
						//add border
						switch(nx){
							case -1:
								tile.borders.push("left"); 
								neighbour.borders.push("right");
								break;
							case 1:
								tile.borders.push("right");
								neighbour.borders.push("left");
								break;
							case 0:
								switch(ny){
									case -1:
										tile.borders.push("above");
										neighbour.borders.push("below");
										break;
									case 1:
										tile.borders.push("below");
										neighbour.borders.push("above");
										break;
								}
								break;
						}
					}
					else if(neighbour.type == "grass"){
						//remove border
						if(alone){
							tile.field = neighbour.field;
							var area = world.areas[neighbour.field];
							addToArea(area,tile.globalPosition);
							alone = false;
						}
						switch(nx){
							case -1:
								tile.borders.remove("left"); 
								neighbour.borders.remove("right");
								break;
							case 1:
								tile.borders.remove("right");
								neighbour.borders.remove("left");
								break;
							case 0:
								switch(ny){
									case -1:
										tile.borders.remove("above");
										neighbour.borders.remove("below");
										break;
									case 1:
										tile.borders.remove("below");
										neighbour.borders.remove("above");
										break;
								}
								break;
						}
					}
				}
			});
			if(tile.field == "?"){
				//isolated
				var field = new Area();
				field.id = "a"+world.areas['id']++;
				field.name = "TEMP " + tile.type.toUpperCase() + "AREA";
				field.tiles = [tile.globalPosition];
				field.type = tile.type;
				world.areas[field.id] = field;
				world.areas['totalAmount'] = world.areas['totalAmount'] + 1;
				world.areas[field.type]++;
				tile.field = field.id;
			}
			i++;
		}
		delete(city.vicinity); //rather expensive...
		getCityRange(city);
	}
}

function calculateStatistics(){
	/*Count stuff*/
	allTraits = {};
	maleTraits = {"aggressive":0};
	femaleTraits = {"blind":0};
	males = 0;
	females = 0;
	averageAge = 0;
	highestAge = 0;
	lowestAge = 1000;
	for(var i = 0; i < allPeople.length; i++){
		if(allPeople[i].gender == "Male"){
			males++;
		}
		else{
			females++;
		}
		var keys = Object.keys(allPeople[i].traits);
		for(var k = 0; k < keys.length; k++){
			if(allPeople[i].traits[keys[k]].active){
				if(allTraits[keys[k]] == undefined) allTraits[keys[k]] = 0;
				allTraits[keys[k]]++;
				if(allPeople[i].gender == "Male"){
					if(maleTraits[keys[k]] == undefined) maleTraits[keys[k]] = 0;
					maleTraits[keys[k]]++;
				}
				else{
					if(femaleTraits[keys[k]] == undefined) femaleTraits[keys[k]] = 0;
					femaleTraits[keys[k]]++;
				}
			}
			
		}
	}
	var res = {"traits":allTraits, "mTraits":maleTraits, "fTraits":femaleTraits, "people":males+females, "nrMales":males, "nrFemales":females,};
	return res;
}

/*Returns the maximum population size sustainable at the tile.*/
function tileMaxPopSize(tile){
	var pos = tile.globalPosition;
	var resFood = 0;
	var resDrink = 0;
	for(nX = -2; nX < 3; nX++){
		for(nY = 2; nY > -3; nY--){ 	
			cX = pos.x + nX;
			cY = pos.y + nY;
			if(cX < 0 || cY < 0 || cX >= world.sizeX || cY >= world.sizeY){
				continue; //out of bounds
			}
			var keys = Object.keys(world.tiles[cX][cY].resources);
			for(var i = 0; i < keys.length; i++){
			
				resFood += resourceData[keys[i]].foodValue;
				resDrink += resourceData[keys[i]].drinkValue;
			}
		}
	}
	if(resDrink == 0)
	{
		return 0;
	}
	return resFood*2;
}

/* Generate a human population for the world 
 *
 *  Population size is determined by world size.
 *  The population is placed where value is high and there is food and drinkable water available
 *  tile.resources and tile.value must be set before running this
 */
function generatePopulation(){
	//TODO rework.
	//more "control" of population size 
	//settlement size is set according to resources and wealth
	//population size is set according to the cities size, resources and wealth
	largestCity = 0;
	var lowestAccepted = {tile:0, value:Infinity};
	var tiles = [];
	var size = world.sizeX * world.sizeY;
	var places = Math.round(Math.max(10, Math.min(50, size * (random(1,10) / 20000))));
	print("Potential city amount: " + places);
	var amount = places*1000;
	var amountPeople = places;
	for(var x = 0; x < world.tiles.length; x++){
		for(var y = 0; y < world.tiles[0].length; y++){
			var tile = world.tiles[x][y];
			if(tile.type == "grass"){
				var value = tile.value;
				if(tileMaxPopSize(tile) < 100)
				{
					value = 0;
				}
				if(places > 0)
				{
					if(value < lowestAccepted.value)
					{
						lowestAccepted.tile = tiles.length;
						lowestAccepted.value = value;
						//alert(lowestAccepted.value);
					}
					tiles.push(tile);
					places--;
				}
				else if(value >= lowestAccepted.value && tileMaxPopSize(tile) > 100)
				{
					tiles[lowestAccepted.tile] = tile;
					tiles = tiles.sort(function(a,b){return b.value - a.value;}); //wtf
					lowestAccepted.tile =  tiles.length - 1;
					lowestAccepted.value = tiles[lowestAccepted.tile].value;
				}
			}
		}
	}
	tiles = tiles.sort(function(a,b){return b.value - a.value;});
	amountLeft = amount;
	amountPLeft = amountPeople;
	var iter = 0;
	var cities = 0;
	var placed = 0;
	while(amountLeft > 1 && iter < 10)
	{
		iter++;
		for(var i = 0; i < tiles.length; i++){
			tiles[i].originalSettlement = true;
			if(iter == 1)
				cities++;
		//randomly put population, totalling to "amount", with more people in more valuable spots.
			var adding = random(1,tileMaxPopSize(tiles[i]));//amountLeft*0.1) + 1;
			var addP = Math.round(adding/100);
			for(var k = 0; k <= addP; k++){
				var person = generatePerson(tiles[i]);
				person.id = allPeople.push(person);
				tiles[i].people.push(person.id);
				amountPLeft--;
			}
			amountLeft -= adding;
			var t = random(1,adding*0.3);
			placed += t;
			tiles[i].population += t;
			tiles[i].type = "settlement";
			if(tiles[i].community == null)
			{
				tiles[i].community = [];
				tiles[i].community.push(tiles[i].globalPosition);
			}
			
			if(tiles[i].population > largestCity)
			{
				largestCity = tiles[i].population;
			}
			adding -= t;
			/*Attempt to spread population around tile*/
			var origin = tiles[i].globalPosition;
			var direction;
			var x = origin.x;
			var y = origin.y;
			/*Check if island*/
			var island = true;
			for(nX = -1; nX < 2; nX++)
			{
				for(nY = 1; nY > -2; nY--)
				{ 	
					cX = x + nX;
					cY = y + nY;
					if((nY == 0 && nX == 0) || cX < 0 || cY < 0 || cX >= world.sizeX || cY >= world.sizeY){
						continue; //out of bounds
					}
					if(world.tiles[cX][cY].type == "grass")//tiles[i].type)
					{
						island = false;
						break;
					}
				}
			}
			if(island)
			{
				tiles[i].population += adding;
				addP = Math.round(adding/100);
				for(var k = 0; k <= addP; k++){
					var person = generatePerson(tiles[i]);
					person.id = allPeople.push(person);
					tiles[i].people.push(person.id);
				}
				if(tiles[i].population > largestCity)
				{
					largestCity = tiles[i].population;
				}
				placed += adding;
			}
			else
			{
				for(var k = 0; k < 10; k++){
					direction = random(-1,1);//Math.floor(Math.random()*3) - 1;
					x += direction;
					if(direction != 0) {
						direction = random(-1,1);//Math.floor(Math.random()*3) - 1;
						y += direction;
					}
					if(x < 0 || x >= world.sizeX || y < 0 || y >= world.sizeY){
						x = origin.x;
						y = origin.y;
					}
					else if(world.tiles[x][y].type == "grass"){//tiles[i].type){
						var maxPop = tileMaxPopSize(world.tiles[x][y]);
						var temp;
						if(maxPop > adding)
						{
							temp = random(1,adding*0.6);
						}
						else{
							temp = random(1,maxPop);
						}
						
						world.tiles[x][y].population += temp;
						world.tiles[x][y].type = "settlement";
						addP = Math.round(temp/100);
						for(var k = 0; k <= addP; k++){
							var person = generatePerson(world.tiles[x][y]);
							person.id = allPeople.push(person);
							world.tiles[x][y].people.push(person.id);
						}
						if(world.tiles[x][y].community == null && (tiles[i].community != null && tiles[i].community.push != undefined))
						{
							if(tiles[i].community == null) tiles[i].community = [];
							testA = tiles[i].community; 
							tiles[i].community.push(world.tiles[x][y].globalPosition);
							world.tiles[x][y].community = tiles[i].globalPosition;
						}	
						if(world.tiles[x][y].population > largestCity)
						{
							largestCity = world.tiles[x][y].population;
						}
						placed += temp;
						adding -= temp;
						if(adding < 1)
						{
							break;
						}
					}
				}
			}
			//alert("adding " + t + " to ("+origin.x+", "+origin.y+")'s total population of " + tiles[i].population + ". amount left is " + amountLeft);
			//alert("x: " + tiles[i].globalPosition.x + ", y: " + tiles[i].globalPosition.y);
			amountLeft += adding;
			world.tiles[tiles[i].globalPosition.x][tiles[i].globalPosition.y] = tiles[i];
			if(amountLeft <= 0)
			{
				break;
			}
		}
	}
	
	print("largest city has population of " + largestCity + ", there are " + placed + " in " + cities + " cities (exc. settlements) from " + iter + " iterations.");
	//genetics???
}