import { LitElement, css, html } from 'lit';

class SearchBox extends LitElement {
  search = null;
  hits = null;

  constructor() {
    super();
    this.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.updateHits();
      } else if (e.key === 'Escape') this.hideHits();
    });
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
      <ul id="search-hits">
        ${this.hits === null
          ? html`<li><i>Type for searching...</i></li>`
          : this.hits.length === 0
          ? html`<li><i>No match found</i></li>`
          : this.hits.map((hit) => html`<li>${this.hitHTML(hit)}</li>`)}
      </ul>
      <div id="search-overlay" @click=${() => this.hideHits()}></div>
    </div>`;
  }

  hitHTML(hit) {
    return html`<a href="${hit.id}">
      <header>
        ${hit.headline}
        <span class="tags">
          ${hit.title ? `<span>${hit.title}</span>` : ''}
          ${hit.section ? `<span>${hit.section}</span>` : ''}
        </span>
      </header>
      ${hit.body ? html`<textarea value=${hit.body}></textarea>` : ''}
    </a>`;
  }

  async updateHits(searchValue?: string) {
    if (!searchValue) {
      this.hits = null;
    } else {
      this.hits = (await this.search?.(searchValue))
        .filter(Boolean)
        .slice(0, 10)
        .map(this.highlight);
    }
    this.searchOverlay.style.display = 'block';
    this.searchHits.style.display = 'block';
    this.searchInput.focus();
    this.searchInput.placeholder = '';
  }

  highlight(hit) {
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

  get placeHolder() {
    return window.navigator.platform === 'MacIntel' ? '⌘K' : 'Ctrl+K';
  }

  get searchInput(): HTMLInputElement {
    return this.shadowRoot.querySelector('#search-input');
  }

  get searchHits(): HTMLUListElement {
    return this.shadowRoot.querySelector('#search-hits');
  }

  get searchOverlay(): HTMLDivElement {
    return this.shadowRoot.querySelector('#search-overlay');
  }

  static get styles() {
    return css`
      :host {
        --c-bg-color: var(--dockit-layout-bg);
        --c-border-color: var(--dockit-layout-header-border-color);
      }
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
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 20 20' fill-rule='evenodd'%3E%3Cpath d='M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z' stroke='gray' fill='none' fill-rule='evenodd' stroke-linecap='round' stroke-linejoin='round' %3E%3C/path%3E%3C/svg%3E")
          center / contain no-repeat;
      }
      #search-overlay {
        display: none;
        position: fixed;
        z-index: 10;
        background-color: #1f1f1f0f;
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
        border: 1px solid var(--c-border-color);
        border-radius: 0.5rem;
        padding: 0.5rem;
        padding-left: 2.5rem;
        width: 100%;
        z-index: 11;
        position: relative;
        background: var(--c-bg-color);
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
        border: 1px solid var(--c-border-color);
        background: var(--c-bg-color);
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
        border-bottom: 1px solid var(--c-border-color);
        margin: 0.5rem 0;
      }
      #search-hits .highlight {
        color: var(--c-brand);
      }
      #search-hits header {
        font-weight: semibold;
      }
      #search-hits header .tags {
        opacity: 0.7;
        float: right;
      }
      #search-hits header .tags > * {
        background: var(--c-bg-color);
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
