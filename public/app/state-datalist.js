import { states } from './states.js';

class StateDatalist extends HTMLElement {
  static get observedAttributes() {
    return [
      'country',
      'datalist-id'
    ];
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    let country = this.getAttribute('country') || '';
    let datalistId = this.getAttribute('datalist-id') || 'state-data-list';
    let countryStates = states[country.toLowerCase()] || [];

    this.innerHTML = `<datalist id="${datalistId}"></datalist>`;

    let stateDataList = this.querySelector(`#${datalistId}`);
    for (let state of countryStates) {
      let optionElement = document.createElement('option');
      optionElement.setAttribute('value', state);
      stateDataList.appendChild(optionElement);
    }
  }
}

window.customElements.define('state-datalist', StateDatalist);
