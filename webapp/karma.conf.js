module.exports = function(config){
    config.set({

        basePath : './',

        files: [
            'app/bower_components/jquery/dist/jquery.min.js',
            'app/bower_components/bootstrap/dist/js/bootstrap.min.js',
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-route/angular-route.js',
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/bower_components/moment/min/moment.min.js',
            'app/bower_components/angular-ui-router/release/angular-ui-router.min.js',
            'app/bower_components/angular-ui-calendar/src/calendar.js',
            'app/bower_components/fullcalendar/dist/fullcalendar.min.js',
            'app/bower_components/fullcalendar/dist/lang-all.js',
            'app/bower_components/fullcalendar/dist/gcal.js',
            'app/bower_components/angular-animate/angular-animate.min.js',
            'app/bower_components/angular-sanitize/angular-sanitize.min.js',
            'app/bower_components/angular-strap/dist/angular-strap.min.js',
            'app/bower_components/angular-strap/dist/angular-strap.tpl.min.js',
            'app/bower_components/angular-wysiwyg/dist/angular-wysiwyg.min.js',
            'app/bower_components/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.min.js',
            'app/bower_components/handlebars/handlebars.min.js',

            'app/angularApp.js',

            'test/*.js',

            'app/js/controllers/*.js',
            'app/js/services/services.js',
            'app/js/directives/directive.js'
        ],

        autoWatch : true,

        frameworks: [ 'jasmine' ],

        reporters: ['progress'],

        browsers : [ 'Chrome', 'Firefox' ],

        hostname: 'localhost',

        port: 9876,

        plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
        ],

        junitReporter : {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
