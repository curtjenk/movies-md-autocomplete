var movieApp = angular.module('movieApp', ['ngMaterial']);
//add  "check-image" (without quotes) attribute to the img element
movieApp.directive('checkImage', function ($http) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			attrs.$observe('ngSrc', function (ngSrc) {
				$http.get(ngSrc).success(function () {
					// alert('image exists');
				}).error(function () {
					// alert('image does not exist');
					element.attr('src', 'img/placeholder.png'); // set default image
				});
			});
		}
	};
});

movieApp.controller('movieController', function ($scope, $q, $http, $log, api) {

	// $scope.imagesArr = [];
	$scope.imageURL = 'http://image.tmdb.org/t/p/w300';
	api.nowPlaying().then(function (res) {
    //console.log(res);
		$scope.dataResults = res.data;
		// initializeIsotope();
	});

	$scope.querySearch = querySearch;
	$scope.selectedItemChange = selectedItemChange;
	//$scope.searchTextChange = searchTextChange;

	function querySearch(term) {
		// console.log("called querySearch");
		var deferred = $q.defer();
		var p1 = api.movieSearch(term);
		var p2 = api.personSearch(term);
		$q.all([p1, p2]).then(function (values) {
			var list = [];
      // console.log(term);
			// console.log(values[0].data);
			// console.log(values[1].data);

			//the api is bringing back stuff that doesn't even partially match.  Filter out this stuff
			for (var x = 0; x < values[0].data.length; x++) {
				if (values[0].data[x].title.toLowerCase().indexOf(term.toLowerCase()) > -1) {
					list.push(values[0].data[x]);
				}
			}
			for (var y = 0; y < values[1].data.length; y++) {
				if (values[1].data[y].title.toLowerCase().indexOf(term.toLowerCase()) > -1) {
					list.push(values[1].data[y]);
				}
			}
			list.sort(function (a, b) {
				if (a.title < b.title) return -1; //sort ascending
				if (a.title > b.title) return 1;
				return 0;
			});

			console.log(list);
			deferred.resolve(list);
		});

		return deferred.promise;
	}

	function searchTextChange(text) {
		$log.info('Text changed to ' + text);
	}

	function selectedItemChange(item) {
		$log.info('Selected Item changed to ' + JSON.stringify(item));
    //check type.  if "movie" query movie by id.  If person, query person by id
		//display in the
		$scope.dataResults = res.data;
	}

	// $scope.dataResults = [];

	// function initializeIsotope() {
	//
	// 	var theGrid = $('.grid').isotope({
	// 		// options
	// 		itemSelector: '.grid-item',
	// 		layoutMode: 'masonry'
	// 	});
	//
	// 	theGrid.imagesLoaded().progress(function () {
	// 		theGrid.isotope('layout');
	// 	});
	// }

});



movieApp.factory('api', function ($http, $q) {
	var api = {};
	var baseURL = 'https://api.themoviedb.org/3/';
	var methodNowPlaying = 'movie/now_playing';
	var apiKey = 'api_key=2d9e9aacbdc397236dad8339b3d2c17c';
	var methodSearchMovie = 'search/movie?query=';
	var methodSearchPerson = 'search/person?search_type=ngram&query=';
	var methodSearchMulti = 'search/multi?include_adult=false&search_type=ngram&query=';

	var URL_NOW_PLAYING = encodeURI(baseURL + methodNowPlaying + '?' + apiKey);

	var curPageNo = 1;

	api.personSearch = function (term) {
		var rtn = {};
		var promise = $http.get(encodeURI(baseURL + methodSearchPerson + term + '&' + apiKey)).then(
			function (res) {
				rtn.status = 'success';
				rtn.data = [];
				for (var i = 0; i < res.data.results.length; i++) {
					rtn.data.push({
						'title': res.data.results[i].name,
						'id': res.data.results[i].id,
						'type': 'Person'
					});
				}
				return rtn;
			},
			function (error) {
				rtn.status = 'fail';
				rtn.data = [];
				return rtn;
			});
		return promise;
	};

	api.movieSearch = function (term) {
		var rtn = {};
		var promise = $http.get(encodeURI(baseURL + methodSearchMovie + term + '&' + apiKey)).then(
			function (res) {
				// console.log(" --- api  --");
				// console.log(res);
				rtn.status = 'success';
				rtn.data = [];
				for (var i = 0; i < res.data.results.length; i++) {
					rtn.data.push({
						'title': res.data.results[i].title,
						'id': res.data.results[i].id,
						'type': 'Movie'
					});
				}
				// console.log(rtn);
				// console.log(" --- api end  --");
				return rtn;
			},
			function (error) {
				rtn.status = 'fail';
				rtn.data = [];
				return rtn;
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
