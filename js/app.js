const GLASSDOOR_URL = "http://api.glassdoor.com/api/api.htm";

let userCareerQuery;
let userCurrentCareer;
let userCity;
let userState;
let stateTotal = 1;
let nationTotal = 1;

$(function() {
	$('#loc-search').submit(function(event) {
		event.preventDefault();
		userCareerQuery = $('#loc-query').val();
		$('#loc-query').val("");
		$('#home-page-header').addClass('no-display');
		$('#home-page').addClass('no-display');
		$('#loc-page').removeClass('no-display');
		retrieveJobStats(displayLocData);
		retrieveRelatedCareers(displayRelatedCareers);
	});

	$('#career-search').submit(function(event) {
		event.preventDefault();

		userCurrentCareer = $('#career-query').val();
		console.log(userCurrentCareer);
		$('#career-query').val("");
		$('#home-page-header').addClass('no-display');
		$('#home-page').addClass('no-display');
		$('#progression-page').removeClass('no-display');
		retrieveJobProg(displayCareerProgression);
	});
});

function retrieveJobStats (callback) {
	const params = {
		v: "1",
		format: "json",
		"t.p": "213919",
		"t.k": "dckaIJmhJoa",
		action: "jobs-stats",
		// Optional params below
		q: userCareerQuery,
		city: userCity,
		state: userState,
		returnCities: true,
		returnJobTitles: true
		// returnStates: true,
		// admLevelRequested: 1
	}

	$.ajax({
			url: GLASSDOOR_URL,
			type: "GET",
			data: params,
			dataType: "jsonp",
			jsonpCallback: "displayLocData"
	});
}

function retrieveRelatedCareers (callback) {
	const params = {
		v: "1",
		format: "json",
		"t.p": "213919",
		"t.k": "dckaIJmhJoa",
		action: "jobs-stats",
		// Optional params below
		q: userCareerQuery,
		city: userCity,
		state: userState,
		returnCities: true,
		returnJobTitles: true
		// returnStates: true,
		// admLevelRequested: 1
	}

	$.ajax({
			url: GLASSDOOR_URL,
			type: "GET",
			data: params,
			dataType: "jsonp",
			jsonpCallback: "displayRelatedCareers"
	});
}

function retrieveJobProg (callback) {
	const params = {
		v: "1",
		format: "json",
		"t.p": "213919",
		"t.k": "dckaIJmhJoa",
		action: "jobs-prog",
		jobTitle: userCurrentCareer,
		countryId: 1
	}

	$.ajax({
			url: GLASSDOOR_URL,
			type: "GET",
			data: params,
			dataType: "jsonp",
			jsonpCallback: "displayCareerProgression"
	});
}

function displayLocData (results) {
	$('#top-states h3').text(`Top 5 States for ${userCareerQuery}`);
	$('#top-cities h3').text(`Top 5 Cities for ${userCareerQuery}`);

	let cities = results.response.cities;
	const citiesTopFive = [];
	for (let i = 0; i < 5; i++) {
		citiesTopFive.push(cities[i]);
	}
	const citiesList = citiesTopFive.map((item, index) => renderCitiesResults(item));
		$('#cities-list').html(citiesList);
	
	const stateResults = addStateJobs(results);
	let topFiveStates = Object.keys(stateResults).map(function(state) {
  		return { 
  			stateName: state, 
  			jobs: this[state] };
		}, stateResults);
		topFiveStates.sort(function(state1, state2) { 
		return state2.jobs - state1.jobs; 
	});
	const statesTopFive = topFiveStates.slice(0, 5);
	const statesList = statesTopFive.map((item, index) => renderStatesResults(item));
		$('#states-list').html(statesList);
}

function renderCitiesResults(city) {
	return `
		<li>${city.name}</li>
		`
}

function renderStatesResults(state) {
	return `
		<li>${state.stateName}</li>
		`
}

function displayRelatedCareers (results) {
	console.log(results);

	$('#related-careers h3').text("Jobs related to " + userCareerQuery);
	let careers = results.response.jobTitles;
	
	const careersList = careers.map((item, index) => renderRelatedCareers(item));
		$('#related-careers-list').html(careersList);
}

function renderRelatedCareers(result) {
	return `
		<li><a href="https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${result.jobTitle}" target="_blank">${result.jobTitle}</a> (${result.numJobs} Jobs)</li>
		`
}

function addStateJobs(results) {
	let statesList = results.response.cities;
	let stateCount = {};
	let stateAbb = {};
	if (userCity == "" && userState == "") {
			for (let state of statesList) {
    		if (!stateCount[state.stateName] && !stateAbb[state.stateAbbreviation]) {
      		stateCount[state.stateName] = state.numJobs;
      		stateAbb[state.stateAbbreviation] = state.numJobs;
    		} else {
      		stateCount[state.stateName] += state.numJobs;
      		stateAbb[state.stateAbbreviation] += state.numJobs;
    		}
    		nationTotal += state.numJobs;
		}	
	} else {
  		for (let state of statesList) {
    		if (!stateCount[state.stateName]) {
      		stateCount[state.stateName] = state.numJobs;
      		stateAbb[state.stateAbbreviation] = state.numJobs;
    		} else {
      		stateCount[state.stateName] += state.numJobs;
      		stateAbb[state.stateAbbreviation] += state.numJobs;
    		}
    		nationTotal += state.numJobs;
  	}
  }

  	console.log(stateCount);
  	// uStates.draw('#statesvg', calculateSampleData(stateAbb), tooltipHtml);
   	return stateCount;
}

function displayCareerProgression (results) {
	console.log(results);
	$('#progression-page h2').text(`Check out these career options related to ${capitalize(userCurrentCareer)}`);
	let jobs = results.response.results;
	const jobsProg = [];
	for (let i = 0; i < 5; i++) {
		console.log(jobs[i]);
		jobsProg.push(jobs[i]);
	}
	const jobsList = jobsProg.map((item, index) => renderJobProg(item));
	$('#jobs-list').html(jobsList);
}

function renderJobProg(job) {
	return `
		<div class="related-job">
		<h3>${capitalize(job.nextJobTitle)}</h3>
		<li>Frequency of ${userCurrentCareer}s taking this job: ${Math.round(job.frequencyPercent*100)/100}%</li>
		<li>Jobs available: ${job.nationalJobCount}</li>
		<li>Median Salary: $${job.medianSalary}</li>
		</div>
		`
}

function capitalize (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}