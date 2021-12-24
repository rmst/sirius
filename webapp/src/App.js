import React, { useEffect, useState } from "react";
import { HexColorPicker , HexColorInput} from "react-colorful";
import { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from "react-dom";
import "./index.css";


var API = {
  initColor: "#b32aa9",
  send: (msg) => {},
}


function localScript(){
  window.pendingPostSet = null
  window.postSetRequest = null

  function maybeUpdate(){
    let pending = window.pendingPostSet
    let request = window.postSetRequest

    if(pending === null)
      return
      
    if(request !== null){
      if(Date.now() - request.timestamp > 500){
        // console.log("abort previous post")
        request.abort()
        window.postSetRequest = null
      } else if(request.readyState !== XMLHttpRequest.DONE){
        return
      }
    }

    let c = pending

    request = new XMLHttpRequest();
    let params = `r=${c[0]}&g=${c[1]}&b=${c[2]}`

    request.open('POST', "/set", true);
    
    //Send the proper header information along with the request
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.onreadystatechange = maybeUpdate
    // request.timeout = 400  // ms
    // request.ontimeout = () => {
    //   request.abort()
    //   request = null 
    // }
    request.send(params);

    request.timestamp = Date.now()
    window.postSetRequest = request
    window.pendingPostSet = null

  }

  window.addEventListener("message", (event) => {
    // Do we trust the sender of this message?  (might be
    // different from what we originally opened, for example).
    
    // console.log(event.origin)

    // if (event.origin !== URL)
    if(! ["https://simonramstedt.com", "http://rmst.local:3000"].includes(event.origin))
      return;
  
    // console.log("inj: msg from frame", event.data)
    if(event.data.type === "save"){
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/save", true);

      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({
          
      }));
     }
     else if(event.data.type === "set"){
      window.pendingPostSet = event.data.data
      maybeUpdate()
     }
  }, false);
}

window.addEventListener("message", (event) => {
  // Do we trust the sender of this message?

  // console.log("Embedded page received message from", event.origin)

  if (! ["http://lampe.local", "http://192.168.99.139", "http://192.168.178.54"].includes(event.origin))
    return;

  // event.source is window.opener
  // event.data is "hello there!"
  
  // console.log("EVENT:", event.data)
  API.initColor = event.data.initColor
  API.send = (msg) => {event.source.postMessage(msg, event.origin)}

  // init
  API.send({type: "init", script: `(${localScript.toString()})();`})

}, false);


function hexToRgb(hex) {
  var [_, ...result] = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? result.map( x => parseInt(x, 16) ) : null;
}

function gammaCorrected(rgb, gamma=0.4){
  // assumes values in [0, 1]
  let correctionExponent = 1/gamma;
  return rgb.map( x => Math.pow(( x), correctionExponent) )
}

function customCorrection(rgb){
  rgb = rgb.map( x => x / 255 )

  rgb = gammaCorrected(rgb)

  rgb = [
    rgb[0],
    rgb[1] * 0.65,
    rgb[2] * 0.65,
  ]

  return rgb.map( x => Math.floor(x * 255) )
}


export default function App() {
  const [color, setColor] = useState("#b32aa9");

  function colorChange(hex){
    setColor(hex)

    var rgb = hexToRgb(hex)
    rgb = customCorrection(rgb)
    API.send({type: "set", data: rgb})
  }
  return (
    <div className="App">
      <section className="colorpicker">
        <HexColorPicker color={color} onChange={colorChange} />
      </section>

      {/* <div className="value" style={{ borderLeftColor: color }}>
        Current color is {color}
      </div> */}

      <div className="buttons">
      < HexColorInput color={color} onChange={colorChange} />

        <button onClick={() => API.send({type: "save"})}>Save</button>
        {/* <button onClick={() => setColor("#556b2f")}>Choose green</button>
        <button onClick={() => setColor("#207bd7")}>Choose blue</button> */}
      </div>
    </div>
  );
}
