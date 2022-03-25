/* @jsx h */
import { Component, Prop, h } from '@stencil/core';
import type { DocsProp } from '../doc-utils';
import { preData, docsField, getType, getMeta } from '../doc-utils';

@Component({ tag: 'table-props' })
class DocPropsTable {
  @Prop() tag: any;

  render() {
    return (
      <table style={{ tableLayout: 'auto' }}>
        <thead>
          <tr>
            <th>Property</th>
            <th>Attribute</th>
            <th>Description</th>
            <th>Type(s)</th>
            <th>Default</th>
            <th>Required</th>
          </tr>
        </thead>
        <tbody>
          {getMeta(this.tag).properties?.map((prop: DocsProp) => (
            <tr key={prop.name}>
              <td>{prop.name}</td>
              <td>{prop.attribute}</td>
              <td>{docsField(prop)}</td>
              <td>{preData(getType(prop))}</td>
              <td>{preData(String(prop.defaultValue))}</td>
              <td>{prop.required && String(prop.required)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
