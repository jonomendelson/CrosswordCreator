var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

var draw = true;

var SQUARE_SIZE = 80;
var LINE_WIDTH = SQUARE_SIZE/10;

function draw_puzzle(){
	if(draw){
		clear_canvas();
		ctx.lineWidth = LINE_WIDTH;
		for(var i = 0; i < puzzle.length; i++){
			for(var j = 0; j < puzzle[0].length; j++){
				if(puzzle[i][j] == "*"){
					ctx.fillRect(i*SQUARE_SIZE+LINE_WIDTH/2, j*SQUARE_SIZE+LINE_WIDTH/2, SQUARE_SIZE+LINE_WIDTH/2, SQUARE_SIZE+LINE_WIDTH/2);
					ctx.strokeRect(i*SQUARE_SIZE+LINE_WIDTH, j*SQUARE_SIZE+LINE_WIDTH, SQUARE_SIZE, SQUARE_SIZE);
				}else{			
					ctx.strokeRect(i*SQUARE_SIZE+LINE_WIDTH, j*SQUARE_SIZE+LINE_WIDTH, SQUARE_SIZE, SQUARE_SIZE);
					ctx.font = (SQUARE_SIZE/1.5) + "px Arial";
					var curr_text = puzzle[i][j];
					if(curr_text == "."){
						curr_text = "";
					}
					ctx.fillText(curr_text, (i+0.35)*SQUARE_SIZE, (j+0.82)*SQUARE_SIZE);
				}
			}
		}
	
		if(clue_number_locations.length == 0){
			console.log("NOTICE! Words have not been parsed yet! Run 'to_words();' first.");
		}else{
			for(var i = 0; i < clue_number_locations.length; i++){
				ctx.font = (SQUARE_SIZE/6) + "px Arial";
				ctx.fillText(((i+1)), (clue_number_locations[i][0]+0.18)*SQUARE_SIZE, (clue_number_locations[i][1]+0.33)*SQUARE_SIZE);
			}
		}
	}
}

function clear_canvas(){
	ctx.clearRect(0, 0, c.width, c.height);
}
