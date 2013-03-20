function Family(father, mother, children){
	this.father = (father == undefined) ? null : father; //these have to be id s...
	this.mother = (mother == undefined) ? null : mother; 
	this.children = (children == undefined) ? [] : children;
}

function drawPersonInTree(source, x, y, width){
	var box = $("<div>").css({"top":y,"left":x,"width":width,"display":"inline-box"});
	box.append(portrait).append(name).append(age);
	return $("#FamilyTree").append(box);
}

function drawFamilyTree(source, drawUp, x, y, width){
	if(drawUp){
		//find ancestor, draw his/her tree, scroll to source.
	}
	var box = drawSelf(source,x,y,width);
	//draw spouse
	var children = $("<div>");
	width = (100 / children.length) + "%";
	for(var i = 0; i < source.children.length; i++){
		children.append(drawFamilyTree(source.children[i], false, width*i, y+10, width));
	}
	return box.append(children);
	//updateFamilyTree();
}