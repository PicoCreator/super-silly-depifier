
/**
 * Static Class: npmUpload
 * 
 * NPM uploading tool, for stuff
 */

//------------------------------------------
//
// Dependencies
//
//------------------------------------------

const fs = require("fs");
const path = require("path");

/**
 * Blank package.json format, used to generate node_modules package.json
 */
const blank_package_format = {
	"name": "",
	"version": "",
	"description": "",
	"main": "index.js",
	"scripts": {
	  "test": "echo \"Error: no test specified\" && exit 1"
	},
	"author": "",
	"license": ""
}; 

//------------------------------------------
//
// Utility library for FS
//
//------------------------------------------

/**
 * Given an fs path, return true if its a directory
 * @param {*} source 
 */
function isDirectory(source) {
	return fs.lstatSync(source).isDirectory();
}

/**
 * Given the fs directory, return all directory path in it
 * @param {*} source 
 */
function getDirectories(source) {
	return fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory)
}




/**
 * Given the fs directory, find all directories and upload as node modules
 * @param {*} source 
 */
function upload_nodeModules(source) {
	let module_paths = getDirectories(source);
	for(let i = 0; i < module_paths.length; ++i) {
		// Get current module path
		let mod_path = module_paths[i];
		let basename = path.basename(mod_path);

		// Build the package json
		let package_json = {};
		Object.assign(package_json, blank_package_format);
		package_json.name = basename;
		package_json.version = "1.0."+((new Date()).getTime());
		
		// Write the package json file
		fs.writeFileSync(mod_path+"/package.json", JSON.stringify(package_json));
		
	}
}


//------------------------------------------
//
// Exported "static class"
//
//------------------------------------------
module.exports = {
	upload_nodeModules: upload_nodeModules
};
