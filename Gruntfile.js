module.exports = function(grunt) {
	grunt.initConfig({

		/*==========  Watch Tasks  ==========*/
		watch: {
			options: {
				nospawn: true,
				livereload: true
			},
			configFiles: {
				files: [ 'Gruntfile.js'],
				tasks: ['build'],
				options: {
					reload: true
				}
			},
			jst: {
				files: [
					'www/app/**/*.html'
				],
				tasks: ['jst']
			},
			css: {
				files: 'www/app/styles/**/*.less',
				tasks: ['less']
			},
			livereload: {
				files: [
					'www/*.html',
					'www/app/styles/**/*.css',
					'www/app/**/*.js',
				]
			}
		},
		connect: {
            server: {
                options: {
                    base: './',
                    open: true,
                    livereload: true
                }
            }
        },
		less: {
			dist: {
				files: {
					'www/app/styles/main.css': 'www/app/styles/main.less'
				},
				options: {
					compress: false,
					sourceMap: true,
					sourceMapFilename: 'www/app/styles/main.css.map',
					sourceMapURL: 'main.css.map'
				}
			}
		},
		autoprefixer: {
			dist: {
				files: {
					'www/app/styles/main.css': 'app/styles/main.css'
				}
			}
		},
		jst: {
			compile: {
				files: {
					'build/templates.js': ['www/app/**/*.html']
				}
			}
		},
		requirejs: {
			compile: {
				options: {
					findNestedDependencies: false,
					baseUrl: 'www/app',
					mainConfigFile: 'www/app/main.js',
					include: 'main',
					//name: '../bower_components/almond/almond',
					name: '../bower_components/requirejs/require',
					out: './build/prod.js',
					//optimize : 'none',

					done: function(done, output) {
					var duplicates = require('rjs-build-analysis').duplicates(output);
					
					if (duplicates.length > 0) {
						grunt.log.subhead('Duplicates found in requirejs build:');
						grunt.log.warn(duplicates);
						done(new Error('r.js built duplicate modules, please check the excludes option.'));
					}
					
					done();
					}
				}
			}
		},
		// jasmine: {
		// 	all:{
		// 		src : 'www/app/modules/{,*/}*.js',
		// 		options: {
		// 			keepRunner: true,
		// 			specs : 'www/test/**/*.js',
		// 			vendor : [
		// 				'www/bower_components/jquery/dist/jquery.js',
		// 				'www/bower_components/underscore/underscore.js',
		// 				'www/bower_components/backbone/backbone.js',
		// 				'www/bower_components/marionette/lib/core/backbone.marionette.js',
		// 				'www/bower_components/backbone.babysitter/lib/backbone.babysitter.js',
		// 				'www/bower_components/backbone.wreqr/lib/backbone.wreqr.js',
		// 				'www/bower_components/bootstrap/dist/js/bootstrap.js',      
		// 			]
		// 		}
		// 	}
		// }, 

		/*==========  Build Tasks  ==========*/
		clean: {
			dist: ['build'],
		},
		jshint: {
			all: [
				'Gruntfile.js',
				'www/app/**/*.js',
			]
		},
		fileblocks: {
			options: {
				templates: {
					'js': '<script data-main="app/main" src="${file}"></script>',
				},
				removeFiles : true
			},
			prod: {
				src: 'build/index.html',
				blocks: {
					'app': { src: 'prod.js', cwd: 'build' }
				}
			},
			develop: {
				src: 'www/index.html',
				blocks: {
					'app': { src: 'bower_components/requirejs/require.js',cwd: 'www' }
				}
			},
		},

		copy:{
			main:{
				files: [
					{expand: true, flatten: true, src: ['www/index.html'], dest: 'build/', filter: 'isFile'},
					{expand: true, flatten: true, src: ['www/app/styles/main.css'], dest: 'build/app/styles', filter: 'isFile'},
					{expand: true, flatten: true, src: ['www/bower_components/bootstrap/fonts/*'], dest: 'build/bower_components/bootstrap/fonts/',filter: 'isFile'},
					{expand: true, flatten: true, src: ['www/app/locales/dev/*'], dest: 'build/app/locales/dev/',filter: 'isFile'},
					{expand: true, flatten: true, src: ['www/app/locales/en/*'], dest: 'build/app/locales/en/',filter: 'isFile'},
					{expand: true, flatten: true, src: ['www/app/locales/fr/*'], dest: 'build/app/locales/fr/',filter: 'isFile'},
					{expand: true, flatten: true, src: ['www/app/styles/img/*'], dest: 'build/app/styles/img/',filter: 'isFile'},
				],
			},
		},
		rename:{
			main: {
				files: [
					{src: ['www'], dest: ['www-dev']},
					{src: ['build'], dest: ['www']},
				]
			}
		},

	});


	/*==========  Loaded Tasks  ==========*/

	grunt.loadNpmTasks('grunt-requirejs');

	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.loadNpmTasks('grunt-contrib-jasmine');

	grunt.loadNpmTasks('grunt-contrib-jst');

	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.loadNpmTasks('grunt-file-blocks');

	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.loadNpmTasks('grunt-contrib-rename');

	grunt.loadNpmTasks('grunt-contrib-connect');


	/*==========  Regitred Tasks  ==========*/

	grunt.registerTask('build', [
		//'jshint',
		'clean:dist',
		'jst',
		'less',
		'requirejs',
		//'jasmine'
	]);

	grunt.registerTask('dev', ['build', 'fileblocks:develop', 'connect', 'watch']);

	grunt.registerTask('release', ['build', 'copy','fileblocks:prod',/*,'rename'*/]);
};
//TODO : connect without errors (timeout modules) or 404 templates.js 
