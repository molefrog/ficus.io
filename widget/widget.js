import { h, render } from "preact";
import { Poll } from "./Poll/Poll";

// framework agnostic polls
export const createPoll = (element, { votes, ...rest }) => {
  const props = { votes: votes || [], ...rest };
  render(h(Poll, props), element);

  return [
    // update
    ({ votes }) => {
      render(h(Poll, { votes, ...rest }), element);
    },

    // unmount
    () => render(null, element),
  ];
};
