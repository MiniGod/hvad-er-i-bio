
//
// ======================= HELPING FUNCTIONS ===========================
// 


// Change number with point (20.5) to human readable string (20:30):
var numToTime = function (number) {
	var parts = number.split('.');
	if (parts.length === 1 || parseInt(parts[1], 10) === 0) return number + ':00';
	minutes = Math.round(parseFloat('0.' + parts[1])*60).toString();
	if (minutes.length === 1) minutes = '0' + minutes;
	return parts[0] + ':' + minutes;
};


// Change human readable (20:30) time to number with point (20.5) as string:
var timeToNum = function (time) {
	var parts = time.split(':');
	return parts[0] + (parseInt(parts[1], 10)/60 + '').substring(1);
};


var closeArticleExtra = function (article) {
	article.removeClass('open');
	article.find('.more').text('Sjá meira');
	article.find('.extra').slideUp(300);
};

var openArticleExtra = function (article) {
	article.addClass('open');
	article.find('.more').text('Sjá minna');
	article.find('.extra').slideDown(300);
	$('html,body').clearQueue();
	$('html,body').animate({ scrollTop: $(article).offset().top}, 400);
};



//
// ========================= MAIN FUNCTIONS ============================
// 


// ======== BASE STUFF ========

// An object containing all info for the filtering:
var movies = {};
var places = {};

// Mark movies with highest and lowest showtimes:
var populateMoviesObject = function () {

	movies.lowestShowtime = 24;
	movies.highestShowtime = 0;
	movies.titles = {};
	// Populate the 'movies' with movies:
	$('.movie').each(function () {
		var movieElm = $(this);
		var id = movieElm.data('id');
		movies.titles[id] = {};
		var movie = movies.titles[id];
		movie.isFiltered = false;
		var rating = parseFloat(movieElm.find('.rating').text().split('Ein')[0]);
		movie.rating = (rating !== '') ? rating : '10';
		movie.places = {};

		// For each movie object, add the showplaces:
		movieElm.find('.showplace').each(function () {
			var placeElm = $(this);
			var placeStr = placeElm.data('place');
			if (!(placeStr in places)) places[placeStr] = true;
			movie.places[placeStr] = {};
			var place = movie.places[placeStr];

			// For each showplace array, add the time:
			placeElm.find('li').each(function () {
				var time = timeToNum($(this).data('time'));
				place[time] = 'visible';

				// Recalculate lowest and highest showtime:
				if (time < movies.lowestShowtime) movies.lowestShowtime = time;
				if (time > movies.highestShowtime) movies.highestShowtime = time;
			});
		});
	});
};


// ======== FILTERING FUNCTIONS ========

// Mark movies with highest and lowest showtimes:
var filterMoviesByTime = function (lowFilter, highFilter) {
	for (var id in movies.titles) {
		var hasTime = false;

		// Check if movie has any time that passes the filter:
		var places = movies.titles[id].places;
		for (var placeKey in places) {
			var place = places[placeKey];
			for (var time in place) {
				if (lowFilter <= time && time <= highFilter) {
					hasTime = true;
					place[time] = 'visible';
				}
				else { place[time] = 'filtered'; }
			}
		}

		if (!hasTime) movies.titles[id].isFiltered = true;
	}
};

var filterMoviesByRating = function (minRating) {
	for (var id in movies.titles) {
		if (movies.titles[id].rating < minRating) {
			movies.titles[id].isFiltered = true;
		}
	}
};

var filterMoviesByPlace = function (placesAllowed) {
	if ($.isEmptyObject(placesAllowed)) return;
	for (var id in movies.titles) {
		var hasPlace = false;
		
		// Check if movie has any place that passes the filter:
		var places = movies.titles[id].places;
		for (var place in places) {
			if (place in placesAllowed) {
				hasPlace = true;
				break;
			}
		}

		if (!hasPlace) movies.titles[id].isFiltered = true;
	}
};

var filterMoviesByText = function (text) {
	if (text === '') return;

	for (var id in movies.titles) {
		if (id.toLowerCase().indexOf(text) === -1) 
			movies.titles[id].isFiltered = true;
	}
};

var filterMovies = function () {
	// Start unfiltering every movie:
	for (var id in movies.titles) {
		movies.titles[id].isFiltered = false;
	}

	// Now apply the filters:
	filterMoviesByTime($('#from-time').val(), $('#to-time').val());
	filterMoviesByRating($('#rating-range').val());
	filterMoviesByPlace(getToggledPlaces());
	filterMoviesByText($('#text-filter').val().toLowerCase());

	// Hide and show movies based on filtering:
	$('.movie').each(function () {
		var movieElm = $(this);
		var id = movieElm.data('id');
		if (movies.titles[id].isFiltered) {
			movieElm.slideUp();
			closeArticleExtra(movieElm);
		}
		else {

			movieElm.find('.showplace').each(function () {
				var place = $(this).data('place');
				$(this).find('li').each(function () {
					var time = timeToNum($(this).data('time'));
					if (movies.titles[id].places[place][time] === 'visible') {
						$(this).removeClass('filtered');
					}
					else {
						$(this).addClass('filtered');
					}
				});
			}); 

			movieElm.slideDown();
		}
	});
};


// ======== FILTER INITIATION ========

var limitTimeRange = function() {
	$('#to-time, #from-time').attr('min', movies.lowestShowtime);
	$('#to-time, #from-time').attr('max', movies.highestShowtime);
	$('.time-range .from').text(numToTime(movies.lowestShowtime));
	$('.time-range .to').text(numToTime(movies.highestShowtime));
};

var initPlaceFilter = function () {
	var placeFilterList = $('.place-filter ul');
	for (var place in places) {
		placeFilterList.append('<li>' +  place + '</li>');
	}

	$('.place-filter li').on('click', function () {
		$(this).toggleClass('toggled', !$(this).is('.toggled'));
		filterMovies();
	});
};

var getToggledPlaces = function () {
	var places = {};
	$('.place-filter li').each(function () {
		if ($(this).is('.toggled')) {
			places[$(this).text()] = true;
		}
	});
	return places;
};

var updateRangemark = function (range) {
	// Compersate for thumb width:
	var width = range.width()-20;
	var newPoint = (range.val()-range.attr("min")) / (range.attr("max")-range.attr("min"));
	// Compersate for thumb width and slider padding:
	var offset = 10;
	// Prevent mark from going beyond left or right (unsupported browsers):
	if (newPoint < 0) { newPlace = 0; }
	else if (newPoint > 1) { newPlace = width; }
	else { newPlace = width * newPoint + offset; offset -= newPoint; }

	range.next('output').css('left', newPlace);
};

var updateTimeRangeMarks = function () {

	// Keep from_time lower than to_time and the other way around:
	var fromTime = $('#from-time').val();
	var toTime = $('#to-time').val();
	if (fromTime >= toTime) { $('#to-time').val(parseFloat(fromTime)); }
	if (toTime <= fromTime) { $('#from-time').val(parseFloat(toTime)); }

	// Update position and value of rangemarks:
	$('#to-time, #from-time').each(function () {
		var range = $(this);
		updateRangemark(range);
		range.next('output').text(numToTime(range.val()));
	});
};

var activateRangeSliders = function () {

	// On time range change:
	$('#to-time, #from-time').on('change', function() {
		filterMovies();
		updateTimeRangeMarks();	
	});

	// On rating range change:
	$('#rating-range').on('change', function () {
		var range = $(this);
		filterMovies();
		updateRangemark(range);
		range.next('output').text(range.val());
	}).trigger('change');

	$(window).on('resize', function () {
		$('input[type="range"]').each(function () {
			updateRangemark($(this));
		});
	});
};

var activateTextFilter = function () {
	$('#text-filter').on('input propertychange', function() {
		console.log('Keydown, value: ' + $(this).val());
		filterMovies();
	});
};

var activateFilters = function () {
	initPlaceFilter();
	limitTimeRange();
	updateTimeRangeMarks();
	activateRangeSliders();
	activateTextFilter();
};


// ======== OTHER FUNCTIONS  ========

var activateLocalStorageMarks = function () {
	// Load marked things from localstorage:
	$('.movie').each(function() {
		var movie = $(this);
		if (window.localStorage.getItem(movie.data('id') + '.marked')) {
			movie.addClass('marked');
		}
		else if (window.localStorage.getItem(movie.data('id') + '.seen')) {
			movie.addClass('seen');
		}
		movie.find('.showplace li').each(function () {
			var place = $(this).closest('.showplace').find('h3').text();
			if (window.localStorage.getItem(
				(movie).data('id') + place + $(this).text() + '.marked'
			)) {
				$(this).addClass('marked');
			}
		});
	});

	// Toggle marked on article and localstorage:
	$('.mark').on('click', function (e) {

		e.preventDefault();

		var article = $(this).closest('article');
		if (article.is('.marked')) {
			article.removeClass('marked');
			article.addClass('seen');
			window.localStorage.removeItem(article.data('id') + '.marked');
			window.localStorage.setItem(article.data('id') + '.seen', true);
		}
		else if (article.is('.seen')) {
			article.removeClass('seen');
			window.localStorage.removeItem(article.data('id') + '.seen');
		}
		else {
			article.addClass('marked');
			window.localStorage.setItem(article.data('id') + '.marked', true);
		}
	});

	// Toggle marked on showtime and localstorage:
	$('.showplace li').on('click', function () {
		var time = $(this);
		var movie = time.closest('.movie');
		var place = time.closest('.showplace').find('h3').text();

		if (time.is('.marked')) {
			time.removeClass('marked');
			window.localStorage.removeItem(
				(movie).data('id') + place + $(this).text() + '.marked'
			);
		}
		else {
			time.addClass('marked');
			window.localStorage.setItem(
				(movie).data('id') + place + $(this).text() + '.marked',
				'true'
			);
		}
	});
};

// Show the aside and change link state:
var activateMoreToggle = function () {
	$('.more').on('click', function (e) {
		e.preventDefault();
		var article = $(this).closest('article');

		if (article.is('.open')) closeArticleExtra(article);
		else openArticleExtra(article);
	});
};

//
// ========================= INITIALIZATION ============================
// 

activateLocalStorageMarks();
populateMoviesObject();
activateFilters();
activateMoreToggle();