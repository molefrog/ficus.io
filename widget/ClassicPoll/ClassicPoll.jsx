import { h } from "preact";
import styles from "./ClassicPoll.module.css";

const ClassicPoll = ({ config, summary, width, height }) => {
  return (
    <div className={styles.poll} style={{ width, height }}>
      <div className={styles.question}>{config.question}</div>

      {config.url && (
        <div className={styles.subheader}>
          Please visit
          <span className={styles.subheaderLink}>{config.url}</span>
          {" to vote"}
        </div>
      )}

      <div className={styles.results}>
        {summary.results.map(({ answer, percentage }) => (
          <div key={answer.id} className={styles.result}>
            <div className={styles.line}>
              <div className={styles.resultHeader}>{answer.label}</div>

              <div className={styles.progressWrap}>
                <div
                  className={styles.progress}
                  style={{
                    backgroundColor: answer.color,
                    transform: `scaleX(${Math.max(0.02, percentage)})`,
                  }}
                />
              </div>
            </div>

            <div className={styles.percent}>{`${(percentage * 100).toFixed(0)}%`}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassicPoll;
