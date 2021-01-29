/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class StellaItemSheet extends ItemSheet {

  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
			classes: ["stella", "sheet", "item"],
			width: 520,
			height: 480,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}]
		});
  }

  /* -------------------------------------------- */

  /** @override */
  get template() {
    const path = "systems/stellaknights/templates";
    return `${path}/${this.item.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options={}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

  }


}
