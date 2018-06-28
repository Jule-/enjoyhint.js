module.exports = function(grunt) {
    require("load-grunt-tasks")(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            folder: ["tmp/"]
        },
        babel: {
            options: {
                sourceMap: false
            },
            dist: {
                files: {
                    "tmp/enjoyhint.js": "src/enjoyhint.js",
                    "tmp/jquery.enjoyhint.js": "src/jquery.enjoyhint.js"
                }
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['tmp/*.js'],
                dest: 'dist/enjoyhint.js'
            }
        },
        copy: {
            main: {
                files: [
                    { expand: true, flatten: true, src: ['tmp/*.map'], dest: 'dist/', filter: 'isFile' }
                ]
            }
        },
        cssmin: {
            combine: {
                files: {
                    'dist/enjoyhint.css': ['src/jquery.enjoyhint.css']
                }
            }
        }
    });

    // grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask("default", ["babel", "concat", "copy", "cssmin", "clean"]);
};