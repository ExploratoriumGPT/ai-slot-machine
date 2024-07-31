#include <Bounce2.h>
#include <Keyboard.h>

#define BUTTON_PIN 2
#define LED_PIN 6
#define DEBOUNCE_TIME 10 // 10 ms
#define TIMEOUT 2000 // 2000 ms

Bounce debouncer = Bounce();
unsigned long lastPressTime = 0;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH); // LED is on by default

  debouncer.attach(BUTTON_PIN);
  debouncer.interval(DEBOUNCE_TIME);
}
     
void loop() {
  debouncer.update();

  if (debouncer.fell() && (millis() - lastPressTime > TIMEOUT)) { // Button press detected and timeout has passed
    digitalWrite(LED_PIN, LOW); // Turn off LED
    Keyboard.write(' '); // Send spacebar keypress
    lastPressTime = millis(); // Update the last press time
  }

  if (millis() - lastPressTime > TIMEOUT) { // Timeout has passed
    digitalWrite(LED_PIN, HIGH); // Turn on LED
  }
}