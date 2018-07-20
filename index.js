//Article component
Vue.component('article-item', {
    props: ['article'],
    template: '\
		<div class="item col-md-3 text-center" @click="toggle = !toggle">\
			<!--Show image-->\
            <span>\
              	<img class="resize" v-bind:src="article.image">\
            </span>\
            <!--Show title-->\
            <h4>{{ article.headline.main }}</h4>\
            <!--Show article info on click-->\
            <div v-show="toggle">\
            	<!--Show summary-->\
    			<p >{{ article.snippet }}</p>\
    			<!--Show read more button-->\
    			<button v-bind:href="article.web_url">Read more</button>\
    		</div>\
        </div>\
    ',
    methods: {},
	data () {
	    return {
	     	toggle: false
	    }
	},
});

//Settings
const NYTApiBaseUrl = 'https://api.nytimes.com/';
const apiKey = '9cc19626decc4515bb351d904de23753';
const NYTImageBaseUrl = 'https://nytimes.com/';

//Defaults
var api = 'svc/search/v2/articlesearch';
var imageUrl = 'https://3c1703fe8d.site.internapcdn.net/newman/gfx/news/hires/2017/thecuriousch.jpg';

//Create api url
function buildApiUrl (params) {
  	return NYTApiBaseUrl + api + ".json?api-key=" + apiKey + '&' + params
}

//Prepare parameters for get request
function prepareParams (params, search) {
	var prep = Object.keys(params).map(function(key) {
	    return key + '=' + params[key] + (key == 'fq' ? ':' + search : '');
	}).join('&');

	return prep;
}

//Edit api response
function editResponse (response) {
	//Iterate response
	for (var i = 0; i < response.length; i++) {
		
		//Set default image
		response[i].image = imageUrl;
	
		//Iterate multimedia part of response
		for (var j = 0; j < response[i].multimedia.length; j++) {
			//Iterate multimedia properties
			for (var prop in response[i].multimedia[j]) {
				//Check if subType property equals 'wide' image
				if(prop == 'subType' && response[i].multimedia[j][prop] == 'wide') {
					//Set image
					response[i].image = NYTImageBaseUrl + response[i].multimedia[j].url;
				}
			}
		}
	}
	
	return response;
}

var app = new Vue({
  	el: '#app',
  	data: {
	    articles: [],
	    search: 'Amsterdam',
	    message: 'You loaded this page on ' + new Date().toLocaleString(),
	    params: {
	    	fq: 'headline',
	    	page: 0,
	    	sort: 'newest',
	    	fl: 'web_url,snippet,headline,multimedia'

    	},
    	errored: false
  	},
  	methods: {
	    getArticles(api) {
	    	//Prepare parameters for get request
	    	let params = prepareParams(this.params, this.search);

	    	//Prepare api url
	    	let url = buildApiUrl(params);

	    	//Do request
		    axios
		        .get(url)
		        .then(response => (this.articles = editResponse(response.data.response.docs)))
		        .catch(error => {
		        	console.log(error)
		        	this.errored = true
		        })
	    }
  	},
  	//Actions on application start
    mounted () {
    	this.getArticles();
  	},
  	watch: {
  		//Listen to changes of the search model
	  	search: function () {
	  		this.getArticles();
	  	}
  	}
});