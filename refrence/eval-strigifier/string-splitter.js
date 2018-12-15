/**
 * Split a string, into an array of string lines
 * @param {String} str 
 */
function str_line_split(str) {
	return str.split("\n");
}

/**
 * Convert an array of strings, into its
 * codelineObjectArray representation
 */
function strArr_to_codelineObjectArray(strArr) {
	// Final return array
	let ret = [];

	// Iterate every line one by one
	for(let i=0; i<strArr.length; ++i) {

		ret.push({
			"type" : "raw-str",
			"value": strArr[i]
		});
	}
	return ret;
}


/**
 * Takes in an array of strings, and the position to scan from,
 * if a multiline syntax is detected merge it together and udpate the offset.
 * 
 * @param {Array} strArr to scan from
 * @param {Number}  idx index to scan from
 * 
 * @return {Object} { "value" : "merged strings", "next-idx" : N }
 */
function codeline_to_codelineObject(strArr, idx) {

	// String line to start from
	let strLine = strArr[idx];

	// Return
}