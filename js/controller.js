var movieApp = angular.module('movieApp', ['ngMaterial']);
movieApp.controller('movieController', function ($scope, $q, $http, api) {

	// $scope.imagesArr = [];
	$scope.imageURL = 'http://image.tmdb.org/t/p/w300';
	api.nowPlaying().then(function (res) {
		console.log(res);
		$scope.dataResults = res.data;
		initializeIsotope();
	});

	$scope.querySearch = querySearch;

	function querySearch(term) {
		// console.log("called querySearch");
		var deferred = $q.defer();
		api.movieSearch(term).then(function (res) {
			if (res.status == 'success') {
        // console.log(res.data);
				deferred.resolve(res.data);
			} else {
				deferred.resolve([]);
			}
		});
		return deferred.promise;
	}

	// $scope.dataResults = [];

	function initializeIsotope() {

		var theGrid = $('.grid').isotope({
			// options
			itemSelector: '.grid-item',
			layoutMode: 'masonry'
		});

		// theGrid.imagesLoaded().progress(function() {
		//     theGrid.isotope('layout');
		// });
	}

});

movieApp.factory('api', function ($http) {
	var api = {};
	var baseURL = 'https://api.themoviedb.org/3/';
	var methodNowPlaying = 'movie/now_playing';
	var apiKey = 'api_key=2d9e9aacbdc397236dad8339b3d2c17c';
	var methodSearchMovie = 'search/movie?query=';
	var methodSearchPerson = 'search/person?query=';

	var URL_NOW_PLAYING = encodeURI(baseURL + methodNowPlaying + '?' + apiKey);

	var curPageNo = 1;

	api.movieSearch = function (term) {
		var rtn = {};
		var promise = $http.get(encodeURI(baseURL + methodSearchMovie + term + '&' + apiKey)).then(
			function (res) {
				console.log(" --- api  --");
        console.log(res);
				rtn.status = 'success';
				rtn.data = [];
				for (var i = 0; i < res.data.results.length; i++) {
					rtn.data.push( {'title':res.data.results[i].title, 'id': res.data.results[i].id});
				}
        	console.log(rtn);
				console.log(" --- api end  --");

				return rtn;
			},
			function (error) {
				// rtn.status = 'fail';
				// rtn.data = error;
				// curPageNo = 0;
				// return rtn;
			});
		return promise;
	};

	api.nowPlaying = function (next) {
		var rtn = {};
		var promise = $http.get(URL_NOW_PLAYING).then(
			function (res) {
				// console.log(" --- api  --");
				// console.log(res);
				rtn.status = 'success';
				rtn.data = res.data.results;
				rtn.page = res.data.page;
				// console.log(" --- api end  --");
				return rtn;
			},
			function (error) {
				rtn.status = 'fail';
				rtn.data = error;
				curPageNo = 0;
				return rtn;
			});
		return promise;
	};


	return api;
});
