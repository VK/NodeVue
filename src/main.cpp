#include <ESP8266WiFi.h>
#include "./DNSServer.h" // Patched lib
#include <ESP8266WebServer.h>
#include "vue/content.h"

const byte DNS_PORT = 53;       // Capture DNS requests on port 53
IPAddress apIP(192, 168, 4, 1); // Private network for server
DNSServer dnsServer;            // Create the DNS object
ESP8266WebServer webServer(80); // HTTP server


void generate_204()
{

  for (int i = 0; i < webServer.args(); i++)
  {
    Serial.print(webServer.argName(i));
    Serial.println(webServer.argName(i));
  }

  Serial.println("204");
  webServer.send(204, "text/plane", "");
}

void handleNotFound()
{
  webServer.sendHeader("Location", "/", true); //Redirect to our html web page
  webServer.send(302, "text/plane", "");
}

void setup()
{
  Serial.begin(9600);
  Serial.println();

  // turn the LED on (HIGH is the voltage level)
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);

  // configure access point
  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
  WiFi.softAP("VueNode"); // WiFi name

  // if DNSServer is started with "*" for domain name, it will reply with
  // provided IP to all DNS request
  dnsServer.start(DNS_PORT, "*", apIP);

  // replay to all requests with same HTML
  webServer.on("/generate_204", generate_204); //Android internet check
  webServer.on("/gen_204", generate_204);      //Android internet check
  //webServer.on("/generate_204", handleRoot);
  //webServer.on("/fwlink", handleRoot);

  
  webServer.onNotFound(handleNotFound);
  reg_callbacks(webServer);
  webServer.begin();
}

void loop()
{
  dnsServer.processNextRequest();
  webServer.handleClient();
}
