/* @jsx h */
import { h } from '@stencil/core';

export const getMeta = (tag: string, stats?: any): DocMeta =>
  stats?.components.find((c) => c.tag === tag) ||
  (customElements.get(tag) as any)?.COMPILER_META;

export const preData = (data: any) => (
  <pre>
    <code style={{ display: 'inline-flex', whiteSpace: 'pre-wrap' }}>
      {data}
    </code>
  </pre>
);

export const docsField = (prop: WithDocs) => (
  <span>
    {prop.deprecation !== undefined && (
      <span>
        <span style={{ color: 'red' }}>**[DEPRECATED ]**</span>{' '}
        {prop.deprecation}
        <br />
        <br />
      </span>
    )}
    {prop.docs.text}
  </span>
);

export const getType = (data: WithType) =>
  data.complexType?.original || data.type || 'undefined';

export type WithType = {
  type: string;
  complexType: { original: string; resolved: string };
};

export type WithDocs = {
  docs: { text: string };
  deprecation: string;
};

export type DocsProp = {
  required: boolean;
  name: string;
  attribute: string;
  defaultValue: any;
} & WithType &
  WithDocs;

export type DocsEvent = {
  cancelable: boolean;
  name: string;
} & WithType &
  WithDocs;

export type DocsMeta = {
  properties?: DocsProp[];
  events?: DocsEvent[];
};
