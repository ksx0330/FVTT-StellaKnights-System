/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

// Import Modules
import { StellaItemSheet } from "./item-sheet.js";
import { StellaActorSheet } from "./actor-sheet.js";
import { BouquetDialog } from "./bouquet-dialog.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
    console.log(`Initializing Simple Stella Knights System`);

	game.stellaknights = {
        distributeBouquet,
        BouquetDialog: []
	  };

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("stella", StellaActorSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("stella", StellaItemSheet, {makeDefault: true});

    Handlebars.registerHelper('incremented', function(index) {
        return ++index;
    });

    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('ifOrEquals', function(arg1, arg2, arg3, arg4, options) {
        return (arg1 == arg2 || arg3 == arg4) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('ifSuccess', function(arg1, arg2, options) {
        return (arg1 >= arg2) ? options.fn(this) : options.inverse(this);
    });
});

Hooks.on("updateActor", function() {
    game.stellaknights.BouquetDialog = game.stellaknights.BouquetDialog.filter(e => e._state != -1);
    var viewers = game.stellaknights.BouquetDialog;

    if (viewers.length != 0) {
        for (let viewer of viewers)
            viewer.render(true);
    }

});

Hooks.on("getSceneControlButtons", function(controls) {
    controls[0].tools.push({
        name: "bouquet",
        title: "Distribute Bouquet",
        icon: "fas fa-smile",
        visible: true,
        onClick: () => game.stellaknights.distributeBouquet(),
        button: true
    });

});

function distributeBouquet() {
    var actors = game.data.actors.filter(element => element.type == "bringer" && (element.permission['default'] == 3 ) );

    let dialog = new BouquetDialog(actors)
    dialog.render(true);
}



