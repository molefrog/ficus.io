import { h, Component } from "preact";
import { forceSimulation, forceCollide, forceCenter } from "d3-force";

import pointForce from "./point-force";

class BubblePoll extends Component {
  componentDidUpdate() {
    const answers = this.props.votes.flatMap((vote) => vote.answers);

    this.nodes = answers.map((answer, idx) => {
      const radius = Math.random() * 4 + 6;
      let node = this.nodes[idx] ? this.nodes[idx] : {};

      return {
        r: Math.random() * 4 + 10,
        x: 0,
        y: 0,
        ...node,
        choice: answer,
      };
    });

    this.choicesIds = this.props.config.answers.map((ch) => ch.id);

    this.simulation.stop();
    this.simulation.nodes(this.nodes);
    this.simulation.restart();
  }

  componentWillUnmount() {
    this.simulation.stop();
  }

  onTick() {
    const canvas = this.pollEl.querySelector("canvas");
    const context = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(width / 2, height / 2);

    this.props.config.answers.forEach((choice) => {
      context.beginPath();

      this.nodes.forEach(function (d) {
        if (d.choice === choice.id) {
          context.moveTo(d.x + d.r, d.y);
          context.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
        }
      });

      context.fillStyle = choice.color;
      context.fill();
    });

    context.restore();
  }

  nodeTarget(node) {
    const r = 220;

    const idx = this.choicesIds.indexOf(node.choice);

    return [
      r * Math.cos((idx * 2 * Math.PI) / this.choicesIds.length),
      r * Math.sin((idx * 2 * Math.PI) / this.choicesIds.length),
      0.015,
    ];
  }

  componentDidMount() {
    const { votes, config } = this.props;

    this.nodes = votes.flatMap((vote) => {
      const radius = Math.random() * 4 + 6;

      return vote.answers.map((answer) => ({
        r: radius,
        choice: answer,
      }));
    });

    this.choicesIds = config.answers.map((ch) => ch.id);

    this.simulation = forceSimulation(this.nodes)
      .velocityDecay(0.2)
      .alphaDecay(0.00001)
      .force(
        "target",
        pointForce((x) => this.nodeTarget(x))
      )
      .force(
        "collide",
        forceCollide()
          .radius(function (d) {
            return d.r + 3;
          })
          .iterations(2)
      )
      .force("center", forceCenter())
      .on("tick", () => this.onTick());
  }

  render() {
    return (
      <div
        ref={(e) => {
          this.pollEl = e;
        }}
        style={{ width: this.props.width, height: this.props.height }}
      >
        <canvas width={this.props.width} height={this.props.height} />
      </div>
    );
  }
}

export default BubblePoll;
