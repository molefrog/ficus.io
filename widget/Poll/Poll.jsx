import { h } from "preact";
import { useRef, useLayoutEffect } from "preact/hooks";

import ClassicPoll from "../ClassicPoll/ClassicPoll.jsx";
import BubblePoll from "../BubblePoll/BubblePoll.jsx";
import CloudPoll from "../CloudPoll/CloudPoll.jsx";
import BarPoll from "../BarPoll/BarPoll.jsx";

import styles from "./Poll.module.css";

import {
  normalizePollConfig,
  normalizePollVotes,
  themeToCSSVars,
  parseAspectRatio,
} from "./configuration.js";

const Polls = {
  classic: ClassicPoll,
  bubble: BubblePoll,
  cloud: CloudPoll,
  bar: BarPoll,
};

/**
 * Entry point for the Ficus Poll widget
 * */
export const Poll = ({ config, votes, type, theme = {}, className }) => {
  const Component = Polls[type] || Polls.classic;

  // makes sure that all polls receive their data in the same format
  config = normalizePollConfig(config);
  votes = normalizePollVotes(config, votes);

  // get the poll results based on the votes
  const summary = pollSummary(config, votes);

  // theming and customization
  const aspectRatio = parseAspectRatio(theme.aspectRatio || "4:3");
  const baseWidth = theme.baseWidth || 1024;
  const cssVarsInlineStyle = themeToCSSVars(theme);

  const parentRef = useRef(null);

  /**
   * Resize the poll to fit the parent container
   */
  const resize = useRef((parent = parentRef.current) => {
    const w = parent.offsetWidth;
    const slide = parent.childNodes[0];

    slide.style = `transform: scale(${w / baseWidth})`;
  });

  useLayoutEffect(() => {
    if (!parentRef.current) return;
    resize.current();

    const observer = new ResizeObserver((entries) => resize.current());
    observer.observe(parentRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={parentRef}
      className={`${styles.container} ${className}`}
      style={{
        // preserve aspect ratio
        paddingBottom: `calc(100% / ${aspectRatio})`,
        ...cssVarsInlineStyle,
      }}
    >
      <div className={styles.scaled}>
        <Component
          width={`${baseWidth}px`}
          height={`${baseWidth / aspectRatio}px`}
          config={config}
          votes={votes}
          summary={summary}
        />
      </div>
    </div>
  );
};

/*
 * Returns a summary of the poll results based on the given votes
 */
const pollSummary = (config, votes) => {
  const participants = new Set(votes.map((vote) => vote.id));
  const answers = votes.flatMap((vote) => vote.answers);

  const totalVotes = answers.length;

  const summary = {
    totalParticipants: participants.size,
    totalVotes,
    results: config.answers.map((answer) => {
      const votesForAnswer = answers.filter((a) => a === answer.id).length;
      const percentage = totalVotes > 0 ? votesForAnswer / totalVotes : 0;

      return { answer, votesForAnswer, percentage };
    }),
  };

  return summary;
};
