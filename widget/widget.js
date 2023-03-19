import { h, render } from "preact";
import { FicusPoll } from "./FicusPoll";

// framework agnostic polls
export const createPoll = (element, { votes, ...rest }) => {
  const props = { votes: votes || [], ...rest };
  render(h(FicusPoll, props), element);

  return [
    // update
    ({ votes }) => {
      render(h(FicusPoll, { votes, ...rest }), element);
    },

    // unmount
    () => render(null, element),
  ];
};
