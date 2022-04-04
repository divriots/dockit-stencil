/* @jsx h */
import { h } from '@stencil/core';
import './search';
import '@divriots/dockit-core/layout/dockit-layout.define.js';
import { styles } from '@divriots/dockit-core/layout';
import { search } from './search-indexer';

export default ({ __context, logoURL }, children) => {
  const docs = __context.pages.map((p) => __context.base + p.input);
  const docSearch = (searchValue: string) => search(searchValue, docs);
  return (
    <div>
      <style innerHTML={styles}></style>
      <dockit-layout
        context={__context}
        on-color-scheme-change={({ detail }) => {
          detail.colorScheme === 'dark'
            ? document.documentElement.classList.add('dark')
            : document.documentElement.classList.remove('dark');
        }}
      >
        <div slot="logo" style={{ display: 'flex', height: '100%' }}>
          <img src={logoURL} />
        </div>
        <doc-search
          slot="topbar"
          search={docSearch}
          style={{ width: '80%' }}
        ></doc-search>
        <div class="prose dark:prose-invert">{children}</div>
      </dockit-layout>
    </div>
  );
};
