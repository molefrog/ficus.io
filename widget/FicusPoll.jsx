import React from "react";

import ClassicPoll from "./ClassicPoll/ClassicPoll.jsx";
import BubblePoll from "./BubblePoll/BubblePoll.jsx";
import BarPoll from "./BarPoll/BarPoll.jsx";

const Polls = {
  classic: ClassicPoll,
  bubble: BubblePoll,
  bar: BarPoll,
};

/**
 * Entry point for the Ficus Poll widget
 * TODO: resize (fit/fill), theme (font, colors, etc.)
 * */
export const FicusPoll = ({ config, votes, type }) => {
  const Component = Polls[type] || Polls.classic;

  const normalizedVotes = votes.map((vote) => {
    const val = vote.answers || vote.answer;
    return { ...vote, answer: undefined, answers: Array.isArray(val) ? val : [val] };
  });

  const summary = pollSummary(config, normalizedVotes);

  return (
    <Component
      width="1024px"
      height="768px"
      config={config}
      votes={normalizedVotes}
      summary={summary}
    />
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
