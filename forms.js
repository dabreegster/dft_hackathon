"use strict";

export function dropdown(props, key, label, values) {
  var html = `<div>`;
  html += `<label for="${key}">${label}</label>`;
  html += `<select id="${key}">`;
  html += `<option></option>`;
  for (const val of values) {
    const selected = props[key] == val ? "selected" : "";
    html += `<option value="${val}" ${selected}>${val}</option>`;
  }
  html += `</select>`;
  html += `</div>`;
  return html;
}

