/* @jsx h */
import { Component, Prop, h } from '@stencil/core';
import type { DocsEvent } from '../doc-utils';
import { preData, docsField, getType, getMeta } from '../doc-utils';

@Component({ tag: 'table-events' })
class DocEventTable {
  @Prop() tag: any;

  render() {
    return (
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
          {getMeta(this.tag).events?.map((e: DocsEvent) => (
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
  }
}
