var app = {

    //findByName: function() {
    //    var self = this;
    //    this.store.findByName($('.search-key').val(), function (employees) {
    //        $('.employee-list').html(self.employeeLiTpl(employees));
    //    });

    //    //console.log('findByName');
    //    //this.store.findByName($('.search-key').val(), function(employees) {
    //    //    var l = employees.length;
    //    //    var e;
    //    //    $('.employee-list').empty();
    //    //    for (var i=0; i<l; i++) {
    //    //        e = employees[i];
    //    //        $('.employee-list').append('<li><a href="#employees/' + e.id + '">' + e.firstName + ' ' + e.lastName + '</a></li>');
    //    //    }
    //    //});
    //},

    //renderHomeView: function () {
    //    alert("build home");
    //    $('body').html(this.homeTpl());
    //    $('.search-key').on('keyup', $.proxy(this.findByName, this));

    //    //var html =
    //    //        "<div class='header'><h1>Home</h1></div>" +
    //    //        "<div class='search-view'>" +
    //    //        "<input class='search-key'/>" +
    //    //        "<ul class='employee-list'></ul>" +
    //    //        "</div>"
    //    //$('body').html(html);
    //    //$('.search-key').on('keyup', $.proxy(this.findByName, this));
    //},

    slidePage: function (page) {

        var currentPageDest,
            self = this;

        // If there is no current page (app just started) -> No transition: Position new page in the view port
        if (!this.currentPage) {
            $(page.el).attr('class', 'page stage-center');
            $('body').append(page.el);
            this.currentPage = page;
            return;
        }

        // Cleaning up: remove old pages that were moved out of the viewport
        $('.stage-right, .stage-left').not('.homePage').remove();

        if (page === app.homePage) {
            // Always apply a Back transition (slide from left) when we go back to the search page
            $(page.el).attr('class', 'page stage-left');
            alert("left");
            currentPageDest = "stage-right";
        } else {
            // Forward transition (slide from right)
            $(page.el).attr('class', 'page stage-right');
            alert("right");
            currentPageDest = "stage-left";
        }

        $('body').append(page.el);

        // Wait until the new page has been added to the DOM...
        setTimeout(function () {
            // Slide out the current page: If new page slides from the right -> slide current page to the left, and vice versa
            $(self.currentPage.el).attr('class', 'page transition ' + currentPageDest);
            // Slide in the new page
            $(page.el).attr('class', 'page stage-center transition');
            self.currentPage = page;
        });

    },

    registerEvents: function () {
        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
            document.addEventListener('deviceready', this.onDeviceReady, false);
        } else {
            this.onDeviceReady(); //this is the browser
        }
        $(window).on('hashchange', $.proxy(this.route, this));
        var self = this;
        // Check of browser supports touch events...
        if (document.documentElement.hasOwnProperty('ontouchstart')) {
            // ... if yes: register touch event listener to change the "selected" state of the item
            $('body').on('touchstart', 'a', function (event) {
                $(event.target).addClass('tappable-active');
            });
            $('body').on('touchend', 'a', function (event) {
                $(event.target).removeClass('tappable-active');
            });
        } else {
            // ... if not: register mouse events instead
            $('body').on('mousedown', 'a', function (event) {
                $(event.target).addClass('tappable-active');
            });
            $('body').on('mouseup', 'a', function (event) {
                $(event.target).removeClass('tappable-active');
            });
        }
    },

    showAlert: function (message, title) {
        if (navigator.notification) {
            navigator.notification.alert(message, null, title, 'OK');
        } else {
            alert(title ? (title + ": " + message) : message);
        }
    },

    route: function () {
        var self = this;
        var hash = window.location.hash;
        if (!hash) {
            if (this.homePage) {
                this.slidePage(this.homePage);
            } else {
                this.homePage = new HomeView(this.store).render();
                this.slidePage(this.homePage);
            }
            return;

            //$('body').html(new HomeView(this.store).render().el);
            //return;
        }
        var match = hash.match(app.detailsURL);
        if (match) {
            this.store.findById(Number(match[1]), function (employee) {
                self.slidePage(new EmployeeView(employee).render());
                //  $('body').html(new EmployeeView(employee).render().el);
            });
        }
    },
    
    onDeviceReady: function () {
        // app.receivedEvent('deviceready');
        navigator.geolocation.getCurrentPosition(app.onSuccess, app.onError);
    },

    onSuccess: function (position) {
        var longitude = position.coords.longitude;
        var latitude = position.coords.latitude;
        var latLong = new google.maps.LatLng(latitude, longitude);

        var mapOptions = {
            center: latLong,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var map = new google.maps.Map(document.getElementById("map"), mapOptions);

        var marker = new google.maps.Marker({
            position: latLong,
            map: map,
            title: 'my location'
        });
    },

    initialize: function () {
        this.detailsURL = /^#employees\/(\d{1,})/;
        this.homeTpl = Handlebars.compile($("#home-tpl").html());
        this.employeeLiTpl = Handlebars.compile($("#employee-li-tpl").html());
        var self = this;
        this.store = new MemoryStore(function () {
            self.route();
            //  self.showAlert('Store Initialized', 'Info');
            $('body').html(new HomeView(self.store).render().el);
            //  self.renderHomeView();
        });
        this.registerEvents();
        $('.search-key').on('keyup', $.proxy(this.findByName, this));
    }

};

app.initialize();