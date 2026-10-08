import army from '../DarkElfArmy.json';

const units = army.filter((entry) => entry.Composition !== 'Mount');
const selectors = document.querySelector('#unit-selectors');
const placeholder = document.querySelector('#placeholder-page');

function line(text, className = '') {
  const p = document.createElement('p');
  p.textContent = text;
  p.className = className;
  return p;
}

function createSelector(side) {
  const panel = document.createElement('section');
  panel.className = 'unit-panel';
  panel.setAttribute('aria-label', `${side} unit`);
  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Select a unit…';
  input.autocomplete = 'off';
  input.setAttribute('aria-label', `Search ${side.toLowerCase()} unit`);
  const matches = document.createElement('div');
  matches.className = 'unit-matches';
  matches.id = `${side.toLowerCase()}-matches`;
  input.setAttribute('aria-controls', matches.id);
  const details = document.createElement('div');
  details.className = 'unit-details';
  details.setAttribute('aria-live', 'polite');
  let selected = null;

  function select(unit) {
    selected = unit;
    input.value = unit.Name;
    details.replaceChildren(
      line(unit.Name, 'unit-name'),
      line(`${unit.Composition} · ${unit['Troop Type']}`),
      line(unit.Description, 'unit-description'),
      line(unit['Special Rules'].join(', ')),
      line(unit.Equipment.join(', ')),
    );
    const options = document.createElement('div');
    options.className = 'unit-options';
    unit.Options.forEach((option) => {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      const text = document.createElement('span');
      let cost = '';
      if (option.Points === 0) cost = ' — Free';
      if (option.Points > 0) cost = ` — +${option.Points} ${option.Points === 1 ? 'point' : 'points'} ${option['Cost Basis'].toLowerCase()}`;
      if (option['Maximum Points']) cost = ` — up to ${option['Maximum Points']} points`;
      text.textContent = option.Name + cost;
      label.append(checkbox, text);
      options.append(label);
    });
    details.append(options);
    input.focus();
    matches.hidden = true;
  }

  function showMatches() {
    const query = input.value.trim().toLowerCase();
    const remaining = units.filter((unit) => unit.Name.toLowerCase().includes(query));
    matches.replaceChildren();
    matches.hidden = false;
    if (!remaining.length) matches.append(line('No matching units.'));
    remaining.forEach((unit) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = unit.Name;
      button.addEventListener('click', () => select(unit));
      matches.append(button);
    });
  }

  input.addEventListener('input', () => {
    if (selected && input.value !== selected.Name) {
      selected = null;
      details.replaceChildren();
    }
    showMatches();
  });
  input.addEventListener('focus', showMatches);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') matches.hidden = true;
    if (event.key === 'ArrowDown') {
      showMatches();
      matches.querySelector('button')?.focus();
      event.preventDefault();
    }
    if (event.key === 'Enter' && !matches.hidden) {
      matches.querySelector('button')?.click();
      event.preventDefault();
    }
  });
  panel.addEventListener('focusout', (event) => {
    if (!panel.contains(event.relatedTarget)) matches.hidden = true;
  });
  panel.append(input, matches, details);
  showMatches();
  return panel;
}

selectors.append(createSelector('Left'), createSelector('Right'));

const pages = {
  '/': 'Dark Elf Odds Calculator',
  '/advice': 'Advice',
  '/about': 'About',
};

function renderPage({ focus = false } = {}) {
  const route = window.location.hash.slice(1) || '/';
  const title = pages[route] || 'Page not found';
  document.querySelector('#page-title').textContent = title;
  selectors.hidden = route !== '/';
  placeholder.hidden = route === '/';
  placeholder.querySelector('p').textContent = pages[route]
    ? 'coming soon.'
    : 'Use the header links to return to the site.';
  document.title = route === '/' ? 'ToW Dark Elves' : `${title} | ToW Dark Elves`;

  document.querySelectorAll('.site-header nav a').forEach((link) => {
    if (link.hash === `#${route}`) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  if (focus) document.querySelector('#page').focus({ preventScroll: true });
}

window.addEventListener('hashchange', () => renderPage({ focus: true }));
renderPage();
