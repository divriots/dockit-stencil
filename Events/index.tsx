/* @jsx h */
import { h } from '@stencil/core';
import type { DocsEvent } from '../doc-utils';
import { preData, docsField, getType, getMeta } from '../doc-utils';

export default ({ tag, stats }) => (
  <table style={{ tableLayout: 'auto' }}>
    <thead>
      <tr>
        <th>Event</th>
        <th>Description</th>
        <th>Type(s)</th>
        <th>Cancelable</th>
      </tr>
    </thead>
    <tbody>
      {getMeta(tag, stats)?.events?.map((e: DocsEvent) => (
        <tr key={e.name}>
          <td>{e.name}</td>
          <td>{docsField(e)}</td>
          <td>{preData(getType(e))}</td>
          <td>{String(e.cancelable)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
