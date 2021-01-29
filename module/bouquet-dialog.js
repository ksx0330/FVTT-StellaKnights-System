
export class BouquetDialog extends Dialog {
    constructor(actor, options) {
        super(options);

        this.actor = actor;
        this.data = {
            title: "Bouquet Dialog",
            content: "",
            buttons: {}
        };

        game.stellaknights.BouquetDialog.push(this);
    }

      /** @override */
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/stellaknights/templates/bouquet-dialog.html",
            classes: ["stella", "dialog"],
            width: 350
        });
    }

    /** @override */
    getData() {
        let buttons = Object.keys(this.data.buttons).reduce((obj, key) => {
          let b = this.data.buttons[key];
          if ( b.condition !== false ) obj[key] = b;
          return obj;
        }, {});

        let actors = [];
        for (let a of this.actor) {
            var actor = game.actors.get(a._id);
            var bouquet = a.data.bouquet;

            actors.push({id: a._id, image: actor.img, name: a.name, bouquet: bouquet});
        }

        return {
            content: this.data.content,
            buttons: buttons,
            actors: actors
        }
    }

    
      /** @override */
	activateListeners(html) {
        super.activateListeners(html);

        html.find('.add-bouquet').on('mousedown', this._onAddBouquet.bind(this, html));
    }


    async _onAddBouquet(html, event) {
        var target = $(event.currentTarget);
        var actor = game.actors.get(target.parent()[0].dataset.id);

        var bouquet = actor.data.data.bouquet + 1;

        await actor.update({"data.bouquet": bouquet});
        var context = game.user.name + game.i18n.localize("Stella.Present") ;
        ChatMessage.create({content: context + " (" + bouquet + ")", user: game.user._id});
    }

}
