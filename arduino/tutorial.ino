#include <SPI.h>
#include <Ethernet.h>
#include <dht.h>

#define DHT22_PIN 6
dht DHT;

byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
byte server[] = { 169, 53, 41, 241 };
IPAddress ip(192, 168, 0, 177);
char* token = "<your FlowThings master token>";

EthernetClient client;

void sendDrop(float temperature, float humidity)
{
    if (!client.connected())
      client.connect(server, 80);

    if (client.connected())
    {
        Serial.println("connection successful");

        client.println("POST /v0.1/<your FlowThings account name>/drop HTTP/1.1");
        client.println("Host: api.flowthings.io");
        client.println("Connection: close");
        client.print("X-Auth-Token: ");
        client.println(token);
        client.println("Content-Type: application/json");

        String data = "{\"path\":\"/<your FlowThings account name>/meteo\",\"elems\":{\"temperature\":" + String(temperature) + ",\"humidity\":" + String(humidity) + "}}";

        client.print("Content-Length: ");
        client.println(data.length());

        client.println();

        client.println(data);

        while (client.available()) {
            char c = client.read();
            Serial.print(c);
        }
    }
    else {
        Serial.println("connection failed");
        client.stop();
    }
}

void setup()
{
    Serial.begin(9600);

    if (Ethernet.begin(mac) == 0) {
        Serial.println("Failed to configure Ethernet using DHCP");
        Ethernet.begin(mac, ip);
    }

    client.connect(server, 80);
}

void loop()
{
    int reading = DHT.read22(DHT22_PIN);
    switch (reading)
    {
        case DHTLIB_OK:
            Serial.print("Temperature: ");
            Serial.print(DHT.temperature);
            Serial.print("\tHumidity: ");
            Serial.println(DHT.humidity);
            sendDrop(DHT.temperature, DHT.humidity);
            break;
        case DHTLIB_ERROR_CHECKSUM: 
            Serial.println("Checksum error"); 
            break;
        case DHTLIB_ERROR_TIMEOUT: 
            Serial.println("Time out error"); 
            break;
        default: 
            Serial.println("Unknown error"); 
            break;
    }

    delay(5000); 
}
