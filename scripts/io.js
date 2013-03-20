function jsonTo(json){
	return JSON.parse(json);
}
function toJSON(object){
	return JSON.stringify(object);
}
function worldToJSON(world, save){
	var temp = world;
	for(var x = 0; x < world.tiles.length; x++){
		for(var y = 0; y < world.tiles[0].length; y++){
			temp.tiles[x][y].neighbours = null;
			temp.tiles[x][y].field = null;
		}
	}
	foll = temp;
	var res = toJSON(temp);
	save = (save == undefined) ? true : save;
	if(save){
		if(false)window.location = "frkp.lgnas.com/download.php?d"+res+"&r"+window.location;
	}
	return res;//watchA;
}

function XMLToDiaHelper(dia, lastNode, xml, isRoot){
	if(!isRoot){
		lastNode.id = $(xml).attr("idNum");
		lastNode.speaker = $(xml).attr("nodeType");
		lastNode.content = $(xml).find("conversationText:first").text();
		lastNode.parent.children.push(lastNode);
	}
	else{
		lastNode.id = "root";
	}	
	
	 var subNodes = $(xml).find("subNodes:first");
	
	 subNodes = subNodes[0].childNodes;
	for(var i = 0; i < subNodes.length; i++){
		if(i%2 == 0){
		}
		else{
		var nextXML = subNodes[i]; 
		XMLToDiaHelper(dia, new node(dia, null, lastNode), nextXML, false);
		}
	}
}

function XMLToDia(xml){
	newDia = new dialogue();
	root = new node(newDia, "root");
	cn = $(xml).find("Conversation");
	XMLToDiaHelper(newDia, root, cn, true);
	newDia.root = root;
	viewDia(newDia);
}
function loadXML(url){
	$.get('resources/'+url+".xml", function(xml) { //need server-side script to capture 404.
 	 play(XMLToDia(xml));
	});	
}
function HTMLToDia(html){
	
}


function diaToXML(dia){
		
}

function diaToText(dia){
	
}

function diaToHTML(dia){
	
}

function loadDia(url){
	$(".window").hide();
	$("#Player").show().empty().append($("<span>").addClass("close").append(" X "))
	.append($("<span>").addClass("node current").append("Loading..."));
	//$(".edit.content").val("Please wait... loading help");
	$.get('resources/'+url, function(json) { //need server-side script to capture 404.
 	 play(jsonTo(json));
	});
}

function help(){
	//load dia from db
	loadDia("help");
	return;
	$(".edit.content").val("Please wait... loading help");
	$.get('resources/help', function(json) {
 	 play(jsonTo(json));
	});
	//play that dia	
}