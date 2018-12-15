
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

const { execSync } = require('child_process');

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
 * Triggers npm publish on the given path
 * @param {*} mod_path 
 */
function npm_publish(mod_path) {
	console.log("==============================================");
	console.log("= Uploading : "+path.basename(mod_path));
	console.log("==============================================");
	let child = execSync("npm publish --access public", {
		cwd : mod_path
	});

	if( child.error || child.stdout || child.stderr ) {
		console.log('error', child.error);
		console.log('stdout ', child.stdout);
		console.log('stderr ', child.stderr);
	}
}


/**
 * Given the fs directory, find all directories and upload as node modules
 * @param {*} source 
 */
function upload_nodeModules(source, namespace) {
	let module_paths = getDirectories(source);
	console.log("==============================================");
	console.log("= Total dependency count : "+module_paths.length);
	console.log("==============================================");
	for(let i = 0; i < module_paths.length; ++i) {
		// Get current module path
		let mod_path = path.resolve(module_paths[i]);
		let basename = path.basename(mod_path);

		// Build the package json
		let package_json = {};
		Object.assign(package_json, blank_package_format);
		package_json.name = namespace+"/"+basename;
		package_json.version = "1.0."+((new Date()).getTime());
		
		// Write the package json file
		fs.writeFileSync(mod_path+"/package.json", JSON.stringify(package_json));
		
		// And publish it
		npm_publish(mod_path);
		
	}
}

function upload_outputFolder(source, namespace, proj_file) {
	
}


//------------------------------------------
//
// Exported "static class"
//
//------------------------------------------
module.exports = {
	upload_nodeModules: upload_nodeModules
};
