import { LitElement, css, html } from 'lit';
import MiniSearch from 'minisearch';

const miniSearch = new MiniSearch({
  fields: ['title', 'headline', 'body', 'section'], // fields to index for full-text search
  storeFields: ['title', 'headline', 'body', 'section'], // fields to return with search results
  searchOptions: {
    boost: { headline: 3, title: 2, section: 1 },
    fuzzy: 0.2,
    prefix: true,
  },
});

const docBlocks = new Map();
function indexDoc(content: string, { file, title, section, base }) {
  if (docBlocks.has(file)) miniSearch.removeAll(docBlocks.get(file));
  let heading: RegExpExecArray;
  const headingRE = /^\n?(#*)\s+(.*)\n\n([^#]*)/gm;
  const blocks = [];
  while ((heading = headingRE.exec(content))) {
    const [, level, headline, body] = heading;
    let url = base + file;
    if (level.length > 1) url += `#\${headline.toLowerCase()}`;
    blocks.push({ id: url, title, section, headline, body });
  }
  docBlocks.set(file, blocks);
  miniSearch.addAll(blocks);
}

class SearchBox extends LitElement {
  placeHolder = window.navigator.platform === 'MacIntel' ? '⌘K' : 'Ctrl+K';

  get searchInput(): HTMLInputElement {
    return this.shadowRoot.querySelector('#search-input');
  }

  get searchHits(): HTMLUListElement {
    return this.shadowRoot.querySelector('#search-hits');
  }

  get searchBox(): HTMLDivElement {
    return this.shadowRoot.querySelector('#search-box');
  }

  get searchOverlay(): HTMLDivElement {
    return this.shadowRoot.querySelector('#search-overlay');
  }

  constructor() {
    super();
    this.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.updateHits();
      } else if (e.key === 'Escape') this.hideHits();
    });
  }

  set docs(value: string[]) {
    const all = value.map((k) => [k + '?raw', k + '?docmeta']);
    for (const [docContent, docMeta] of all || []) {
      Promise.all([
        import(/* @vite-ignore */ docContent),
        import(/* @vite-ignore */ docMeta),
      ]).then(([{ default: content }, meta]) => indexDoc(content, meta));
    }
  }

  render() {
    return html`<div id="search-box">
      <form action="" role="search" novalidate="">
        <label for="search-input" aria-label="Search">
          <input
            aria-autocomplete="list"
            id="search-input"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            :placeholder="placeholder"
            maxlength="64"
            type="search"
            enterkeyhint="go"
            placeholder=${this.placeHolder}
            @input=${(e: { target: { value: string } }) =>
              this.updateHits(e.target.value)}
            @focus=${(e: { target: { value: string } }) =>
              this.updateHits(e.target.value)}
          />
        </label>
      </form>
      <ul id="search-hits"></ul>
      <div id="search-overlay" @click=${() => this.hideHits()}></div>
    </div>`;
  }

  hitHTML(hit) {
    return `<a href="${hit.id}">
    <header>
      ${hit.headline}
      <span class="section">
        ${hit.title ? `<span>${hit.title}</span>` : ''}
        ${hit.section ? `<span>${hit.section}</span>` : ''}
      </span>
    </header>
    ${hit.body ? `<code>${hit.body}</code>` : ''}
  </a>`;
  }

  async updateHits(searchValue?: string) {
    if (!searchValue) {
      this.searchHits.innerHTML = `<li><i>Type for searching...</i></li>`;
    } else {
      const hits = await miniSearch.search(searchValue).slice(0, 10);
      if (hits.length > 0) {
        let i = 0;
        for (; i < hits.length; i++) {
          const hit = this.transform(hits[i]);
          let searchHitItem = this.searchHits.childNodes[i] as HTMLElement;
          if (!searchHitItem) {
            searchHitItem = document.createElement('li') as HTMLLIElement;
            searchHitItem.innerHTML = this.hitHTML(hit);
            this.searchHits.appendChild(searchHitItem);
          } else searchHitItem.innerHTML = this.hitHTML(hit);
        }
        for (; i < this.searchHits.childNodes.length; i++)
          this.searchHits.childNodes[i].remove();
      } else {
        this.searchHits.innerHTML = `<li><i>No match found</i></li>`;
      }
    }
    this.searchOverlay.style.display = 'block';
    this.searchHits.style.display = 'block';
    this.searchInput.focus();
    this.searchInput.placeholder = '';
  }

  transform(hit) {
    hit.body = !hit.body
      ? ''
      : hit.body.length < 100
      ? hit.body
      : hit.body.slice(0, 100) + '...';
    hit.body = hit.body.replace(/</gm, '&lt;');
    for (const t of hit.terms.sort((a, b) => b.length - a.length)) {
      for (const m of hit.match[t]) {
        hit[m] = hit[m].replace(
          new RegExp(` (${t}) `, 'gi'),
          ' <strong class="highlight">$1</strong> '
        );
      }
    }
    return hit;
  }

  hideHits() {
    this.searchHits.style.display = 'none';
    this.searchOverlay.style.display = 'none';
    this.searchInput.value = '';
    this.searchInput.placeholder = this.placeHolder;
  }

  static get styles() {
    return css`
      #search-box {
        position: relative;
        flex-grow: 1;
        margin-left: 1rem;
      }

      #search-box form {
        z-index: 11;
        display: flex;
        align-items: center;
      }

      #search-box form label {
        position: relative;
        width: 100%;
      }

      #search-box form label:before {
        content: '';
        z-index: 12;
        position: absolute;
        left: 10px;
        top: 0;
        bottom: 0;
        width: 20px;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 20 20' fill-rule='evenodd'%3E%3Cpath d='M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z' stroke='grey' fill='none' fill-rule='evenodd' stroke-linecap='round' stroke-linejoin='round' %3E%3C/path%3E%3C/svg%3E")
          center / contain no-repeat;
      }

      #search-overlay {
        display: none;
        position: fixed;
        z-index: 10;
        background-color: rgba(0, 0, 0, 0.1);
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }

      #search-label {
        padding: 0.5rem;
        display: flex;
      }

      #search-input {
        border: 1px solid var(--c-divider-dark, #e5e5e5);
        border-radius: 0.5rem;
        padding: 0.5rem;
        padding-left: 2.5rem;
        width: 100%;
        z-index: 11;
        position: relative;
        background: var(--c-bg-light, #fff);
        font-size: large;
        color: inherit;
      }
      #search-input:focus {
        outline: 1px solid var(--c-brand);
      }
      #search-hits {
        display: none;
        position: absolute;
        right: 0;
        left: 0;
        list-style: none;
        overflow: auto;
        max-height: 70vh;
        border: 1px solid var(--c-divider-dark, #e5e5e5);
        background: var(--c-bg-light, #fff);
        z-index: 11;
        border-radius: 0.5rem;
        padding: 0.5rem;
        @media only screen and (max-width: 768px) {
          position: fixed;
        }
      }
      #search-hits a {
        color: inherit;
        text-decoration: none;
        display: block;
        border-radius: 0.25rem;
        padding: 0.5rem;
        border: 1px solid transparent;
      }
      #search-hits a:hover {
        border-color: var(--c-brand);
      }
      #search-hits li {
        border-bottom: 1px solid var(--c-divider-dark);
        margin: 0.5rem 0;
      }
      #search-hits .highlight {
        color: var(--c-brand);
      }
      #search-hits header {
        font-weight: semibold;
      }
      #search-hits header .section {
        opacity: 0.7;
        float: right;
      }
      #search-hits header .section > * {
        background: #eee;
        padding: 0.125rem 0.5rem;
        border-radius: 0.25rem;
      }
      #search-hits code {
        font-size: small;
        font-family: sans-serif !important;
      }
    `;
  }
}

customElements.define('doc-search', SearchBox);
