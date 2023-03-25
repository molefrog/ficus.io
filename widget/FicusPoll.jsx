import { h } from "preact";
import { useRef, useLayoutEffect } from "preact/hooks";

import ClassicPoll from "./ClassicPoll/ClassicPoll.jsx";
import BubblePoll from "./BubblePoll/BubblePoll.jsx";
import CloudPoll from "./CloudPoll/CloudPoll.jsx";
import BarPoll from "./BarPoll/BarPoll.jsx";

import { normalizePollConfig, normalizePollVotes } from "./state.js";

const Polls = {
  classic: ClassicPoll,
  bubble: BubblePoll,
  cloud: CloudPoll,
  bar: BarPoll,
};

// "4:2" => 0.5
const parseAspectRatio = (ratio) => {
  if (typeof ratio === "string") {
    const [width, height] = ratio.split(":");
    return parseInt(width) / parseInt(height);
  }

  return ratio;
};

/**
 * Entry point for the Ficus Poll widget
 * */
export const FicusPoll = ({ config, votes, type, className }) => {
  const Component = Polls[type] || Polls.classic;

  config = normalizePollConfig(config);
  votes = normalizePollVotes(config, votes);

  const summary = pollSummary(config, votes);

  const aspectRatio = parseAspectRatio(config.aspectRatio || "4:3");
  const baseWidth = 1024;

  const parentRef = useRef(null);

  const resize = useRef((parent = parentRef.current) => {
    const w = parent.offsetWidth;
    const slide = parent.childNodes[0];

    slide.style = `
      transform-origin: 0 0;
      top: 0;
      left: 0;
      position: absolute;
      transform: scale(${w / baseWidth})`;
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
      className={className}
      style={{
        paddingBottom: `calc(100% / ${aspectRatio})`,
        position: "relative",
        background: "white", // todo
      }}
    >
      <div>
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
