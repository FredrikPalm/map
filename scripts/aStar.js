function cleanupHeap(set1,heap){
	for(var i = 0; i < set1.length; i++){
		var item = set1[i];
		delete(item.visited);
		delete(item.closed);
		delete(item.h);
		delete(item.f);
		delete(item.g);
		delete(item.cameFrom);
	}
	delete(set1);
    if(heap !== undefined){
		while(heap.size() > 0) {
			var item = heap.pop();
			delete(item.visited);
			delete(item.closed);
			delete(item.h);
			delete(item.f);
			delete(item.g);
			delete(item.cameFrom);
		}
		delete(heap);
	}
}

function heuristic(start, goal){
    var goal = goal.globalPosition;
    var start = start.globalPosition;
    return euclideanDistance(goal,start); // should maybe use manhattan, but hey
}

function euclideanDistance(pos1, pos2){
    return Math.sqrt(Math.pow(pos1.x - pos2.x,2) + Math.pow(pos1.y - pos2.y,2));
}

function distanceBetween(start, neighbour){
    var g; 
    var multiplier = 3;
    if(neighbour.road){
        multiplier = 1;
    }
    if(neighbour.type == "mountain"){
        g = 10 * neighbour.depth;
    }
    else if(neighbour.type == "forest"){
        g = neighbour.depth;
    }
    else if(neighbour.type == "water"){
        g = 20 * neighbour.depth;
    }
    else if(neighbour.type != "settlement"){
        g = 1/2 * neighbour.depth;
    }
    else{
        g = 2;
    }
    return g*multiplier;
}

function heapAStar(start, goal, goalCond, distanceFunc, heuristicFunc, returnFunc, failFunc, maxLength){
    if(maxLength == undefined) maxLength = Infinity;
    var heap = function() {
            return new BinaryHeap(function(node) { 
                return node.f; 
            });
        };

    var openHeap = heap();
    var closedset = []; //for cleanup
    openHeap.push(start);
    start.g = 0;
    while(openHeap.size() > 0) {

        // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
        var currentNode = openHeap.pop();

        // End case -- result has been found, return the traced path.
        if(goalCond(currentNode)){
            var path = returnFunc(currentNode, goal);   
            cleanupHeap(closedset,openHeap);
            return path;
        }

        // Normal case -- move currentNode from open to closed, process each of its neighbors.
        currentNode.closed = true;
        closedset.push(currentNode); //just for cleanup

        for(var k = 0; k < currentNode.neighbours.length; k++){
            var neighbor = world.tiles[currentNode.neighbours[k][0]] [currentNode.neighbours[k][1]];

            if(neighbor.closed) {
                // Not a valid node to process, skip to next neighbor.
                continue;
            }


            // The g score is the shortest distance from start to current node.
            // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
            var gScore = currentNode.g + distanceFunc(currentNode, neighbor);
            
            if(gScore == Infinity || gScore > maxLength){
                continue;
            }

            var beenVisited = neighbor.visited;

            if(!beenVisited || gScore < neighbor.g) {

                // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                neighbor.visited = true;
                neighbor.cameFrom = currentNode;
                neighbor.h = neighbor.h || heuristicFunc(neighbor, goal);
                neighbor.g = gScore;
                neighbor.f = neighbor.g + neighbor.h;

                if (!beenVisited) {
                    // Pushing to heap will put it in proper place based on the 'f' value.
                    openHeap.push(neighbor);
                }
                else {
                    // Already seen the node, but since it has been rescored we need to reorder it in the heap
                    openHeap.rescoreElement(neighbor);
                }
            }
        }
    }
    cleanupHeap(closedset);
    // No result was found - empty array signifies failure to find path.
    return [];
}



function BinaryHeap(scoreFunction){
    this.content = [];
    this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
    push: function(element) {
        // Add the new element to the end of the array.
        this.content.push(element);

        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    },
    pop: function() {
        // Store the first element so we can return it later.
        var result = this.content[0];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (this.content.length > 0) {
             this.content[0] = end;
             this.bubbleUp(0);
        }
        return result;
    },
    remove: function(node) {
        var i = this.content.indexOf(node);
    
        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();

        if (i !== this.content.length - 1) {
            this.content[i] = end;
            
            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sinkDown(i);
            }
            else {
                this.bubbleUp(i);
            }
        }
    },
    size: function() {
        return this.content.length;
    },
    rescoreElement: function(node) {
        this.sinkDown(this.content.indexOf(node));
    },
    sinkDown: function(n) {
        // Fetch the element that has to be sunk.
        var element = this.content[n];

        // When at 0, an element can not sink any further.
        while (n > 0) {

            // Compute the parent element's index, and fetch it.
            var parentN = ((n + 1) >> 1) - 1,
                parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            }

            // Found a parent that is less, no need to sink any further.
            else {
                break;
            }
        }
    },
    bubbleUp: function(n) {
        // Look up the target element and its score.
        var length = this.content.length,
            element = this.content[n],
            elemScore = this.scoreFunction(element);
        
        while(true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) << 1, child1N = child2N - 1;
            // This is used to store the new position of the element,
            // if any.
            var swap = null;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
            // Look it up and compute its score.
            var child1 = this.content[child1N],
                child1Score = this.scoreFunction(child1);

            // If the score is less than our element's, we need to swap.
            if (child1Score < elemScore)
                swap = child1N;
            }

            // Do the same checks for the other child.
            if (child2N < length) {
                var child2 = this.content[child2N],
                    child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            // If the element needs to be moved, swap it, and continue.
            if (swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            }

            // Otherwise, we are done.
            else {
                break;
            }
        }
    }
};


