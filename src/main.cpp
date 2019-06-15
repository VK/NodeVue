#include <ESP8266WiFi.h>
#include "./DNSServer.h" // Patched lib
#include <ESP8266WebServer.h>
#include "vue/content.h"

#include "FS.h"

const byte DNS_PORT = 53;       // Capture DNS requests on port 53
IPAddress apIP(192, 168, 4, 1); // Private network for server
DNSServer dnsServer;            // Create the DNS object
ESP8266WebServer webServer(80); // HTTP server

void handleNotFound()
{
  webServer.sendHeader("Location", "/", true); //Redirect to our html web page
  webServer.send(302, "text/plane", "");
}


void setup()
{
  Serial.begin(9600);
  Serial.println();

  // configure access point
  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
  WiFi.softAP("VueNode"); // WiFi name

  // provided IP to all DNS request
  dnsServer.start(DNS_PORT, "*", apIP);


  webServer.onNotFound(handleNotFound);

  reg_callbacks(webServer);
  webServer.begin();


  SPIFFS.begin();
  Dir dir = SPIFFS.openDir("/");
  Serial.println("Files:");
  while (dir.next())
  {
    Serial.print(dir.fileName() + "\n");
  }
}

void loop()
{
  dnsServer.processNextRequest();
  webServer.handleClient();
}
