/* -*- mode: js2 - indent-tabs-mode: nil - js2-basic-offset: 4 -*- */
const DBus = imports.dbus;
const Lang = imports.lang;
const St = imports.gi.St;
const Gio = imports.gi.Gio;

const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const GnomeSession = imports.misc.gnomeSession;
const UserMenu = imports.ui.userMenu;

const Gettext = imports.gettext.domain('gnome-shell-extensions');
const _ = Gettext.gettext;
const POWER_SCHEMA = 'org.gnome.settings-daemon.plugins.power';
const POWER_KEY = 'active';

// Put your extension initialization code here
function init(extensionMeta) {
    imports.gettext.bindtextdomain("gnome-shell-extension-presentationmode",
                           extensionMeta.path + "/locale");
    imports.gettext.textdomain("gnome-shell-extension-presentationmode");
}

function enable() {
    let batteryMenu = Main.panel._statusArea.userMenu;

    batteryMenu._itemSeparator = new PopupMenu.PopupSeparatorMenuItem();
    batteryMenu.menu.addMenuItem(batteryMenu._itemSeparator);
    batteryMenu._powerSettings = new Gio.Settings({ schema: POWER_SCHEMA });
    var powerManagementFlag = batteryMenu._powerSettings.get_boolean(POWER_KEY);
    batteryMenu._presentationswitch = new PopupMenu.PopupSwitchMenuItem(_("Presentation mode"), !powerManagementFlag);
    batteryMenu.menu.addMenuItem(batteryMenu._presentationswitch);
    
    batteryMenu._presentationswitch.connect('toggled', Lang.bind(batteryMenu, function() {
        var powerManagementFlag = batteryMenu._powerSettings.get_boolean(POWER_KEY);
        batteryMenu._powerSettings.set_boolean(POWER_KEY, !powerManagementFlag);
    }));
}

function disable() {
    let batteryMenu = Main.panel._statusArea.userMenu;

    batteryMenu._presentationswitch.destroy();
    batteryMenu._itemSeparator.destroy();
    if (batteryMenu._powerSettings) {
        batteryMenu._powerSettings.set_boolean(POWER_KEY, false);
    }
}