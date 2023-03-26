import { h, render } from "preact";
import { Poll } from "./Poll/Poll";

// framework agnostic polls
export const createPoll = (element, props) => {
  const { votes, ...config } = props;

  // mount and render
  render(h(Poll, props), element);

  return [
    // update
    ({ votes }) => render(h(Poll, { votes, ...config }), element),

    // unmount
    () => render(null, element),
  ];
};

export { Poll as PreactPoll };
