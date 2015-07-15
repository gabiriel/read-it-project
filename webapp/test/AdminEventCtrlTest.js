/**
 * Created by Gabi on 27/06/2015.
 */

describe('[TEST] AdminEventController', function () {
    'use strict';

    var AdminEventController,
        scope;

    beforeEach(module('readIt'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        AdminEventController = $controller('AdminEventController', {
            $scope : scope
        });
    }));

    it('AdminEventCtrl should be defined', function () {
        expect(scope.events).toBeDefined();
    });
});