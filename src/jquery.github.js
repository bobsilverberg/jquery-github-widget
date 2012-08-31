(function ($, window, document, undefined) {
	"use strict";

    // WebQA Automation repositories
    var WebQARepos = ['flightdeck-selenium', 'Addon-Tests', 'Affiliates-Tests',
        'marketing-project-template', 'marketplace-tests', 'mdn-tests', 'mcom-tests',
        'moztrap-tests', 'Socorro-Tests', 'snippets-tests', 'sumo-tests', 'mozwebqa-test-templates',
        'qmo-tests', 'wiki-tests'];
	// Setup our defaults
	var pluginName = 'github',
		defaults = {
			user: "joepettersson",
			show_extended_info: true,
			show_follows: true,
			width: "400px",
			show_repos: 10,
			oldest_first: false
		};

	// The plugin constructor
	function Github(element, options) {
		// Set the element specified by the user
		this.element = element;
		// Combie in the defaults and options into a single options object
		this.options = $.extend({}, defaults, options);
		// Instantiate our init function, it inherits the options object, so we don't need to explicitly pass it
		this.init();

		this.errorType = '';
    }

	// Our Prototype!
	Github.prototype = {
		// Our controller
		init: function () {
			// Explicitly set our options and element so they can be inherited by functions
			// Then init our functions to build the widget
            var el = this.element,
				options = this.options,
				user = this.model("user", options.user, function (data) {
					// Build layout view with user data and append it to the specified element
					$(el).append(Github.prototype.view_layout(data.data, options));
				}),
                repolist = this.repo(options.user, function (data) {
					// Build our repos partial and append it to the layout, which is already in the DOM
					$(el).find("#ghw-repos ul").append(Github.prototype.view_partial_repos(data, el));
                    // Fade out the Github loader gif, and then fade in the repos we just appended
                    $(el).find("#ghw-repos #ghw-github-loader").slideUp(250, function () {
                        $(el).find("#ghw-repos ul").slideDown(250);
                    });

//                       console.log($("li"));
//                        $("li").sort(function(left, right) {
//                            return $(left).attr("id") - $(right).attr("id");
//                        }).each(function() { $("ul").append($(this)); });
//                       console.log($("li"));

                    // Init our bind function once everything is present within the DOM
                    Github.prototype.bind(el, options);
                })

		},

		// Our user model, get and set user data
		model: function (type, user, callback) {
			// Construct our endpoint URL depending on what is being requested
			var url = "https://api.github.com/orgs/" + user.toLowerCase(); if (type === "repos") { url += "/repos"; } url += "?callback=?";
			// Get data from Github user endpoint, JSONP bitches
			$.getJSON(url, function (data) {
				// Make sure our callback is defined and is of the right type, if it is fire it
				if (typeof callback !== "undefined" && typeof callback === "function") {
					callback(data);
				}
			});
		},

        // Get data for WebQA repos
        repo: function (user, callback) {
            for (var i = 0; i < WebQARepos.length; i++) {
                // Construct our endpoint URL
                var url = "https://api.github.com/repos/" + user.toLowerCase() + "/" + WebQARepos[i].toLowerCase() + "?callback=?";
                // Get data from Github user endpoint, JSONP bitches
                $.getJSON(url, function (data) {
                    // Make sure our callback is defined and is of the right type, if it is fire it
                    if (typeof callback !== "undefined" && typeof callback === "function") {
                        callback(data);
                    }
                });
            }
        },

        // The main layout for the widget
		view_layout: function (user, options) {
			var markup = '';
			// As it's setting a simple string, the width value can be anything acceptable to CSS (px/%/em/pt etc)
			markup += '<div id="ghw-github" style="width: ' + options.width + '">';
			markup += '<div id="ghw-header" class="ghw-clear">';
			markup += '<div id="ghw-logo"><a href="https://github.com/">Github</a></div>';
			markup += '<div id="ghw-user"><a href="' + user.html_url + '" id="ghw-github-user">';
			// If the user has a custom avatar then show it, if not display the default github avatar (served from their CDN)
			if (typeof user.avatar_url !== "undefined" && user.avatar_url.length > 0) {
				markup += '<img src="' + user.avatar_url + '" alt="Avatar" width="34px" height="34px" />';
			} else {
				markup += '<img src="https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-140.png" alt="Avatar" width="34px" height="34px" />';
			}
			markup += '</a></div>';
			// Check if we should show the extended info, a custom option
			// Within extended info we need to check for the existence of elements, as not everyone has the same info set in their Github profile
			if (options.show_extended_info === true) {
				markup += '<div id="ghw-extended-user-info">';
				if (typeof user.name !== "undefined" && user.name.length > 0) {
					markup += '<p class="ghw-name">' + user.name + '</p>';
				}
				markup += '<p class="ghw-place">';
				if (typeof user.company !== "undefined" && user.company !== null && user.company.length > 0) {
					markup += user.company + ' ';
				}
				if (typeof user.location !== "undefined" && user.location !== null && user.location.length > 0) {
					markup += user.location;
				}
				markup += '</p>';
				if (typeof user.bio === "string" && user.bio.length > 0) {
					markup += '<p class="ghw-bio">' + user.bio + '</p>';
				}
				if (user.hireable === true) {
					markup += '<p class="ghw-hireable">I\'m available for hire!</p>';
				}
				markup += '<span class="ghw-repos">' + user.public_repos + ' repos</span>';
				markup += '<span class="ghw-gists">' + user.public_gists + ' gists</span>';
				markup += '</div>';
			}
			markup += '<div id="ghw-github-user-data">';
			markup += '<h2><a href="' + user.html_url + '">';
			if (typeof user.login !== "undefined") {
				markup += user.login;
			} else {
				markup += 'User not found';
			}
			markup += '</a></h2>';
			markup += '<a href="' + user.html_url + '" id="ghw-header-total-repos">' + WebQARepos.length + ' repos</a>';
			// Check if the option to show followers is set to true, if not, don't show it
			if (options.show_follows === true && typeof user.login !== "undefined") {
				markup += ' | <a href="https://github.com/' + user.login.toLowerCase() + '/followers" id="ghw-current-followers">' + user.followers + ' followers</a>';
			}
			markup += '</div>';
			markup += '</div>';
			// The element which the repos partial will eventually be appended to
			markup += '<div id="ghw-repos"><div id="ghw-github-loader"></div><ul></ul></div>';
			markup += '</div>';
			return markup;
		},

		// Our repos partial, which will construct the repo list itself
		view_partial_repos: function (data, el) {
			var markup = '';
            var repo = data.data;
            markup += '<li id="ghw-repo-' + repo.name + '" class="ghw-clear ghw-repo';
            // This is a little bit of a hack to make the CSS easier, if the repo has a language attribute, it will mean
            // the box carries over two lines, which means the buttons on the right become missaligned. So therefore, if
            // there are two lines, add a special class so we can style it more easily.
            if (repo.language !== null) {
                markup += ' double';
            }
            markup += '">';
            markup += '<div class="ghw-left">';
            markup += '<p class="ghw-title"><a href="' + repo.html_url + '" data-description="<p>' + repo.name + '</p>' + repo.description + '" class="ghw-github-tooltip">' + repo.name + '</a></p>';
            markup += '<p class="ghw-meta-data">';
            if (repo.language !== null) {
                markup += '<span class="ghw-language">' + repo.language + '</span></p>';
            }
            markup += '</div>';
            markup += '<div class="ghw-right">';
            markup += '<span class="ghw-forks ghw-github-tooltip" data-description="This repo has ' + repo.forks + ' fork(s)">' + repo.forks + '</span>';
            markup += '<span class="ghw-watchers ghw-github-tooltip" data-description="This repo has ' + repo.watchers + ' watcher(s)">' + repo.watchers + '</span>';
            markup += '<span class="ghw-issues ghw-github-tooltip" data-description="This project has ' + repo.open_issues + ' open issues">' + repo.open_issues + '</span>';
            markup += '</div>';
            markup += '</li>';
			return markup;
		},

		// Our bin utility funciton that will be init'd once we have populated the DOM
		bind: function (el, options) {
			// If the option to show the extended user info is set to true then bind it to do so
			if (options.show_extended_info === true) {
				$("#ghw-github-user").hover(function () {
					$("#ghw-github #ghw-header #ghw-extended-user-info").fadeIn(250, function () {
						$("#ghw-github #ghw-header img").addClass("ghw-ghw-no-bottom-border");
					});
				}, function () {
					$("#ghw-github #ghw-header #ghw-extended-user-info").fadeOut(250, function () {
						$("#ghw-github #ghw-header img").removeClass("ghw-ghw-no-bottom-border");
					});
				});
			}
			// Make the buttons become opaque when hovering over a repo row
			$("#ghw-github li").hover(function () {
				$(this).find(".ghw-right").animate({opacity: 1}, 200);
			}, function () {
				$(this).find(".ghw-right").animate({opacity: 0.3}, 200);
			});
			// Our main tooltip function
			$(".ghw-github-tooltip").hover(function () {
				var markup = '<div class="ghw-github-tooltip-content">' + $(this).attr("data-description") + '</div>';
				$(this).append(markup);
			}, function () {
				$(".ghw-github-tooltip-content").remove();
			});
		}
	};

	// Setup our plugin
	$.fn[pluginName] = function (options) {
		return this.each(function () {
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName,
					new Github(this, options));
			}
		});
	};

}(jQuery, window, document));
