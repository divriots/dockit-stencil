/* @jsx h */
import { h } from '@stencil/core';
import '@divriots/dockit-core/layout/dockit-layout.define.js';
import { styles } from '@divriots/dockit-core/layout';
import { search } from '@divriots/dockit-core/search';
import '@divriots/dockit-core/search/dockit-search.define';

export default ({ __context, logo: Logo }, children) => (
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
        {typeof Logo === string ? <img src={Logo} /> : <Logo />}
      </div>
      <doc-search
        slot="topbar"
        search={(query) => search(query, __context)}
      ></doc-search>
      <div class="prose dark:prose-invert">{children}</div>
    </dockit-layout>
  </div>
);
