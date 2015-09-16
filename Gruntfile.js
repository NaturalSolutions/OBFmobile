module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            options: {
                browserify: true,
                browser: true,
                devel: true
            },
            all: [
                'Gruntfile.js',
                'www/modules/**/*.js',
            ]
        },
        watch: {
            options: {
                livereload: true,
                spawn: false
            },
            configFiles: {
                files: ['Gruntfile.js'],
                tasks: ['build'],
                options: {
                    reload: true
                }
            },
            js: {
                files: [
                    'www/modules/**/*.js',
                    'www/vendor/**/*'
                ],
                tasks: ['build']
            },
            tpl: {
                files: [
                    'www/modules/**/*.html'
                ],
                tasks: ['browserify:dev']
            },
            css: {
                // files: [
                //     'www/css/page-container.css',
                //     'www/vendor/bootstrap-dialog/css/bootstrap-dialog.css',
                    //'www/js/**/*.css',
                //     'www/css/general.css',
                // ],
                // tasks: ['cssmin']
                files: ['www/modules/**/*.less', 'www/less/*'],
                tasks: ['less']
            },
        },
        // cssmin: {
        //     options: {
        //         sourceMap: true,
        //         roundingPrecision: -1
        //     },
        //     target: {
        //         files: {
        //             'www/css/index.css': [
        //                 './node_modules/bootstrap-slider/css/bootstrap-slider.css',
        //                 './node_modules/bootstrap/dist/css/bootstrap.min.css',
        //                 './node_modules/planet-maps/dist/ol.css',
        //                 './node_modules/swiper/dist/css/swiper.min.css',
        //                 './www/vendor/bootstrap-dialog/css/bootstrap-dialog.css',
        //                 './www/css/general.css',
        //                 './www/css/page-container.css',
        //                 './www/js/**/*.css'
        //             ]
        //         }
        //     }
        // },
        less: {
            dist: {
                files: {
                    'www/style.css': 'www/modules/main/_style.less'
                },
                options: {
                    compress: false,
                    sourceMap: true,
                    sourceMapFilename: 'www/style.css.map',
                    sourceMapURL: 'style.css.map'
                }
            }
        },
        connect: {
            server: {
                options: {
                    base: 'www',
                    open: true,
                    livereload: true
                }
            }
        },
        browserify: {
            dev: {
                src: ['www/modules/**/*.js'],
                dest: 'www/index.js',
                options: {
                    browserifyOptions: {
                        debug: true // Enable (inline) source map
                    }
                }
            },
            options: {
                transform: [
                    ['node-underscorify', {
                        templateSettings: {variable: 'data'},
                        requires: [
                            {variable: '_', module: 'lodash'},
                            {variable: 'i18n', module: 'i18next-client'}
                        ]
                    }]
                ]
            }
        },
        copy: {
            fonts: {
                expand: true,
                src: ['./node_modules/bootstrap/fonts/*'],
                dest: 'www/fonts/',
                filter: 'isFile',
                flatten: true
            },
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('build', ['jshint', 'less', 'browserify:dev','copy']);
    grunt.registerTask('dev', ['build', 'connect', 'watch']);
    grunt.registerTask('default', ['build']);
};

/* TODO:
 * - uglify (prod uniquement)
 * - remplacer connect par ripple et enlever le test "if (window.cordova)" dans init.js
 */
