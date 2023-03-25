import randomColor from "randomcolor";

/**
 * Transforms the user-provided config into a normalized form, allowing
 * both the short and long forms of the `answers` array.
 *
 * @param config poll configuration object provided by the user
 * @returns normalized poll configuration
 */
export const normalizePollConfig = ({ question, url, answers } = {}) => {
  console.assert(
    Array.isArray(answers) && typeof question === "string",
    "`config` must be an object and must contain the following keys: `question` (string) and `answers` (array of objects)"
  );

  const predefinedColors = randomColor({ count: 10, seed: answers.length });

  return {
    question,
    url,

    /**
     * Possible forms of `answers`:
     * 1. ["Yes", "No"]
     *
     * 2. [{ label: "Yes" }, { label: "No", color: "red" }]
     *
     * 3. [{ id: '0', label: "Yes", color: "blue" },
     *     { id: '1', label: "No", color: "red" }]
     */
    answers: answers.map((answer, index) => {
      if (typeof answer === "string") answer = { label: answer };

      const id = answer.id || String(index);
      const color = answer.color || predefinedColors[index];

      return { id, label: answer.label, color };
    }),
  };
};

/**
 * Normalizes the user-provided array of votes, filters out the invalid ones
 *
 * Allowed forms:
 * 1. ['id1', 'id2']
 * 2. [{ answer: 'id1' }, { answer: 'id2' }]
 * 3. [{ id: 'id1', answer: 'id2' }, { id: 'id2', answer: 'id3' }]
 *
 * @param votes user-defined votes
 * @param config normalized poll configuration
 */
export const normalizePollVotes = (config, votes) => {
  console.assert(Array.isArray(votes), "`votes` must be an array of objects or ids of the answers");

  const allowedAnswers = new Set(config.answers.map((answer) => answer.id));

  const withFilteredAnswers = votes.map((vote, index) => {
    if (typeof vote === "string") vote = { answer: vote };

    const val = vote.answers || vote.answer; // both forms are allowed
    const answers = Array.isArray(val) ? val : [val];

    const id = String(vote.id || index);

    return {
      id,

      // include only answers that are present in the config
      answers: answers.filter((a) => allowedAnswers.has(a)),
    };
  });

  return withFilteredAnswers.filter((vote) => vote.answers.length > 0);
};
