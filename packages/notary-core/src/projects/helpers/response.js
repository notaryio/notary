const COLOR_RED = 'red';
const COLOR_GREEN = 'green';

const CONSOLE_SEQ_COLOR_RED = '\x1b[31m';
const CONSOLE_SEQ_COLOR_GREEN = '\x1b[32m';
const CONSOLE_SEQ_RESET_COLOR = '\x1b[0m';

export default {
  wrap(content, userAgent, color) {
    const useConsoleColors =
      userAgent.toLowerCase().includes('curl') || userAgent.toLowerCase().includes('wget');

    if (useConsoleColors) {
      let consoleColor = CONSOLE_SEQ_COLOR_GREEN;
      if (color === COLOR_RED) {
        consoleColor = CONSOLE_SEQ_COLOR_RED;
      }

      return `${consoleColor} \n\n` + content + `\n\n ${CONSOLE_SEQ_RESET_COLOR}`;
    } else {
      return (
        `<div style="color: ${color}"> <br /><br /> <pre>` + content + `</pre><br /><br /> </div>`
      );
    }
  },

  wrapSuccess(content, userAgent) {
    return this.wrap(content, userAgent, COLOR_GREEN);
  },

  wrapError(content, userAgent) {
    return this.wrap(content, userAgent, COLOR_RED);
  }
};
