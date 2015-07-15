/**
 * Created by Gabi on 15/06/2015.
 */

describe('[TEST] AuthController', function () {
    'use strict';

    var AuthController,
        scope;

    beforeEach(module('readIt'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        AuthController = $controller('AuthController', {
            $scope : scope
        });
    }));

    it('AuthCtrl should be defined', function () {
        expect(scope.auth).toBeDefined();
    });
});