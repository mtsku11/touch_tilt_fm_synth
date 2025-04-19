Touch Tilt FM Synth
====================

This project demonstrates a touch-controlled WebSocket-based polyphonic FM synthesizer using Csound. It is designed with **two HTML files** working together:

1. `controller.html` — for sending multitouch and tilt data from a mobile device  
2. `synth.html` — for receiving input, generating sound in Csound, and optionally adjusting parameters

Both files use WebSockets to communicate and rely on a shared ngrok or local server address to pass real-time data.

CsoundObj API Code Used
------------------------

- `await import('./js/csound.js')` — dynamically loads the Csound WebAssembly module  
- `await Csound()` — creates a new instance of Csound  
- `.setOption("-odac")` — sets Csound to output audio in real time  
- `.compileOrc(code)` — compiles an embedded string containing the synth definition  
- `.start()` — starts the Csound engine  
- `.setControlChannel(channel, value)` — sends real-time parameter updates from JavaScript to Csound  
- `.inputMessage()` — used to trigger long-running instruments (`i1 0 -1`) or to turn them off  

synth.html
----------

The **synth** page is responsible for:

- Running the FM synth engine in Csound  
- Receiving multitouch pitch/amp and tilt modulation data via WebSocket  
- Controlling 3 polyphonic voices (one per finger)  
- Applying a ported amplitude for smooth envelope transitions  
- Letting the user adjust a **Fast / Slow** slider to control port smoothing time for note releases  

### Synth Structure

The instrument is long-running (`i1 0 -1`) and listens to 7 control channels:

- `amp1`, `amp2`, `amp3` — amplitude per finger  
- `freq1`, `freq2`, `freq3` — frequency per finger (from MIDI pitch)  
- `fmFreq`, `fmIndex` — FM parameters from device tilt  
- `releaseTime` — shared smoothing time for all amplitudes  

Each `kamp` value is smoothed using:

```csound
kamp1 = portk(chnget:k("amp1"), krelease)
```

Where `krelease` is read from the `releaseTime` channel. This allows real-time control over how fast/slow notes fade in/out.

### JavaScript Flow

1. On pressing **Start Synth**, Csound is initialized and the synth starts.  
2. A WebSocket is opened (`wss://<server>`) to receive messages.  
3. Incoming WebSocket messages are parsed:  
   - `type: "touch"` updates `amp` and `freq` for a given touch ID.  
   - `type: "off"` sets amplitude to 0 (for note release).  
   - `type: "tilt"` updates FM mod parameters.  
4. A timer is used to stop the synth after no touches for 4 seconds.  

### User Control

The "Fast / Slow" slider sends a value between `0.01` and `0.3` to `releaseTime`, allowing the user to control how sharp or soft the amplitude smoothing is — this affects release feel directly.

controller.html
---------------

The **controller** page is designed for a touch-capable device like a phone or tablet.

Its job is to:

- Detect multitouch events and send `id`, `pitch`, and `amp` for each finger  
- Detect device tilt using `DeviceOrientationEvent` and send `fmFreq` and `fmIndex` (front-back and side tilt)  
- Send all data via WebSocket in real time to the synth  

### How It Works

- For each finger:  
  - Y-axis touch position is mapped to **pitch** (MIDI 48–72)  
  - X-axis position is mapped to **amplitude**  
- Device tilt:  
  - `beta` (front-back tilt) is mapped to `fmFreq` (100–800 Hz)  
  - `gamma` (left-right tilt) is mapped to `fmIndex` (0–5)  
- Touch start and move send `type: "touch"` with values  
- Touch end sends `type: "off"` with `id`  

This structure allows for expressive, continuous polyphonic control using just natural touch and motion gestures.

WebSocket Communication
------------------------

The two HTML files talk via WebSocket using a shared ngrok address or local server. You must:

1. Serve both `controller.html` and `synth.html` from a server or ngrok  
2. Make sure both connect to the same WebSocket server  
3. Ensure your server relays the messages properly (or run them on the same device via `localhost`)  

Conclusions
-----------

This project is an expressive and flexible touch-based synth system. It uses:

- Real-time Csound synthesis  
- Smooth polyphonic voice handling  
- Tilt-based modulation  
- A tweakable envelope porting system  

It is a great example of combining modern web APIs, Csound's power, and intuitive interface design into a responsive instrument.
