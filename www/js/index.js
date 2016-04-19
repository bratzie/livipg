/*global: $*/
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
$(document).ready(function() {
  initialize();
});

var app = {
  // Application Constructor
  initialize: function() {
    this.bindEvents();
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
    document.addEventListener('online', this.onOnline, false);
  },
  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicitly call 'app.receivedEvent(...);'
  onDeviceReady: function() {
    app.receivedEvent('deviceready');
    console.log("Device Ready");
  },
  onOnline: function() {
    app.receivedEvent('deviceready');
    console.log("Online");
  },
  // Update DOM on a Received Event
  receivedEvent: function(id) {
    document.getElementById("connect").addEventListener('touchend',function(ev){
            cordova.plugins.CordovaMqTTPlugin.connect({
                url: "192.168.43.144",
                port: "1883",
                clientId: "Hej",
                success:function(s){
                    connect = true;
                    console.log(JSON.stringify(s));
                },
                error:function(e){
                    connect = false;
                    console.log(e);
                },
                onConnectionLost:function (){
                  connect = false;
                  console.log('Disconnected from server.');
                  // TODO reconnect
                }
            });
        });
        document.getElementById("subscribe").addEventListener('touchend',function(ev){
            if (!connect) {
              alert("First establish connection then try to subscribe");
            } else {
              cordova.plugins.CordovaMqTTPlugin.subscribe({
                topic: "/wheel/gestures/front/rightside/swipe/#",
                qos: 0,
                success:function(s){
                  console.log(s);
                },
                error:function(e){
                  console.log(e);
                }
              });
            }                
        });
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:inline;');
    
    initialize();

    console.log('Received Event: ' + id);
  }
};
  
function initMqtta() {
  mqtt.subscribe({
    url: "192.168.43.144",
    port: "1883",
    topic: "/wheel/gestures/front/rightside/swipe/#",
    secure: false,
    qos: "",
    cleanSession: true/false,
    username: "",
    password: "",
    debug: true,
    success: function(data) {
      console.log(data);
    },
    error:function(data){
      console.log(data);
    }
  });
}

var state = "calls", selector, gps = false, accellerating = false, activeCall = false, speedDial, speedValue, sdFill, sdFix, selectInProgress = false, warning, device, progress;

var transform_styles = ['-webkit-transform', '-ms-transform', 'transform'];

var LOG_STUFF = false;

/* Functions to cycle lists */
$.fn.cycleToLast = function() {
  if($(this).children(':first-child')) {
    $(this).children(':first-child').appendTo($(this)); 
  }
  return this;
};

$.fn.animateToLast = function() {
  $(this).children(':first-child').hide(
    "fast",
    function() {
      $(this).appendTo($(this).parent()).show("fast");
    }
  );
  return this;
};

$.fn.cycleToFirst = function() {
  if($(this).children(':first-child')) {
    $(this).children(':last-child').prependTo($(this));
  }
  return this;
};

$.fn.animateToFirst = function() {
  $(this).children(':last-child').hide(
    "fast",
    function() {
      $(this).prependTo($(this).parent()).show("fast");
    }
  );
  return this;
};

$.fn.setAsActiveTrack = function() {
  at = $(this);
  at.addClass('active-track');
  $('#mc-artist').html(at.attr('data-artist'));
  $('#mc-song').html(at.attr('data-song'));
  return this;
};

/* Misc */
function log(string) {
  if (LOG_STUFF) {
    console.log(string);
  }
}

function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function startTime() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var gpsh = h;
  var gpsm = m + 5;
  m = checkTime(m); // add a zero in front of numbers<10
  $('#time').html(h + ":" + m);
  if (gpsm >= 60) {
    gpsh++;
    gpsm -= 60;
  }
  gpsm = checkTime(gpsm);
  $('#gps-time').html(gpsh + ":" + gpsm);
  t = setTimeout(function () {
    startTime();
  }, 30000);
}

/* Menu and States */
function activateCalls() {
  /* Set state */
  state = "calls";
  $('#menu li.active').removeClass('active');
  $('#menu-calls').addClass('active');

  /* Move states */
  $('#calls').css('top', '0px');
  $('#navigation').css('top', '-100%');
  $('#music').css('top', '-100%');

  /* Adjust selector position */
  selector.css('bottom', '165px');
}

function activateNavigation() {
  /* Set state */
  state = "navigation";
  $('#menu li.active').removeClass('active');
  $('#menu-navigation').addClass('active');

  /* Move states */
  $('#calls').css('top', '100%');
  $('#navigation').css('top', '0px');
  $('#music').css('top', '-100%');

  /* Adjust selector position */
  selector.css('bottom', '110px');
}

function activateMusic() {
  /* Set state */
  state = "music";
  $('#menu li.active').removeClass('active');
  $('#menu-music').addClass('active');

  /* Move states */
  $('#calls').css('top', '100%');
  $('#navigation').css('top', '100%');
  $('#music').css('top', '0px');

  /* Adjust selector position */
  selector.css('bottom', '55px');
}

function menuUp() {
  switch(state) {
    case "calls":
      break;

    case "navigation":
      activateCalls();
      break;

    case "music":
      activateNavigation();
      break;

    default: return;
  }
}

function menuDown() {
  switch(state) {
    case "calls":
      activateNavigation();
      break;

    case "navigation":
      activateMusic();
      break;

    case "music":
      break;

    default: return;
  }
}

/* Calls */
function selectNextContact() {
  if (!selectInProgress) {
    selectInProgress = true;
    $('#contacts > div').animateToLast().find('.active').removeClass('active').next('.contact').addClass('active');
    t = setTimeout(function() {
      selectInProgress = false;
    }, 250);
  }
}

function selectPreviousContact() {
  if (!selectInProgress) {
    selectInProgress = true;
    $('#contacts > div').animateToFirst().find('.active').removeClass('active').prev('.contact').addClass('active');
    t = setTimeout(function() {
      selectInProgress = false;
    }, 250);
  }
}

function togglePhonecall() {
  if (activeCall) {

  }
}

/* Navigation */
function toggleGPS() {
  var top = $('#gps-notification');
  var bottom = $('#gps-bottom');
  if (gps) {
    bottom.css('bottom', '-' + bottom.outerHeight());
    top.css('top', '-' + top.outerHeight());
    gps = false;
  } else {
    bottom.css('bottom', '0px');
    top.css('top', '25px');
    gps = true;
  }
}

function initMap() {
  var mapDiv = document.getElementById('map');
  var map = new google.maps.Map(mapDiv, {
    center: {lat: 40.7162412, lng: -73.940614},
    zoom: 12,
    disableDefaultUI: true
  });
  map.set('styles', [
    {"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"},{"weight":"0.20"},{"lightness":"28"},{"saturation":"23"},{"visibility":"off"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#494949"},{"lightness":13},{"visibility":"off"}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}
  ]);
}

/* Music */
function selectNextPlaylist() {
  if (!selectInProgress) {
    selectInProgress = true;
    var el = $('#playlist-container');
    el.find('.active-track').removeClass('active-track');
    var at = el.find('.active-playlist').removeClass('active-playlist').next('.playlist').addClass('active-playlist').children('ul').children(':first-child').next('.track').setAsActiveTrack();
    el.animateToLast();
    t = setTimeout(function() {
      selectInProgress = false;
    }, 250);
  }
}

function selectPreviousPlaylist() {
  if (!selectInProgress) {
    selectInProgress = true;
    var el = $('#playlist-container');
    el.find('.active-track').removeClass('active-track');
    el.find('.active-playlist').removeClass('active-playlist');
    el.children(':last-child').addClass('active-playlist').children('ul').children(':first-child').next('.track').setAsActiveTrack();
    el.animateToFirst();
    t = setTimeout(function() {
      selectInProgress = false;
    }, 250);
  }

}

function selectNextTrack() {
  if (!selectInProgress) {
    selectInProgress = true;
    var el = $('.active-playlist ul');
    el.find('.active-track').removeClass('active-track').next('.track').setAsActiveTrack();
    el.animateToLast();
    t = setTimeout(function() {
      selectInProgress = false;
    }, 250);
  }
}

function selectPreviousTrack() {
  if (!selectInProgress) {
    selectInProgress = true;
    var el = $('.active-playlist ul');
    el.animateToFirst();
    el.find('.active-track').removeClass('active-track').prev('.track').setAsActiveTrack();
    t = setTimeout(function() {
      selectInProgress = false;
    }, 250);
  }
}

/* Interaction */

/* Swipe */ 

function handleSwipeLeft() {
  log('Swiped LEFT');
  switch(state) {
    case "calls":
      selectPreviousContact();
      break;

    case "navigation":
      break;

    case "music":
      selectPreviousTrack();
      break;

    default: return;
  }
}

function handleSwipeUp() {
  log('Swiped UP');
  menuUp();
}

function handleSwipeRight() {
  log('Swiped RIGHT');
  switch(state) {
    case "calls":
      selectNextContact();
      break;

    case "navigation":
      break;

    case "music":
      selectNextTrack();
      break;

    default: return;
  }
}

function handleSwipeDown() {
  log('Swiped DOWN');
  menuDown();
}

/* Press */

function handlePressLeft() {
  log('Pressed LEFT');
  switch(state) {
    case "calls":
      break;

    case "navigation":
      break;

    case "music":
      selectPreviousPlaylist();
      break;

    default: return;
  }
}

function handlePressUp() {
  log('Pressed UP');
  accellerate();
}

function handlePressRight() {
  log('Pressed RIGHT');
  switch(state) {
    case "calls":
      break;

    case "navigation":
      break;

    case "music":
      selectNextPlaylist();
      break;

    default: return;
  }
}

function handlePressDown() {
  log('Pressed DOWN');
  switch(state) {
    case "calls":
      togglePhonecall();
      break;

    case "navigation":
      toggleGPS();
      break;

    case "music":
      break;

    default: return;
  }
}

/* Release */

function handleReleaseLeft() {
  log('Released LEFT');
}

function handleReleaseUp() {
  log('Released UP');
  accellerating = false;
}

function handleReleaseRight() {
  log('Released RIGHT');
}

function handleReleaseDown() {
  log('Released DOWN');
}

$(document).keydown(function(e) {
  switch(e.which) {
      case 37: // swipe left
        handleSwipeLeft();
        break;

      case 38: // swipe up
        handleSwipeUp();
        break;

      case 39: // swipe right
        handleSwipeRight();
        break;

      case 40: // swipe down
        handleSwipeDown();
        break;

      case 65: // press a
        handlePressLeft();
        break;

      case 87: // press w
        handlePressUp();
        break;

      case 68: // press d
        handlePressRight();
        break;

      case 83: // press s
        handlePressDown();
        break;

    default: return;
  }
  e.preventDefault();
});

$(document).keyup(function(e) {
    switch(e.which) {
      case 65: // release a
        handleReleaseLeft();
        break;

      case 87: // release w
        handleReleaseUp();
        break;

      case 68: // release d
        handleReleaseRight();
        break;

      case 83: // release s
        handleReleaseDown();
        break;

    default: return;
  }
  e.preventDefault();
});

function accellerate() {
  speed = parseInt(speedValue.html());
  accellerating = true;
  var newSpeed;

  if (speed > 50) {
    newSpeed = Math.floor(speed*=1.04);
  } else if (speed > 20) {
    newSpeed = Math.floor(speed*=1.08);
  } else {
    newSpeed = speed + 2;
  }

  if (speed > 120) { /* Cap speed at 120 */
    newSpeed = 120;
  }
  setSpeed(newSpeed);
}

function decellerate() {
  speed = parseInt(speedValue.html());
  if (accellerating) {
    // do nothing
  } else {
    if (speed > 60) {
      speed = Math.floor(speed*=0.98);
    } else if (speed > 20) {
      speed = Math.floor(speed*=0.95);
    } else if (speed > 0) {
      speed -= 1;
    }
    setSpeed(speed);
  }
  t = setTimeout(function () {
    decellerate();
  }, 200);
}

function toggleWarning(speed) {
  if (speed > 45) {
    warning.css({
      'opacity': '1',
      'transform': 'scale(1)'
    });
    device.css('background-color', 'rgba(25, 10, 10, .5)');
    progress.css('background-color', 'rgba(255, 90, 50, 1)');
  } else {
    warning.css({
      'opacity': '0',
      'transform': 'scale(1.2)'
    });
    device.css('background-color', 'rgba(0, 0, 0, .5)');
    progress.css('background-color', 'rgba(24, 140, 200, 1)');
  }
}

function setSpeed(speed) {
  toggleWarning(speed);
  speedValue.html(speed);
  var rotation = Math.floor((speed/120) * 136.5);
  var fill_rotation = rotation;
  var fix_rotation = rotation * 2;
  for(var i in transform_styles) {
    $('#sd-progress .circle .fill, .circle .mask.full').css(transform_styles[i], 'rotate(' + fill_rotation + 'deg)');
    $('.circle .fill.fix').css(transform_styles[i], 'rotate(' + fix_rotation + 'deg)');
  }
}

function initialize() {
  selector = $('#selector');
  speedDial = $('#speed-dial');
  speedValue = $('#speed');
  sdFill = $('#sd-progress .circle .fill, .circle .mask.full');
  sdFix = $('.circle .fill.fix');

  // For Warning Notifications
  warning = $('#warning');
  device = $('#device div');
  progress = $('#sd-progress .circle .mask .fill');

  startTime();
  activateCalls();

  /* Ghetto interaction for phonegap atm */
  $('#speed-dial').on('click', function() {
    setSpeed(Math.floor(Math.random()*120));
  } );

  $('#speed-dial').on('touchend', function() {
  } );

  $('#menu-calls').click(function() { activateCalls(); } );
  $('#menu-navigation').click(function() { activateNavigation(); } );
  $('#menu-music').click(function() { activateMusic(); } );

  $('#next-song').click(function() { selectPreviousTrack(); } );
  $('#prev-song').click(function() { selectNextTrack(); } );

  $('#next-contact').click(function() { selectPreviousContact(); } );
  $('#prev-contact').click(function() { selectNextContact(); } );

  $('#music .view-header').click(function() { selectNextPlaylist(); } );

}
