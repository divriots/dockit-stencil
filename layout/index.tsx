/* @jsx h */
import { Component, Prop, h } from '@stencil/core';
import '@divriots/dockit-core/layout/dockit-layout.define.js';
import { styles } from '@divriots/dockit-core/layout';

export default ({ __context, logoURL }, children) => (
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
      <div slot="logo">
        <img src={logoURL} />
      </div>
      <div class="prose dark:prose-invert">{children}</div>
    </dockit-layout>
  </div>
);
