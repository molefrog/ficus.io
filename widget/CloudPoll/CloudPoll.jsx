import { h, Component, Fragment } from "preact";

import { select as d3select } from "d3-selection";
import { sum as d3sum } from "d3-array";
import { easeCubic, easeBack, easeElastic } from "d3-ease";
import "d3-transition";

import styles from "./CloudPoll.module.css";

const NAME_WIDTH = 350;
const BARS_MARGIN = 15;
const BAR_MIN_VALUE = 0.05;

const BALLS_ANIM_DURATION = 1000;
const REORDER_ANIM_DURATION = 500;
const BAR_GROW_ANIM_DURATION = 500;

class CloudPoll extends Component {
  render() {
    const { config, summary, width, height } = this.props;

    return (
      <div
        className={styles.poll}
        style={{ width, height }}
        ref={(n) => {
          this.$el = n;
        }}
      >
        <div className={styles.pollQuestion}>{config.question}</div>
        <div
          className={styles.ballsContainer}
          ref={(n) => {
            this.$ballsContainer = n;
          }}
        />
        <div className={styles.layout}>
          <div
            className={styles.contenders}
            ref={(n) => {
              this.$contenders = n;
            }}
          />
          <div className={styles.summary}>
            <div className={styles.alreadyVoted}>
              <div
                className={styles.number}
                ref={(n) => {
                  this.$alreadyVotedNumber = n;
                }}
              >
                {summary.totalParticipants}
              </div>
              {config.url ? (
                <>
                  <div className={styles.label}>votes on</div>
                  <div className={styles.labelLink}>{config.url}</div>
                </>
              ) : (
                <>
                  <div className={styles.label}>votes</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cals the difference to animate the particles
  // [
  //   { id: 1, count: 3 },
  //   { id: 2, count: -2 }
  // ]
  votersDiff(prevProps) {
    if (!prevProps || !prevProps.summary || !this.props.summary) {
      return [];
    }

    let diff = [];

    for (const { answer, votesForAnswer } of this.props.summary.results) {
      const previousResult = prevProps.summary.results.find(
        (result) => result.answer.id === answer.id
      );

      const votesBefore = previousResult ? previousResult.votesForAnswer : 0;
      const count = votesForAnswer - votesBefore;

      diff.push({
        id: answer.id,
        count,
      });
    }

    return diff.filter((x) => x.count !== 0);
  }

  // Calc the max value for the X axis
  calcBoundary() {
    const max = Math.max(...this.props.summary.results.map((r) => r.votesForAnswer));
    return 10 * Math.ceil(max / 10);
  }

  componentDidMount() {
    this.updateVotes();
  }

  componentDidUpdate(prevProps) {
    this.updateVotes(prevProps);
  }

  // gets offset relative to the container
  relativeOffset(el) {
    let x = 0;
    let y = 0;

    while (el && el !== this.$el) {
      x += el.offsetLeft;
      y += el.offsetTop;
      el = el.offsetParent;
    }

    return [x, y];
  }

  updateVotes(prevProps) {
    const { summary, alphaTime } = this.props;
    const newVotes = this.votersDiff(prevProps);

    const contendersHeight = this.$contenders.offsetHeight;
    const contendersWidth = this.$contenders.offsetWidth;

    const barMaxWidth = contendersWidth - NAME_WIDTH - 20;
    const entries = summary.results.sort((a, b) => b.votesForAnswer - a.votesForAnswer);

    let root = d3select(this.$contenders);
    const max = this.calcBoundary();

    let ballsEnter = d3select(this.$ballsContainer)
      .selectAll(`.${styles.ball}`)
      .data(newVotes, (d) => `${d.id} ${d.count}`)
      .enter()
      .append("div")
      .attr("class", styles.ball);

    ballsEnter
      .transition()
      .duration(alphaTime * BALLS_ANIM_DURATION)
      .delay((d, i) => alphaTime * 100 * i)
      .attrTween("style", (d, i) => {
        return (t) => {
          let aEl = this.$alreadyVotedNumber;
          let bEl = this.$el.querySelector(`[data-id="${d.id}"] .${styles.entryCount}`);

          if (!aEl || !bEl) {
            return;
          }

          //  TODO!
          const aOffset = this.relativeOffset(aEl);
          const bOffset = this.relativeOffset(bEl);

          const aX = aOffset[0] + 0.5 * aEl.offsetWidth;
          const aY = aOffset[1] + 0.5 * aEl.offsetHeight;

          const bX = bOffset[0] + 0.5 * bEl.offsetWidth;
          const bY = bOffset[1] + 0.5 * bEl.offsetHeight;

          let tx = easeCubic(t);
          let ty = t;

          if (d.count < 0) {
            tx = 1 - tx;
            ty = 1 - ty;
          }

          const x = aX + (bX - aX) * tx;
          const y = aY + (bY - aY) * ty;

          const CP_1 = 0.2;
          const CP_2 = 0.01;

          let scale = 1.0;
          let opacity = 1.0;

          if (t >= 0 && t <= CP_1) {
            opacity = t / CP_1;
            scale = opacity;
          }

          if (t >= 1.0 - CP_2 && t <= 1.0) {
            opacity = 1 - (t - (1.0 - CP_2)) / CP_2;
            scale = opacity;
          }

          let transform = `translate3d(${x}px, ${y}px, 0px) scale(${scale}, ${scale})`;

          return `
             opacity: ${opacity};
             transform: ${transform};
          `;
        };
      })
      .remove();

    // animate exploding particles
    const scaleTween = (a, b) => {
      return (t) => {
        let x = a + (b - a) * t;
        return `transform: scale(${x}, ${x})`;
      };
    };

    ballsEnter.each((data, i) => {
      let optionId = data.id;

      let entrySelect = root.select(`.${styles.entry}[data-id="${optionId}"]`);

      const scaleRatio = 1.3;

      entrySelect
        .select(`.${styles.entryCount}`)
        .transition()
        .delay(data.count > 0 ? alphaTime * 600 + alphaTime * 100 * i : 0)
        .duration(alphaTime * 300)
        .ease(easeBack)
        .attrTween("style", (d, i) => {
          return scaleTween(1.0, scaleRatio);
        })
        .on("end", function () {
          d3select(this)
            .transition()
            .duration(alphaTime * 600)
            .ease(easeElastic)
            .attrTween("style", () => scaleTween(scaleRatio, 1.0));
        });
    });

    // Flash counter animation
    if (newVotes.length > 0) {
      this.$alreadyVotedNumber.classList.remove(styles.flashAnimation);
      setTimeout(() => {
        this.$alreadyVotedNumber.classList.add(styles.flashAnimation);
      }, 0);
    }

    let entry = root.selectAll(`.${styles.entry}`).data(entries, (e) => e.answer.id);

    let barWidthFunc = (d, i) => {
      let x = max !== 0 ? d.votesForAnswer / max : 0;

      let bmin = BAR_MIN_VALUE * barMaxWidth;
      let w = bmin + (barMaxWidth - bmin) * x;
      let r = `${w.toFixed(0)}px`;

      return r;
    };

    let entryEnter = entry
      .enter()
      .append("div")
      .attr("class", styles.entry)
      .attr("data-id", (d) => d.answer.id)
      .html(
        (d) =>
          `
          <div class="${styles.entryName}">${d.answer.label}</div>
          <div class="${styles.entryVotes}" style="width: ${barWidthFunc(d)}"></div>
          <div class="${styles.entryCount}">${d.votesForAnswer}</div>
        `
      );

    entry.exit().remove();

    let elemHeights = [];
    root.selectAll(`.${styles.entry}`).each(function () {
      elemHeights.push(this.offsetHeight);
    });

    let positionFunc = (d, i) => {
      let fullHeight = d3sum(elemHeights, (h) => h + BARS_MARGIN);
      let elemOffset = d3sum(elemHeights.slice(0, i), (h) => h + BARS_MARGIN);

      let y = 0.5 * contendersHeight - 0.5 * fullHeight + elemOffset;
      return `${y}px`;
    };

    entryEnter.style("top", positionFunc);

    entry
      .select(`.${styles.entryVotes}`)
      .transition()
      .delay(alphaTime * BALLS_ANIM_DURATION)
      .duration(alphaTime * BAR_GROW_ANIM_DURATION)
      .style("width", barWidthFunc);

    entry
      .transition()
      .duration(alphaTime * REORDER_ANIM_DURATION)
      .delay(alphaTime * (BALLS_ANIM_DURATION + BAR_GROW_ANIM_DURATION))
      .style("top", positionFunc);

    entry
      .select(`.${styles.entryCount}`)
      .transition("text-trans")
      .delay(alphaTime * BALLS_ANIM_DURATION)
      .text((d) => d.votesForAnswer);
  }
}

CloudPoll.defaultProps = {
  alphaTime: 1.0,
};

export default CloudPoll;
