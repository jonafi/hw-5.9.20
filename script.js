$( document ).ready(function() {

    var city="Minneapolis"; //Default city if location call fails.

    if ("geolocation" in navigator){ 
    navigator.geolocation.getCurrentPosition(function(position){ 
        var userCity = {
        "async": true,
        "crossDomain": true,
        "url": "https://us1.locationiq.com/v1/reverse.php?key=8f1fc454d65237&lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&format=json",
        "method": "GET"
        }
        
        $.ajax(userCity).done(function (userLocation) {
        var city = userLocation.address.city;
        getWeatherData(city);
    });
    });}

    function getWeatherData(city){
        var currentWeather = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&APPID=bb531b33379b545d3e2ce5f79f354951"
        $.ajax({url: currentWeather, method: "GET"}).then(function(current) {
            var lat = current.coord.lat;
            var lon = current.coord.lon; 
            uviCall(lat,lon);
            fiveDayCall(lat,lon);
            var displayName = $("<div>");
            displayName.addClass("cw_details");
            displayName.addClass("enbiggin");
            displayName.text(current.name);
            $("#current_weather").html(displayName);
    
            var weatherIcon = "<img src =\"https://openweathermap.org/img/wn/"+current.weather[0].icon+"@2x.png\">"; //TODO movie icons locally
            $("#current_weather").append(weatherIcon);
    
            var temperature = $("<div>");
            temperature.addClass("cw_details");
            temperature.html("Temperature: " + Math.floor(current.main.temp) + "&#8457");
            $("#current_weather").append(temperature);
    
            var humidity = $("<div>");
            humidity.addClass("cw_details")
            humidity.text("Humidity: " + current.main.humidity + "%");
            $("#current_weather").append(humidity);
    
            var windSpeed = $("<div>");
            windSpeed.addClass("cw_details");
            windSpeed.text("Wind Speed: " + Math.ceil(current.wind.speed) + " MPH");
            $("#current_weather").append(windSpeed);
        });
    };
    
    function uviCall(lat,lon){
    var uvi = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon +"&APPID=bb531b33379b545d3e2ce5f79f354951"
    $.ajax({url: uvi, method: "GET"}).then(function(uviInfo) {
        var uvIndex = $("<div>");
        uvIndex.addClass("cw_details");
        uvIndex.text("UV Index: ");
        var uvAlert = $("<span>");
        uvAlert.addClass("uvBox")
        if(uviInfo.value>5){
            uvAlert.addClass("uvHigh");
            }
        else if(uviInfo.value<3){
            uvAlert.addClass("uvLow");
            }
        else{
            uvAlert.addClass("uvMid");
            }
        uvAlert.text(uviInfo.value);
        uvIndex.append(uvAlert);
        $("#current_weather").append(uvIndex);
    });
    }
    
    function fiveDayCall(lat,lon){  //TODO recalculate date/timestamp more accuately with moment.js
      

        $("#forecast_weather").empty(); 
        var fiveDay = "https://api.openweathermap.org/data/2.5/forecast?cnt=40&units=imperial&lat=" + lat + "&lon=" + lon +"&APPID=bb531b33379b545d3e2ce5f79f354951"
        $.ajax({url: fiveDay, method: "GET"}).then(function(forecast) {


      /// caluclate 5 day forecast start time for noon the following day
      var tomorrowTime = (moment().add(1,"days").format("YYYY[-]MM[-]DD"));
      tomorrowTime = tomorrowTime.concat(" 12:00:00");
      for(i=0;i<8;i++){
          if(tomorrowTime===forecast.list[i].dt_txt){
              var startingIndex = i;
            }
      }
        for(i=startingIndex;i<40;i+=8){
            var forecastBubble = $("<div>");
        forecastBubble.addClass("fiveDay");
        var dateSpan = $("<div>");
        dateSpan.text(moment(forecast.list[i].dt_txt).format("ddd"));
        //dateSpan.text(moment(forecast.list[i].dt_txt)); 
        forecastBubble.append(dateSpan);
        var forecastIcon = $("<img>");
        forecastIcon.attr("src", "https://openweathermap.org/img/wn/" + forecast.list[i].weather[0].icon + "@2x.png");
        forecastIcon.addClass("miniIcon");
        forecastBubble.append(forecastIcon);
        var forecastTemp = $("<div>");
        forecastTemp.html("Temp: " + Math.floor(forecast.list[i].main.temp) + "&deg;");
        forecastBubble.append(forecastTemp);
        var forecastHumidity = $("<div>");
        forecastHumidity.text("RH: " + forecast.list[i].main.humidity + "%");
        forecastBubble.append(forecastHumidity);
        $("#forecast_weather").append(forecastBubble);
    }
    });
    }
    
    $(document).on("click", ".list-group-item", function(){
        var city = this.innerHTML;
        getWeatherData(city); 
    } );
    
    $(document).on("click", "button",  function(){
        getWeatherData($("#inputCity").val());
        saveEntry($("#inputCity").val());
        $("#inputCity").val(""); 
    })
    
    $(document).on("keypress",function(key) {
        if(key.which === 13) {
            getWeatherData($("#inputCity").val());
            saveEntry($("#inputCity").val());  
            $("#inputCity").val(""); 
        }
    });
    
    function saveEntry(city){ //TODO change how cities are stored to prevent weird shuffling
        localStorage.setItem(city,city.substr(0,1).toUpperCase()+city.substr(1));
        var newCity = $("<li>");
        newCity.addClass("list-group-item");
        newCity.text(city.substr(0,1).toUpperCase()+city.substr(1));
        $("#recent-cities").prepend(newCity);
    }
    
    function loadEntries(){  //TODO change how cities are stored to prevent weird shuffling
        var keys = Object.keys(localStorage);
        
        for (i=0;i<keys.length; i++) {
        //for(i=keys.length-1; i>=0; i--){
            var newCity = $("<li>");
            newCity.addClass("list-group-item");
            newCity.text(keys[i]);
            $("#recent-cities").prepend(newCity);
        }
    }
   
    getWeatherData(city);
    loadEntries();

});