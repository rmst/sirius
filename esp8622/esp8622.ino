//
// CONSTANTS
//
#include "user_constants.h"


// NEOPIXELS 
#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
  #include <avr/power.h>
#endif
#define PIN        D6
#define NUMPIXELS 300

Adafruit_NeoPixel pixels(NUMPIXELS, PIN, NEO_GRB + NEO_KHZ800);
//Adafruit_NeoPixel pixels(NUMPIXELS, PIN, NEO_RGB + NEO_KHZ800);
//#define DELAYVAL 1


void setColor(uint8_t r, uint8_t g, uint8_t b){
  uint8_t* buf = pixels.getPixels();
  for(int i=0; i<300; i++) {
    // pixels.Color() takes RGB values, from 0,0,0 up to 255,255,255
//    pixels.setPixelColor(i, pixels.Color(r, g, b));
    *buf = g;
    buf++;
    *buf = r;
    buf++;
    *buf = b;
    buf++;
    
  }
  pixels.show();
//delay(DELAYVAL);
}




// SERVER
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WiFiMulti.h> 
#include <ESP8266mDNS.h>
#include <ESP8266WebServer.h>

ESP8266WiFiMulti wifiMulti;     // Create an instance of the ESP8266WiFiMulti class, called 'wifiMulti'

ESP8266WebServer server(80);    // Create a webserver object that listens for HTTP request on port 80

const int led = 2;

void handleRoot();              // function prototypes for HTTP handlers
void handleLED();
void handleNotFound();

const char INDEX_HTML[] = R"(
<style>
body: {
  margin: 0;
  padding: 0;
}
</style>
<iframe id="frame" style="width:100%; height:100%;" frameBorder="0"></iframe>

<script>
//URL = "http://localhost:3000"
//URL = "http://192.168.99.121:3000"
URL = "http://rmst.local:3000"

console.log("init")

let frame = document.getElementById("frame")
frame.src = URL
frame.addEventListener( "load", () => {
  frame.contentWindow.postMessage({initColor: "#556b2f"}, URL)
})

window.addEventListener("message", (event) => {
  // Do we trust the sender of this message?  (might be
  // different from what we originally opened, for example).
  if (event.origin !== URL)
    return;

   console.log("msg from frame", event.data)
   if(event.data.type === "save"){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/save", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        
    }));
   }
   else if(event.data.type === "set"){
    var http = new XMLHttpRequest();
    c = event.data.data
    var params = `r=${c.r}&g=${c.g}&b=${c.b}`
    http.open('POST', "/set", true);
    
    //Send the proper header information along with the request
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.send(params);
   }
}, false);

</script>
)";


void handleSave() {                          // If a POST request is made to URI /LED
  digitalWrite(led,!digitalRead(led));      // Change the state of the LED
  setColor(1, 1, 100);
  server.sendHeader("Location","/");        // Add a header to respond with a new location for the browser to go to the home page again
  server.send(303);                         // Send it back to the browser with an HTTP status 303 (See Other) to redirect
}

void handleSet() {                          // If a POST request is made to URI /LED
//  digitalWrite(led,!digitalRead(led));      // Change the state of the LED
  
  setColor(server.arg("r").toInt(), server.arg("g").toInt(), server.arg("b").toInt());
  server.send(200);
}


//
// SETUP
//

void setup(void){


  // SERVER SETUP
  
  Serial.begin(115200);         // Start the Serial communication to send messages to the computer
  delay(10);  // TODO: remove, why is this here?
  Serial.println('\n');

  pinMode(led, OUTPUT);

  wifiMulti.addAP(WIFI0);   // add Wi-Fi networks you want to connect to
  wifiMulti.addAP(WIFI1);
  wifiMulti.addAP(WIFI2);

  Serial.println("Connecting ...");
  int i = 0;
  while (wifiMulti.run() != WL_CONNECTED) { // Wait for the Wi-Fi to connect: scan for Wi-Fi networks, and connect to the strongest of the networks above
    delay(250);
    Serial.print('.');
  }
  Serial.println('\n');
  Serial.print("Connected to ");
  Serial.println(WiFi.SSID());              // Tell us what network we're connected to
  Serial.print("IP address:\t");
  Serial.println(WiFi.localIP());           // Send the IP address of the ESP8266 to the computer

  if (MDNS.begin("lampe")) {              // Start the mDNS responder for esp8266.local
    Serial.println("mDNS responder started");
  } else {
    Serial.println("Error setting up MDNS responder!");
  }

  server.on("/", HTTP_GET, handleRoot);     // Call the 'handleRoot' function when a client requests URI "/"
  server.on("/save", HTTP_POST, handleSave);  // Call the 'handleSave' function when a POST request is made to URI /save
  server.on("/set", HTTP_POST, handleSet);  // Call the 'handleSet' function when a POST request is made to URI "/set"
  server.onNotFound(handleNotFound);        // When a client requests an unknown URI (i.e. something other than "/"), call function "handleNotFound"

  server.begin();                           // Actually start the server
  Serial.println("HTTP server started");



  // NEOPIXEL SETUP
  #if defined(__AVR_ATtiny85__) && (F_CPU == 16000000)
  clock_prescale_set(clock_div_1);
  #endif
  //    pixels.setBrightness(brightness);
  pixels.begin();
  pixels.clear();

  setColor(1, 1, 1);
  
}



//
// LOOP
//

void loop(void){
  MDNS.update();
  server.handleClient();                    // Listen for HTTP requests from clients
}

void handleRoot() {                         // When URI / is requested, send a web page with a button to toggle the LED
  server.send(200, "text/html", INDEX_HTML);
}

void handleNotFound(){
  server.send(404, "text/plain", "404: Not found"); // Send HTTP status 404 (Not Found) when there's no handler for the URI in the request
}