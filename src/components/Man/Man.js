import React from 'react';

import "./Man.css";

let ManSize = 15;

let manStyle = {
    position: "relative",
    borderRadius: ManSize / 2,
    borderColor: "#CB0032",
    width: ManSize,
    height: ManSize,
    backgroundColor: "#CB0032",
    animationDuration: "4s",
    animationTimingFunction: "linear",
    zIndex: 2
};

let position = {
    0: {
      x: 220,
      y: 420
    },
    1: {
        x: 150,
        y: 170
    },
    3: {
        x: 350,
        y: 150
    },
    2: {
        x: 220,
        y: 320
    }
}

let getStyle = (from, to, x ,y) => {
    return {
        ...manStyle,
        left: x,
        top: y,
        animationName: `animation_${from}_${to}`
    }
};


class Man extends React.Component {
    constructor()  {
        super();

        this.state = {
            from: 0,
            to: 0,
            x: 220,
            y: 420
        };
    }

    run_move = (from, to) => {
        let new_x = position[to].x;
        let new_y = position[to].y;
        console.log(new_x, new_y);

        this.setState({
            from: from,
            to: to,
            x: new_x,
            y: new_y
        });
    };

    render = () => {
        return (
            <div style={getStyle(this.state.from, this.state.to, this.state.x, this.state.y)}>

            </div>
        )
    }
}

export default Man;