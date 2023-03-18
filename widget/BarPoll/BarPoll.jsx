import React from "react";
import styles from "./BarPoll.module.css";

const Bar = ({ width, bar, bars }) => {
  // find the highest number of votes
  const maxVotes = Math.max(...bars.map((b) => b.votesForAnswer));

  // round up to the next 10
  const step = 10;
  const currentLimit = step * Math.ceil(maxVotes / step);

  // 0...100
  const height = Math.max(1, 100.0 * (currentLimit > 0 ? bar.votesForAnswer / currentLimit : 0));

  return (
    <div style={{ width: `${width}%` }} className={styles.bar}>
      <div className={styles.barToolip}>
        <div className={styles.barToolipInner}>
          {bar.votesForAnswer} · {(bar.percentage * 100.0).toFixed(1)}%
        </div>
      </div>

      <div
        className={styles.barProgress}
        style={{
          backgroundColor: bar.answer.color,
          height: `${height}%`,
        }}
      />
    </div>
  );
};

const BarPoll = ({ config, summary, width, height }) => {
  const bars = summary.results;
  const barWidth = 100.0 / (bars.length || 1);

  return (
    <div className={styles.poll} style={{ width, height }}>
      {config.url && (
        <div className={styles.subheader}>
          <div className={styles.subheaderInner}>
            {summary.totalVotes} votes on
            <span className={styles.subheaderLink}>{config.url}</span>
          </div>

          <div className={styles.total}>{summary.totalVotes}</div>
        </div>
      )}

      <div className={styles.header}>{config.question}</div>

      <div className={styles.votes}>
        <div className={styles.bars}>
          {bars.map((bar) => (
            <Bar key={bar.answer.id} bar={bar} bars={bars} width={barWidth} />
          ))}
        </div>

        <div className={styles.labels}>
          {bars.map((bar) => (
            <div style={{ width: `${barWidth}%` }} className={styles.labelCol} key={bar.answer.id}>
              <div className={styles.label}>{bar.answer.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarPoll;
