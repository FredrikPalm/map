/*Put all colonization mode specific code here*/
function getMode(){
	return "colonization";
}

var localWorld;

function craftNewWorld(tilesize, seed){
	if(tilesize != undefined && tilesize != world.tileSize){
		world.tileSize = tileSize;
	}
	world.sizeX = w/world.tileSize;
	world.sizeY = h/world.tileSize;	
	if(seed == undefined || seed == ""){
		m = new MersenneTwister();
	}
	else{
		
		m = new MersenneTwister(seed);
	}
	areas = {};
	people = [];
	world.tiles = generateWorld(world.sizeX,world.sizeY);
	measureDepth(world,0,false);//,1,true); //needs tiles to measure
	generateResources();		//needs depth from measureDepth
	determineValue();			//needs resources from generateResources
	var colony = [];
	world.startPosition = randomTile(world);
	for(var i = 0; i <= 10; i++){
		colony.push(generatePerson(world.startPosition));
	}
	world.colony = colony;
	world.colony.root = colony[0];
	world.colony.factionLeader = colony[0];
	world.colony.general = colony[1];
	world.colony.heir = colony[2];
	people = colony;
	checkAreas();				//needs settlements from generatePopulation
	var player = people[random(0,people.length-1)]; //new generatePerson(); //needs areas to pick a city at random.
	createDynasty(player); //move these to newGame()
	drawWorld3();
}

function Block(type, x,y){
	this.type = type;
	this.globalPosition = {"x":x,"y":y};
}

function generate2DWorld(blocks, tile,xStart,yStart,yEnd){
	yBase = 20;
	var type = "dirt";
	if(tile.type == "mountain"){
		yBase = 40*tile.depth;
		type = "stone";
	}
	else if(tile.type == "water"){
		yBase = 0*tile.depth;
		type = "water";
	}
	else if(tile.type == "sand"){
		yBase = 15;
		type = "sand";
	}
	if(yStart == undefined){// || Math.abs(yStart-yBase) > 15){
		yStart = yBase;
	}	
	var y = yStart;
	var generalDirection = (yBase-yStart)/40;
	for(var x = xStart; x <= xStart + 40; x++){
		//there should be a general inclination to go toward yBase
		//with some noise obviously
		if(y < 0) y = 0;
		alert(y);
		blocks[x][Math.round(y)] = new Block(type,x,Math.round(y));
		y += generalDirection;
		if(random(100) > 20){
			y += generalDirection;
		}
		else if(random(100) > 60){
			y -= generalDirection * 2;
		}
		if(random(100) > 50){
			y++;
		}
		else if(random(100) > 50){
			y--;
		}
	}	
	return y;
}

function drawBlocks(blocks){
	for(var x = 0; x < blocks.length; x++){
		for(var y = 0; y < blocks[x].length; y++){
			
		}
	}
}

function generate2DSideWorld(tiles){
	//each tile consists of 40X100 blocks totaling to 200X100 blocks
	var blocks = [];
	for(var x = 0; x<=200; x++){
		blocks[x] = [];
	}
	var t;
	for(var i = 0; i < tiles.length; i++){
		t = generate2DWorld(blocks, tiles[i], i*40,t);
	}
	return blocks;
}

function startConstruction(tile, rotation){
	
	tile.type = "settlement";
	return;
	//generate new 2d world for the tile.
	//all constructions are built on one tile, but have access to 4 nearby tiles.
	/*
				x1 to x5 is the area used when x3 is selected with rotation = false
				y1 to y5 is the area used when y3 is selected with rotation = true
				potentially, z1-z5 could be used as a background for x
						____________________						
						|z-2|z-1| z |z+1|z+2|						
						|x-2|x-1| x |x+1|x+2|						
						|___|___|y-2|___|___|
						|___|___|y-1|___|___|						
						|___|___| y |___|___|
						|___|___|y+1|___|___|
						|___|___|y+2|___|___|
	*/
	var x = tile.globalPosition.x;
	var y = tile.globalPosition.y;
    nearbyTiles = [];
	var lastTile  = world.tiles[0][0];
	if(rotation == undefined || !rotation){
		//loops 0 1 2 -1 -2
		for(var t = x; t <= x+2; t++){
			if(inBounds(world, t,y)){
				nearbyTiles[2+t-x] = (world.tiles[t][y]);
				lastTile = world.tiles[t][y];
			}
			else{
				nearbyTiles[2+t-x] = (lastTile);
			}
		}
		lastTile = tile;
		for(var t = x-1; t >= x-2; t--){
			if(inBounds(world, t,y)){
				nearbyTiles[2+t-x] = (world.tiles[t][y]);
				lastTile = world.tiles[t][y];
			}
			else{
				nearbyTiles[2+t-x] = (lastTile);
			}
		}
	}
	else{
		//loops 0 1 2 -1 -2
		for(var t = y; t <= y+2; t++){
			if(inBounds(world, t,y)){
				nearbyTiles[2+t-y] = (world.tiles[x][t]);
				lastTile = world.tiles[x][t];
			}
			else{
				nearbyTiles[2+t-y] = lastTile; //only keep type and depth
			}
		}
		lastTile = tile;
		for(var t = y-1; t >= y-2; t--){
			if(inBounds(world, x,t)){
				nearbyTiles[2+t-y] = (world.tiles[x][t]);
				lastTile = world.tiles[x][t];
			}
			else{
				nearbyTiles[2+t-y] =(lastTile); 
			}
		}
	}
	return generate2DSideWorld(nearbyTiles);
}

function showDynasty(){
	var viewer = $("#FamilyTree");
	var colony = world.colony;
	var generalTitle = $("<div>").text("General");
	var generalPortrait  = $("<div>");
	var generalName = $("<div>").text(colony.general.fname + " " + colony.general.sname);
	var general = $("<div>").append(generalTitle).append(generalPortrait).append(generalName);
	var chieftainTitle = $("<div>").text("Chieftain");
	var chieftainPortrait = $("<div>");
	var chieftainName = $("<div>").text(colony.factionLeader.fname + " " + colony.factionLeader.sname);
	var chieftain = $("<div>").append(chieftainTitle).append(chieftainPortrait).append(chieftainName);
	var heirTitle = $("<div>").text("Vice Chieftain");
	var heirPortrait  = $("<div>");
	var heirName = $("<div>").text(colony.heir.fname + " " + colony.heir.sname);
	var heir = $("<div>").append(heirTitle).append(heirPortrait).append(heirName);
	var leaders = $("<div>").append(general).append(chieftain).append(heir);
	leaders.css({"height":"25%","max-height":"25%"});
	leaders.children("*").css({"height":"100%","width":"32%","display":"inline-block","text-align":"center"})
		.children().css("height","33%");
	viewer.append(leaders);
	var workers = $("<div>");
	for(var i = 0; i < colony.length; i++){
		if(colony[i] != colony.factionLeader && colony[i] != colony.heir && colony[i] != colony.general){
			workers.append(showPerson(colony[i]));
		}
	}
	workers.css({"height":"75%", "overflow":"auto"});
	viewer.append(workers);
	viewer.append($("<div>").addClass("close").text("close"));
}

var skills = 
{
	"sowing":0,		//determines amount of harvestable crop generated
	"harvesting":0,		//determines amount of crop harvested
	"prospecting":0,		//determines likelihood of detecting minerals
	"mining":0,			//determines amount of stone/minerals retrieved
	"woodcutting":0,		//determines amount of wood retrieved
	"carpentry":0, 		//determines possibility, time and cost of constructions with wood
	"masonry":0,			//determines possibility, time and cost of constructions with stone
	"hunting":0,			//determines amount of game retrieved, likelihood of death
	"gathering":0,		//determines amount of food retrieved. 
	"fishing":0,			//determines amount of fish retrieved.
	"leadership":0		//determines morale of people lead
};

var professions = 
{	//old world profession.
	"farmer":0, 			//increased sowing and harvesting abilities
	"fisherman":0,		//increased fishing ability
	"huntsman":0,			//increased hunting ability
	"woodcutter":0,		//increased woodcutting ability
	"shoemaker":0,		
	"tailor":0,			
	"mason":0, 			//increased masonry (& mining) ability
	"carpenter":0,		//increased carpentry ability
	"weaver":0,			
	"blacksmith":0,		
	"tanner":0,
	"priest":0,			//increased leadership ability
	"sailor":0,
	"shipwright":0,
	"mathematician":0,
	"beggar":0,
	"housewife":0,
	"jailer":0
};

function modeInit(){
	$("#DynastyHeader").text("Colony");
}	
