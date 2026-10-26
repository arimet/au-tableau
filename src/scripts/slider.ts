// Echoes each slider's own value into its <output id="<id>-out"> and into aria-valuetext (a log
// slider's native value is the exponent). Nothing else: a topic listens to the native `input` event
// and shows its calculation in an element of its own, never in this output.
import { sliderToValue } from '../lib/scale';
import { formatNumberHtml, formatNumberText } from '../lib/format';

const locale = document.documentElement.lang === 'en' ? 'en' : 'fr';

const echo = (input: HTMLInputElement) => {
  const out = document.getElementById(`${input.id}-out`);
  if (!out || input.dataset.scale === undefined) return;
  const value = sliderToValue(Number(input.value), input.dataset.scale === 'log' ? 'log' : 'linear');
  out.innerHTML = formatNumberHtml(value, locale);
  input.setAttribute('aria-valuetext', formatNumberText(value, locale));
};

document.querySelectorAll<HTMLInputElement>('input[type="range"][data-scale]').forEach(echo);
document.addEventListener('input', ({ target }) => {
  if (target instanceof HTMLInputElement && target.type === 'range') echo(target);
});
