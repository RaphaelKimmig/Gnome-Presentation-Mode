/* -*- mode: js2 - indent-tabs-mode: nil - js2-basic-offset: 4 -*- */
const Lang = imports.lang;
const St = imports.gi.St;
const Gio = imports.gi.Gio;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Gettext = imports.gettext.domain('gnome-shell-extension-inhibitapplet');
const _ = Gettext.gettext;

const POWER_SCHEMA = 'org.gnome.settings-daemon.plugins.power';
const POWER_KEY = 'active';
const SCREEN_SCHEMA = 'org.gnome.desktop.screensaver';
const SCREEN_KEY = 'idle-activation-enabled';

let indicationmenu;
//Icon variables for easy editing/customization:
let DisabledIcon = 'preferences-desktop-screensaver-symbolic';
let EnabledIcon = 'system-run-symbolic';
////An alternative icon could be 'action-unavailable-symbolic'

function init(extensionMeta) {
    imports.gettext.bindtextdomain("gnome-shell-extension-inhibitapplet",
                           extensionMeta.path + "/locale");
}

function InhibitMenu() {
    this._init.apply(this, arguments);
}

function enable() {
    indicationmenu = new InhibitMenu();
    Main.panel.addToStatusArea('inhibit-menu', indicationmenu);
}

InhibitMenu.prototype = {
    __proto__: PanelMenu.SystemStatusButton.prototype,

    _init: function() {
        PanelMenu.SystemStatusButton.prototype._init.call(this, DisabledIcon);

        ///Power Setting
        InhibitMenu._powerSettings = new Gio.Settings({ schema: POWER_SCHEMA });
        var powerManagementFlag = InhibitMenu._powerSettings.get_boolean(POWER_KEY);
        ///ScreenSaver Setting
        InhibitMenu._screenSettings = new Gio.Settings({ schema: SCREEN_SCHEMA });
        //Make sure the screensaver enable is synchronized
        InhibitMenu._screenSettings.set_boolean(SCREEN_KEY, powerManagementFlag);

        //Add the Inhibit Option
        this._inhibitswitch = new PopupMenu.PopupSwitchMenuItem(_("Inhibit Suspend"), !powerManagementFlag);
        this.menu.addMenuItem(this._inhibitswitch);

        //Change Icon if necessary
        if(!powerManagementFlag) {
                this.setIcon(EnabledIcon);
        }

        this._inhibitswitch.connect('toggled', Lang.bind(this, function() {
                var powerManagementFlag = InhibitMenu._powerSettings.get_boolean(POWER_KEY);
                InhibitMenu._powerSettings.set_boolean(POWER_KEY, !powerManagementFlag);
                InhibitMenu._screenSettings.set_boolean(SCREEN_KEY, !powerManagementFlag);
                if(powerManagementFlag) {
                        this.setIcon(EnabledIcon);
                } else {
                        this.setIcon(DisabledIcon);
                }
        }));
    },
};

function disable() {
	indicationmenu.destroy();
        if (InhibitMenu._powerSettings) {
                InhibitMenu._powerSettings.set_boolean(POWER_KEY, true);
        }
        if (InhibitMenu._screenSettings) {
                InhibitMenu._screenSettings.set_boolean(SCREEN_KEY, true);
        }
}
