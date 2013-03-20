function Event(name){
	this.name = name;
	this.header;
	this.contents;
	this.related;
	this.effected;
}

var superEvents = {
	"EndOfTurn":0,
	"EndOfYear":1,
	"EndOfSeason":2,
	"CharacterBorn":3,
	"CharacterComingOfAge":4,
	"CharacterDead":5,
	"CharacterFatherDead":6,
	"CharacterMotherDead":7,
	"CharacterSiblingDead":8,
	"CharacterChildDead":9,
	"CharacterRelativeDead":10,
	"FactionLeaderDead":11,
	"FactionHeirDead":12,
}

var eL = {
	"CharacterBorn":0,
	"CharacterDead":1,
	"CharacterTraitGained":2,
	"CharacterTraitLossed":3,
	"CharacterInjuredInBattle":4,
	"CharacterIll":5,
	"CharacterPregnant":6,
	"CharacterMiscarried":7,
	"Earthquake":8,
	"Floods":9,
	"Draught":10,
	"PoorHarvest":11,
	"Famine":12,
	"CharacterBornMotherDead":13,
	"CharacterBornFatherDead":14,
	"CharacterBornBothParentsDead":15,
	"CharacterOrphaned":16,
	"CharacterChildDies":17,
	"CharacterMiscarriedMotherDead":18,
	"GameStart":19,
	"GameTurnEnd":20
	};

function triggerEvent(event){
	eventsList.push(event);
	var keys = Object.keys(traitTriggers);
	for(var i = 0; i < keys.length; i++){
		var trigger = traitTriggers[keys[i]];
		if(trigger.whenToCheck == event){ //TODO fix
			trigger.effect(event.effected); //and fix
		}
	}
}	
	
function generateEvent(type, aux){
	switch(type){
		case eL["CharacterBorn"]:
			var child = aux[0];
			var father = aux[1];
			var mother = aux[2];
			//check child's gender, traits and parent's health.
			var header;
			var temp = "";
			var gender = "son";
			if(child.gender == "Female"){
				header = "daughter";
			}
			var contents = "The child is a healthy " + gender + " ";
			if(child.gender == "Female"){
				header = "The family has been blessed with a " + gender;
			}
			else{
				header = "The family has been blessed with a " + gender;
			}
			new Event()
			break;
		case eL["CharacterDead"]:
			break;
	}
}