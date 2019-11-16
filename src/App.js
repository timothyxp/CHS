import React from 'react';
import Background from './images/flat.png';
import './App.css';
import Man from './components/Man/Man';

import openSocket from 'socket.io-client';
const socket = openSocket("http://ab060bc6.ngrok.io");

var backStyle = {
  backgroundImage: "url(" + Background + ")",
  width: "450px",
  height: "420px"
};


let lamps = {
  "1": {
    position: "relative",
    left: "75px",
    top: "90px",
    width: "160px",
    height: "140px",
  }
  ,
  "2": {
    position: "relative",
    left: "140px",
    top: "120px",
    width: "160px",
    height: "110px",
  }
  ,
  "3": {
    position: "relative",
    left: "280px",
    top: "-170px",
    width: "140px",
    height: "130px",
  }
};

let getHSLA = (bright, color) => {
  color = color * 1.1;
  bright = bright / 100;

  var temp = color / 100;

  var red, green, blue;

  if( temp <= 66 ){

    red = 255;

    green = temp;
    green = 99.4708025861 * Math.log(green) - 161.1195681661;


    if( temp <= 19){

      blue = 0;

    } else {

      blue = temp-10;
      blue = 138.5177312231 * Math.log(blue) - 305.0447927307;

    }

  } else {

    red = temp - 60;
    red = 329.698727446 * Math.pow(red, -0.1332047592);

    green = temp - 60;
    green = 288.1221695283 * Math.pow(green, -0.0755148492 );

    blue = 255;

  }
  return `rgba(${red}, ${green}, ${blue}, ${bright})`;
};

let generateStyle = (number, bright, color) => {
  return {
    ...lamps[number],
    backgroundColor: getHSLA(bright, color)
  };
};


class App extends React.Component {
  constructor() {
    super();

    this.manRef = React.createRef();

    this.current = 0;

    this.state = {
      lamps: {
        "1": {
          status: "LampStatus",
          bright: 0,
          color: 2700
        },
        "2": {
          status: "LampStatus",
          bright: 0,
          color: 2700
        },
        "3": {
          status: "LampStatus",
          bright: 0,
          color: 2700
        }
      },
      status: "Idle"
  };
  }

  name2RoomId = {
    "outside": 0,
    "living": 1,
    "entrance": 2,
    "kitchen": 3
  };

  roomId2Name = {
    0: "outside",
    1: "living",
    2: "entrance",
    3: "kitchen"
  };

  changeColor = (flat_number, bright, color, completed) => {
    let status = "";

    if(this.state.lamps[flat_number].bright < bright)
      status = "LampStatusUp";
    else
      status = "LampStatusDown";

    if(completed)
      status = "LampStatus";

    console.log(bright, color, completed);

    let new_state = {
      lamps:this.state.lamps
    };
    new_state.lamps[flat_number] = {
      bright: bright,
      color: color,
      status: status
    };

    this.setState(new_state);
  };

  changeInterval = 20;
  brightInterval = 1;
  colorInterval = 30;

  smoothlyChangeColor = (flat_number, bright, color) => {
    let current_bright = this.state.lamps[flat_number].bright;
    let current_color = this.state.lamps[flat_number].color;

    let diff_bright = Math.abs(bright - current_bright);
    let diff_color = Math.abs(color - current_color);

    let completed = true;

    if(diff_bright > this.brightInterval || diff_color > this.colorInterval)
      completed = false;

    diff_bright = Math.min(diff_bright, this.brightInterval);
    diff_color = Math.min(diff_color, this.colorInterval);

    let new_bright = 0;
    let new_color = 0;

    if (bright > current_bright)
      new_bright = current_bright + diff_bright;
    else
      new_bright = current_bright - diff_bright;

    if (color > current_color)
      new_color = current_color + diff_color;
    else
      new_color = current_color - diff_color;

   // console.log(flat_number, new_bright, new_color, completed);

    this.changeColor(flat_number, new_bright, new_color, completed);

    if(!completed)
      setTimeout(
          () => this.smoothlyChangeColor(flat_number, bright, color),
          this.changeInterval
      );
    else {
      console.log("transformation of " + flat_number + " completed");
      let new_state = {
        lamps: this.state.lamps
      };

      new_state.lamps[flat_number].status = "LampStatus";

      this.setState(new_state);
    }

  };

  increaseLight = (count = 0, color = 3000, bright = 50) => {
    let interval = 3000;

    setTimeout(
        () => {
          socket.emit("update_light", {
            level: bright,
            temp: color
          });
          console.log(count, color, bright);

          if(count < 5){
            count++;
            color += 800;
            bright += 10;
            setTimeout(
                () => this.increaseLight(count, color, bright),
                interval
            );
          } else {
            setTimeout(
                () => socket.emit("blink", {}),
                10000
            );
          }
        },
        interval
    );
  };

  move_man = (from, to) => {
    let strFrom = this.roomId2Name[from];
    let strTo = this.roomId2Name[to];
    this.setState({status: `moving from ${strFrom} to ${strTo}`});

    this.manRef.current.run_move(from, to);
    setTimeout(
        () => this.setState({status: "Idle"}),
        4000
    );
  };

  manualScenat = () => {
    // setTimeout(() => this.changeColor(1, 0, 0), 1000);
    // setTimeout(() => this.changeColor(1, 100, 5000), 1300);
    // setTimeout(() => this.changeColor(1, 0, 0), 1600);
    // setTimeout(() => this.changeColor(1, 100, 5000), 1900);
    setTimeout(() => this.smoothlyChangeColor(2, 100, 2700), 1);
    setTimeout(() => this.move_man(0, 2), 10);
    setTimeout(() => this.move_man(2, 1), 5000);
    setTimeout(() => this.smoothlyChangeColor(1, 100, 2700), 6000);
    setTimeout(() => this.smoothlyChangeColor(2, 0, 2700), 7000);
    setTimeout(() => this.move_man(1, 2), 11000);
    setTimeout(() => this.smoothlyChangeColor(2, 100, 2700), 12000);
    setTimeout(() => this.smoothlyChangeColor(1, 0, 2700), 13000);
    setTimeout(() => this.move_man(2, 3), 16000);
    setTimeout(() => this.smoothlyChangeColor(3, 100, 2700), 17000);
    setTimeout(() => this.smoothlyChangeColor(2, 0, 2700), 18000);
    setTimeout(() => this.move_man(3, 2), 21000);
    setTimeout(() => this.smoothlyChangeColor(2, 100, 2700), 22000);
    setTimeout(() => this.smoothlyChangeColor(3, 0, 2700), 23000);
    setTimeout(() => this.move_man(2, 1), 26000);
    setTimeout(() => this.smoothlyChangeColor(1, 100, 2700), 27000);
    setTimeout(() => this.smoothlyChangeColor(2, 0, 2700), 28000);
    setTimeout(() => this.smoothlyChangeColor(1, 100, 5000), 31000);
    setTimeout(() => this.changeColor(1, 0, 0, true), 35000, );
    setTimeout(() => this.changeColor(1, 100, 5000, true), 35100,);
    setTimeout(() => this.changeColor(1, 0, 0, true), 35200,);
    setTimeout(() => this.changeColor(1, 100, 5000, true), 35300, );
  };

  componentDidMount() {
    socket.on("update", data => {
      console.log(data);
      this.smoothlyChangeColor(
          data.id+1,
          data.level,
          data.temp
      );
    });

    socket.on("remote_smart_demo", (data) => {
      console.log("increase light start");
      this.increaseLight();
    });

    socket.on("move", data => {
      console.log(data);

      let from = this.name2RoomId[data.frm];
      let to = this.name2RoomId[data.to];

      if(this.current !== from || from === to){
        return;
      }

      this.current = to;

      this.move_man(from, to);

      if(from !== 0) {
        setTimeout(
            this.smoothlyChangeColor(from, 0, 2700),
            2000
        );
      }
      this.smoothlyChangeColor(to, 100, 2700);
    });

    this.manualScenat();
  }

  render = () => {
    return (
        <div className="App">
          <header className="App-header">
            <div style={backStyle}>
              <Man ref={this.manRef}/>
              {
                Object.keys(this.state.lamps).map((key, index) => {
                  let lamp = this.state.lamps[key];

                  return <div key={index} style={generateStyle(key, lamp.bright, lamp.color)}>
                  </div>
                })
              }
            </div>
            <div className="TitleBar">
              <div className="TitleLampsBar">
                <div className={this.state.lamps[1].status}>
                  <div className="LampName">
                  <span>
                    Lamp1
                  </span>
                  </div>
                  <div className="LampParams" >
                    <div className="LampParam">
                    <span>
                      T = {this.state.lamps[1].color}
                    </span>
                    </div>
                    <div className="LampParam">
                    <span>
                      B = {this.state.lamps[1].bright}
                    </span>
                    </div>
                  </div>
                </div>
                <div className={this.state.lamps[2].status}>
                  <div className="LampName">
                  <span>
                    Lamp2
                  </span>
                  </div>
                  <div className="LampParams" >
                    <div className="LampParam">
                    <span>
                      T = {this.state.lamps[2].color}
                    </span>
                    </div>
                    <div className="LampParam">
                    <span>
                      B = {this.state.lamps[2].bright}
                    </span>
                    </div>
                  </div>
                </div>
                <div className={this.state.lamps[3].status}>
                  <div className="LampName">
                  <span>
                    Lamp3
                  </span>
                  </div>
                  <div className="LampParams" >
                    <div className="LampParam">
                    <span>
                      T = {this.state.lamps[3].color}
                    </span>
                    </div>
                    <div className="LampParam">
                    <span>
                      B = {this.state.lamps[3].bright}
                    </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="StatusBar">
                <span>
                  {this.state.status}
                </span>
              </div>
            </div>
          </header>
        </div>
    );
  }
}

export default App;
