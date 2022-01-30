/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class StellaActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["stella", "sheet", "actor"],
      template: "systems/stellaknights/templates/actor-sheet.html",
      width: 800,
      height: 800,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  get template() {
    const path = "systems/stellaknights/templates";
    return `${path}/${this.actor.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData(options) {
    let isOwner = false;
    let isEditable = this.isEditable;
    let data = super.getData(options);
    let items = {};
    let actorData = {};

    isOwner = this.document.isOwner;
    isEditable = this.isEditable;

    // The Actor's data
    actorData = this.actor.data.toObject(false);
    data.actor = actorData;
    data.data = actorData.data;

    // Owned Items
    data.items = actorData.items;
    for ( let i of data.items ) {
      const item = this.actor.items.get(i._id);
      i.labels = item.labels;
    }
    data.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    data.dtypes = ["String", "Number", "Boolean"];

    actorData.ability = [ null, null, null, null, null, null ];
    for (let i of data.actor.items) {
      var num = i.data.number;

      if (num >= 1 && num <= 6 && actorData.ability[num - 1] == null)
        actorData.ability[num - 1] = i;
    }


    console.log(data);

    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Owned Item management
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
    });

    html.find('.charge-change').click(this._changeItemCharge.bind(this));

    // Talent
    html.find('.item-label').click(this._showItemDetails.bind(this));
    html.find(".echo-item").click(this._echoItemDescription.bind(this));


    if (this.actor.owner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }

  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options={}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height-300;
    sheetBody.css("height", bodyHeight);
    return position;
  }


    /* -------------------------------------------- */
  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;

    const name = `New ${type.capitalize()}`;
    const itemData = {
      name: name,
      type: type
    };
    await this.actor.createEmbeddedDocuments('Item', [itemData], {});
  }

  _showItemDetails(event) {
    event.preventDefault();
    const toggler = $(event.currentTarget);
    const item = toggler.parents('.item');
    const description = item.find('.item-description');

    toggler.toggleClass('open');
    description.slideToggle();
  }

  _echoItemDescription(event) {
    event.preventDefault();
    const item = this.actor.items.get($(event.currentTarget).parents('.item')[0].dataset.itemId);
    if (item == null)
      return;
    const itemData = item.data.data;

    var content = "<h2><b>" + item.name + "</b></h2>"
    content += `<table>
                  <tr style="text-align: center">
                    <th>${game.i18n.localize("Stella.Class")}</th>
                    <th>${game.i18n.localize("Stella.Timing")}</th>
                  </tr>
                  <tr style="text-align: center">
                    <td>${itemData.class}</td>
                    <td>${itemData.timing}</td>
                  </tr>
                  <tr style="text-align: center">
                    <th colspan="2">${game.i18n.localize("Stella.Effect")}</th>
                  </tr>
                  <tr>
                    <td colspan="2">${itemData.effect}</td>
                  </tr>
                  <tr style="text-align: center">
                    <th colspan="2">${game.i18n.localize("Stella.Word")}</th>
                  </tr>
                  <tr>
                    <td colspan="2">${itemData.word}</td>
                  </tr>

                </table>`


    // GM rolls.
    let chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: content
    };

    ChatMessage.create(chatData);

  }

  async _changeItemCharge(event) {
    event.preventDefault();
    const chargeButton = $(event.currentTarget);
    const item = this.actor.items.get(chargeButton.parents('.item')[0].dataset.itemId);

    console.log(chargeButton.parents('.item')[0].dataset);

    const add = Number(event.currentTarget.dataset.add);
    const num = Number(item.data.data.charge);

    if (num + add < 0)
      return;

    await item.update({"data.charge": num + add});
  }



}
