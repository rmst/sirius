# Sirius
Sirius is a simple LED lamp designed and built by me (**Si**mon) and my friend Da**rius** over the holidays (2021). It uses a strip or grid of individually controllable (WS2812B) LEDs and a wifi-capable microcontroller (NodeMCU/ESP8266). The microcontroller connects to a wifi (hardcoded) and runs a webserver that serves a tiny webpage which in-turn embeds the main webpage in an iframe. The main webpage to control the lamp is then served from a more capable (static) webserver, e.g. Github pages.

Further info about parts and software is at [info.md](info.md).

