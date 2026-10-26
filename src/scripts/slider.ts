// Keeps each slider's <output> showing the value it stands for. Nothing else: a topic listens to
// the native `input` event on the slider and does its own calculation (and may rewrite the output).
import { sliderToValue } from '../lib/scale';
import { formatNumberHtml } from '../lib/format';

const locale = document.documentElement.lang === 'en' ? 'en' : 'fr';

document.addEventListener('input', ({ target }) => {
  if (!(target instanceof HTMLInputElement) || target.type !== 'range') return;
  const out = document.getElementById(`${target.id}-out`);
  if (!out || target.dataset.scale === undefined) return;
  const value = sliderToValue(Number(target.value), target.dataset.scale === 'log' ? 'log' : 'linear');
  out.innerHTML = formatNumberHtml(value, locale);
});
