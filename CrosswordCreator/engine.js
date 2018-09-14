var words = [[], []]; //puzzle strung out into words; across then down
var clue_number_locations = [];
var tree = [];

var puzzles = [];

var selection = {x:0, y:0};

var logs_on = false;

var stop_solving = false;

var PATIENCE = 1;

//filter dictionary
for(var i = 0; i < dictionary.length; i++){
	if(dictionary[i].includes("'")){
		dictionary.splice(i, 1);
		i--;
	}
}

/*for(var i = 0; i < google_data.length; i++){
//	if(i % 100 == 0){
		console.log(i/google_data.length);
//	}
	if(!dictionary.includes(google_data[i])){
		google_data.splice(i, 1);
		i--;
	}
}
dictionary = google_data;*/

function forget_word(word){
	dictionary.splice(dictionary.indexOf(word), 1);
}

function handle_key(event){
	puzzle[selection.x][selection.y] = String.fromCharCode(event.keyCode).toUpperCase();
	to_words(); draw_puzzle();
}

function handle_click(event){
	var mouseX = event.clientX-LINE_WIDTH;
	var mouseY = event.clientY-LINE_WIDTH;

	mouseX /= SQUARE_SIZE;
	mouseY /= SQUARE_SIZE;

	mouseX = Math.floor(mouseX);
	mouseY = Math.floor(mouseY);

	if(puzzle[mouseX][mouseY] == "" || puzzle[mouseX][mouseY] == "."){
		puzzle[mouseX][mouseY] = "*";
	}else{
		puzzle[mouseX][mouseY] = "";
	}

	selection.x = mouseX;
	selection.y = mouseY;

	to_words(); draw_puzzle();
}

function grep(stringReg){
	var regExp = new RegExp(stringReg.toLowerCase());

	solutions = [];
	
	for(var i = 0; i < dictionary.length; i++){
		if(dictionary[i].length == stringReg.length-2){
			var result = regExp.exec(dictionary[i]);
		
			if(result != "" && result != null){
				solutions.push(result[0]);
			}
		}
	}
	
	return solutions;
}

function create_puzzle(size){
	puzzle = [];
	for(var i = 0; i < size; i++){
		var column = [];
		for(var j = 0; j < size; j++){
			column.push("");
		}
		puzzle.push(column);
	}
	to_words(); draw_puzzle();
}

function empty_puzzle(){
	stop_solving = true;
	tree = [];
	window.setTimeout(function(){stop_solving = false;
	for(var i = 0; i < puzzle.length; i++){
		for(var j = 0; j < puzzle[0].length; j++){
			if(puzzle[i][j] != "*"){
				puzzle[i][j] = "";
			}
		}
	}
	to_words(); draw_puzzle();}, 250);
}

function word(coords, dir){
	var found_word = "";
	if(!dir){ //across
		for(var i = coords[0]; i < puzzle.length; i++){
			if(puzzle[i][coords[1]] == "*"){
				return found_word;
			}else if(puzzle[i][coords[1]] == ""){
				found_word = found_word.concat(".");
			}else{
				found_word = found_word.concat(puzzle[i][coords[1]]);
			}
		}
		return found_word;
	}else{ //down
		for(var i = coords[1]; i < puzzle[0].length; i++){
			if(puzzle[coords[0]][i] == "*"){
				return found_word;
			}else if(puzzle[coords[0]][i] == ""){
				found_word = found_word.concat(".");
			}else{
				found_word = found_word.concat(puzzle[coords[0]][i]);
			}
		}
		return found_word;
	}
}
	
function to_words(){
	clue_number_locations = [];
	words = [[], []];
	var has_clue;
	for(var j = 0; j < puzzle[0].length; j++){
		for(var i = 0; i < puzzle.length; i++){
			has_clue = false;

			//do_a_log("I:" + i + " and j:"  +j);
			//PARSING ACROSS
			if(typeof puzzle[i-1] === 'undefined'){
				var curr_word = word([i, j], 0);
				if(puzzle[i][j] != "*" && curr_word.length >= 3){
					words[0].push([curr_word, [i, j], 0]); //word, coordinate, poss. solutions for that word
					has_clue = true;
				}
			}else{
				if(puzzle[i-1][j] == "*"){
					var curr_word = word([i, j], 0);
					if(curr_word.length >= 3){
						words[0].push([curr_word, [i, j], 0]);
						has_clue = true;
					}
				}
			}
			
			//PARSING DOWN
			if(typeof puzzle[i][j-1] === 'undefined'){
				var curr_word = word([i, j], 1);
				if(puzzle[i][j] != "*" && curr_word.length >= 3){
					words[1].push([curr_word, [i, j], 0]);
					has_clue = true;
				}
			}else{
				if(puzzle[i][j-1] == "*"){
					var curr_word = word([i, j], 1);
					if(curr_word.length >= 3){
						words[1].push([curr_word, [i, j], 0]);
						has_clue = true;
					}
				}
			}

			if(has_clue){
				clue_number_locations.push([i, j]);
			}

		}
	}
}

function min_solutions(){
	var min_solutions = [450000, 0, 0]; //(across/down), word

	for(var i = 0; i < words[0].length; i++){
		if(words[0][i][0].includes(".")){ //need to fill some letters here
			if(grep("^"+words[0][i][0]+"$").length < min_solutions[0]){
				min_solutions[0] = grep("^"+words[0][i][0]+"$").length;
				min_solutions[1] = 0;
				min_solutions[2] = i;
			}
		}
	}

	for(var i = 0; i < words[1].length; i++){
		if(words[1][i][0].includes(".")){
			if(grep("^"+words[1][i][0]+"$").length < min_solutions[0]){
				min_solutions[0] = grep("^"+words[1][i][0]+"$").length;
				min_solutions[1] = 1; //words[1][i][1][0]
				min_solutions[2] = i; //words[1][i][1][1]
			}
		}
	}
	return min_solutions;
}

function add_word(word, coords, dir){ 
	if(!dir){ //across
		for(var i = 0; i < word.length; i++){
			puzzle[coords[0]+i][coords[1]] = word[i];
		}
	}else{ //down
		for(var i = 0; i < word.length; i++){
			puzzle[coords[0]][coords[1]+i] = word[i];
		}
	}

}


function next_word(i){
	to_words();

	var solutions = min_solutions();
	var possibilities = grep("^"+words[solutions[1]][solutions[2]][0]+"$");
	do_a_log(possibilities);
	if(possibilities.length != 0){
		if(i != 0){
			tree.splice(tree.length-1, 1);
		}
		//do_a_log("Tried Word: [" + possibilities[i].toUpperCase() + "]");
		tree.push([words[solutions[1]][solutions[2]][0], words[solutions[1]][solutions[2]][1], i, possibilities.length, solutions[1]]);
		add_word(possibilities[i].toUpperCase(), words[solutions[1]][solutions[2]][1], solutions[1]);
		
	}else{
		backtrack();
	}
}

function is_filled(word){
	if(word.indexOf(".") == -1){
		if(word.indexOf(" ") == -1){
			return true;
		}
	}
	return false;
}

function check_word(dir){ //dir is direction of WORD, so we check the other direction
	to_words();
	for(var i = 0; i < words[0].length; i++){
		for(var j = 0; j < words[0].length; j++){
			var word_one = words[0][i][0];
			var word_two = words[0][j][0];
			if(i != j && is_filled(word_one) && is_filled(word_two)){
				if(word_one == word_two){
					return false;
				}
			}
		}
		for(var j = 0; j < words[1].length; j++){
			var word_one = words[0][i][0];
			var word_two = words[1][j][0];
			if(is_filled(word_one) && is_filled(word_two)){
				if(word_one == word_two){
					return false;
				}
			}
		}
	}
	for(var i = 0; i < words[1].length; i++){
		for(var j = 0; j < words[0].length; j++){
			var word_one = words[1][i][0];
			var word_two = words[0][j][0];
			if(is_filled(word_one) && is_filled(word_two)){
				if(word_one == word_two){
					return false;
				}
			}
		}
		for(var j = 0; j < words[1].length; j++){
			var word_one = words[1][i][0];
			var word_two = words[1][j][0];
			if(i != j && is_filled(word_one) && is_filled(word_two)){
				if(word_one == word_two){
					return false;
				}
			}
		}
	}
	if(!dir){ //across
		//we want to check down
		for(var i = 0; i < words[1].length; i++){
			if(!is_word(words[1][i][0])){
				return false;
			}
		}
		return true;
	}else{ //down
		for(var i = 0; i < words[0].length; i++){
				if(!is_word(words[0][i][0])){
					return false;
				}
			}
		return true;
	}
}

function is_word(word){
	return (grep("^"+word+"$") != 0);
}

function p_to_s(word){
	var new_word = "";
	for(var i = 0; i < word.length; i++){
		if(word[i] == "."){
			new_word = new_word + ".";
		}else{
			new_word = new_word + word[i];
		}
	}
	return new_word;
}

function backtrack(){
	to_words();

	add_word(p_to_s(tree[tree.length-1][0]), tree[tree.length-1][1], tree[tree.length-1][4]); //remove old char
	tree[tree.length-1][2]++;

	//if(tree[tree.length-1][2] == tree[tree.length-1][3]){ //we've tried everything for this word, we have to go farther back
	//	tree.splice(tree.length-1, 1);
	//	backtrack();
	//}
	//to_words(); draw_puzzle();
}

//window.setInterval(function(){to_words(); draw_puzzle();}, 2500);

function do_a_log(text){
	if(logs_on){
		do_a_log(text);
	}
}

function solve_crossword(counter){
	//do_a_log(min_solutions()[0]);
	//draw_puzzle();
		//do_a_log(tree.length);
		to_words();
		next_word(counter);
		do_a_log("next_word("+counter+")");
		if(min_solutions()[0] != 450000){
			do_a_log("Tree length: " + tree.length + " check_word("+tree[tree.length-1][4]+") --> " + check_word(tree[tree.length-1][4]));
			//do_a_log(tree[tree.length-1]);
			//do_a_log(puzzle[0][2]);
			if(check_word(tree[tree.length-1][4])){
				if(!stop_solving){window.setTimeout(function(){to_words(); solve_crossword(0);}, 0);}
				do_a_log("solve_crossword(0); draw_puzzle();");
				draw_puzzle();
			}else{
				if(!stop_solving){
				backtrack();
				do_a_log("backtrack();");
				window.setTimeout(function(){to_words(); solve_crossword(prune());}, 0);
				do_a_log("solve_crossword(prune())");
				}
			}
		}
}

function prune(){
	var counter = tree[tree.length-1][2];
	//do_a_log("COUNTER: " + counter);
	if((counter/tree[tree.length-1][3]) >= PATIENCE){
		tree.splice(tree.length-1, 1);
		backtrack();
		return prune();
	}else{
		//do_a_log("HEY");
		return counter;
	}
}

function continue_puzzle(){ //continue completed puzzle
	puzzles.push([puzzle, 0]);
	backtrack();
	to_words();
	solve_crossword(prune());
}

