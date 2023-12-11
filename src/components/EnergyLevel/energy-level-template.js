(function () {
  const template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host {
        display: block;
      }
      :host([hidden]) {
        display: none;
      }
      :host([disabled]) {
        opacity: 0.4;
      }
      .enc {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .enc-item {
        width: calc((100% - 11px) / 12);
        height: 8px;
        background: #D6D6D6;
        transition: all 300ms linear;
      }
      .enc-item:nth-child(1) {
        border-radius: 3px 0px 0px 3px;
      }
      .enc-item:nth-child(12) {
        border-radius: 0px 3px 3px 0px;
      }
      :host([level="1"]) .enc-item:nth-child(1),
      :host([level="2"]) .enc-item:nth-child(1),
      :host([level="2"]) .enc-item:nth-child(2),
      :host([level="3"]) .enc-item:nth-child(1),
      :host([level="3"]) .enc-item:nth-child(2),
      :host([level="3"]) .enc-item:nth-child(3),
      :host([level="4"]) .enc-item:nth-child(1),
      :host([level="4"]) .enc-item:nth-child(2),
      :host([level="4"]) .enc-item:nth-child(3),
      :host([level="4"]) .enc-item:nth-child(4),
      :host([level="5"]) .enc-item:nth-child(1),
      :host([level="5"]) .enc-item:nth-child(2),
      :host([level="5"]) .enc-item:nth-child(3),
      :host([level="5"]) .enc-item:nth-child(4),
      :host([level="5"]) .enc-item:nth-child(5),
      :host([level="6"]) .enc-item:nth-child(1),
      :host([level="6"]) .enc-item:nth-child(2),
      :host([level="6"]) .enc-item:nth-child(3),
      :host([level="6"]) .enc-item:nth-child(4),
      :host([level="6"]) .enc-item:nth-child(5),
      :host([level="6"]) .enc-item:nth-child(6),
      :host([level="7"]) .enc-item:nth-child(1),
      :host([level="7"]) .enc-item:nth-child(2),
      :host([level="7"]) .enc-item:nth-child(3),
      :host([level="7"]) .enc-item:nth-child(4),
      :host([level="7"]) .enc-item:nth-child(5),
      :host([level="7"]) .enc-item:nth-child(6),
      :host([level="7"]) .enc-item:nth-child(7),
      :host([level="8"]) .enc-item:nth-child(1),
      :host([level="8"]) .enc-item:nth-child(2),
      :host([level="8"]) .enc-item:nth-child(3),
      :host([level="8"]) .enc-item:nth-child(4),
      :host([level="8"]) .enc-item:nth-child(5),
      :host([level="8"]) .enc-item:nth-child(6),
      :host([level="8"]) .enc-item:nth-child(7),
      :host([level="8"]) .enc-item:nth-child(8),
      :host([level="9"]) .enc-item:nth-child(1),
      :host([level="9"]) .enc-item:nth-child(2),
      :host([level="9"]) .enc-item:nth-child(3),
      :host([level="9"]) .enc-item:nth-child(4),
      :host([level="9"]) .enc-item:nth-child(5),
      :host([level="9"]) .enc-item:nth-child(6),
      :host([level="9"]) .enc-item:nth-child(7),
      :host([level="9"]) .enc-item:nth-child(8),
      :host([level="9"]) .enc-item:nth-child(9),
      :host([level="10"]) .enc-item:nth-child(1),
      :host([level="10"]) .enc-item:nth-child(2),
      :host([level="10"]) .enc-item:nth-child(3),
      :host([level="10"]) .enc-item:nth-child(4),
      :host([level="10"]) .enc-item:nth-child(5),
      :host([level="10"]) .enc-item:nth-child(6),
      :host([level="10"]) .enc-item:nth-child(7),
      :host([level="10"]) .enc-item:nth-child(8),
      :host([level="10"]) .enc-item:nth-child(9),
      :host([level="10"]) .enc-item:nth-child(10),
      :host([level="11"]) .enc-item:nth-child(1),
      :host([level="11"]) .enc-item:nth-child(2),
      :host([level="11"]) .enc-item:nth-child(3),
      :host([level="11"]) .enc-item:nth-child(4),
      :host([level="11"]) .enc-item:nth-child(5),
      :host([level="11"]) .enc-item:nth-child(6),
      :host([level="11"]) .enc-item:nth-child(7),
      :host([level="11"]) .enc-item:nth-child(8),
      :host([level="11"]) .enc-item:nth-child(9),
      :host([level="11"]) .enc-item:nth-child(10),
      :host([level="11"]) .enc-item:nth-child(11),
      :host([level="12"]) .enc-item:nth-child(1),
      :host([level="12"]) .enc-item:nth-child(2),
      :host([level="12"]) .enc-item:nth-child(3),
      :host([level="12"]) .enc-item:nth-child(4),
      :host([level="12"]) .enc-item:nth-child(5),
      :host([level="12"]) .enc-item:nth-child(6),
      :host([level="12"]) .enc-item:nth-child(7),
      :host([level="12"]) .enc-item:nth-child(8),
      :host([level="12"]) .enc-item:nth-child(9),
      :host([level="12"]) .enc-item:nth-child(10),
      :host([level="12"]) .enc-item:nth-child(11),
      :host([level="12"]) .enc-item:nth-child(12) {
          background: #20C004;
          transition: none;
      }
    </style>
    <div class="enc">
      <div class="enc-item"></div>
      <div class="enc-item"></div>
      <div class="enc-item"></div>
      <div class="enc-item"></div>
      <div class="enc-item"></div>
      <div class="enc-item"></div>
      <div class="enc-item"></div>
      <div class="enc-item"></div>
      <div class="enc-item"></div>
      <div class="enc-item"></div>
      <div class="enc-item"></div>
      <div class="enc-item"></div>
    </div>
  `;

  class EnergyLevel extends HTMLElement {
    static get observedAttributes() {
      return ["level"];
    }

    attributeChangedCallback(name, oldValue, newValue) {}

    connectedCallback() {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    disconnectedCallback() {}
  }

  window.customElements.define("energy-level", EnergyLevel);
})();
