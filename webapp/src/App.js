import React, { useEffect, useState } from "react";
import { HexColorPicker , HexColorInput} from "react-colorful";
import "./index.css";


var API = {
  initColor: "#b32aa9",
  send: (msg) => {},
}

window.addEventListener("message", (event) => {
  // Do we trust the sender of this message?
  if (event.origin !== "http://lampe.local")
    return;

  // event.source is window.opener
  // event.data is "hello there!"
  
  console.log("EVENT:", event.data)
  API.initColor = event.data.initColor
  API.send = (msg) => {event.source.postMessage(msg, event.origin)}

}, false);


function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function gammaCorrected(rgb, gamma=0.4){
  let correctionExponent = 1/gamma;
  return {
    r: 255 * Math.pow(( rgb.r / 255), correctionExponent),
    g: 255 * Math.pow(( rgb.g / 255), correctionExponent),
    b: 255 * Math.pow(( rgb.b / 255), correctionExponent),
  }
}

var colorTarget = "#b32aa9"
var colorCurrent = "#b32aa9"

setInterval(() => {
  if(colorTarget !== colorCurrent){
    var rgb = hexToRgb(colorTarget)
    rgb = gammaCorrected(rgb)
    API.send({type: "set", data: rgb})
    colorCurrent = colorTarget
  }
}, 25)


export default function App() {
  const [color, setColor] = useState("#b32aa9");

  useEffect(()=>{

  }, [])

  function colorChange(hex){
    setColor(hex)
    colorTarget = hex
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
