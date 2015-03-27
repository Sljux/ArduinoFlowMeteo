"use strict";

angular.module('meteoApp', ['ngRoute', 'ngMaterial', 'btford.socket-io'])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
            $routeProvider.
                when('/', {
                    templateUrl: 'partials/main.html',
                    controller: 'MainCtrl'
                }).
                otherwise({
                    redirectTo: '/'
                });

            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });
        }
    ])
    .run(['FlowSocket', function (FlowSocket) {}])
    .factory('FlowSocket', ['socketFactory', function (socketFactory) {
        var flowSocket = socketFactory();
        flowSocket.forward('drop');
        return flowSocket;
    }])
    .controller('MainCtrl', ['$scope', '$interval', function ($scope, $interval) {
        $scope.isBootstraped = false;

        var refresh = $interval(null, 60);

        $scope.$on('$destroy', function () {
            $interval.cancel(refresh);
        });

        $scope.$on('socket:drop', function (e, drop) {
            $scope.isBootstraped = true;

            $scope.inside = drop.data.inside;
            $scope.outside = drop.data.outside;
            $scope.readingTime = moment(drop.time);
        });
    }]);