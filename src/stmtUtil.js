/**
 * Static Class: stmtUtil
 * 
 * Utility library to process statments ast, and stuff
 */

//------------------------------------------
//
// Dependencies
//
//------------------------------------------
const md5 = require("md5");

//------------------------------------------
//
// Function implementation
//
//------------------------------------------

function str_to_label(stmt) {
	const trim_stmt = stmt.trim();
	const label = stmt.join('')
		.replace(new RegExp(' ', 'g'), '_')
		.replace(new RegExp(';', 'g'), '')
		.replace(new RegExp('\n', 'g'), '')
		.replace(new RegExp('=', 'g'), 'equals')
		.replace(new RegExp('\\+', 'g'), 'plus')
		.replace(new RegExp('-', 'g'), 'minus')
		.replace(new RegExp('\\*', 'g'), 'times')
		.replace(new RegExp('/', 'g'), 'divide')
		.replace(new RegExp('%', 'g'), 'percent')
		.replace(new RegExp(',', 'g'), 'comma');
	return label + md5(trim_stmt);
}

//------------------------------------------
//
// Exported "static class"
//
//------------------------------------------
module.exports = {
	str_to_label: str_to_label
};
