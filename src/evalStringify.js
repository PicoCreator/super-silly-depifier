/**
 * Static Class: evalStringify
 * 
 * Takes in the js / ast string, and output the eval format
 */

//------------------------------------------
//
// Dependencies
//
//------------------------------------------

const astUtil = require("./astUtil.js");
const stmtUtil = require("./stmtUtil.js");

//------------------------------------------
//
// Function implementation
//
//------------------------------------------

function ast_to_codelineArr(ast, codelineArr) {

	// Initialize codelineArr if null
	if(codelineArr == null) {
		codelineArr = [];
	}

	// Takes in the ast o
}