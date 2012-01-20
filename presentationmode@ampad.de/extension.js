/* -*- mode: js2 - indent-tabs-mode: nil - js2-basic-offset: 4 -*- */
const DBus = imports.dbus;
const Lang = imports.lang;
const St = imports.gi.St;

const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const GnomeSession = imports.misc.gnomeSession;
const UserMenu = imports.ui.userMenu;

const Gettext = imports.gettext.domain('gnome-shell-extension-presentationmode');
const _ = Gettext.gettext;

const SessionIface = {
    name: "org.gnome.SessionManager",
    methods: [ 
    { name: "Inhibit", inSignature: "susu", outSignature: "u" },
    { name: "Uninhibit", inSignature: "u", outSignature: "" }
    ]
};
let SessionProxy = DBus.makeProxyClass(SessionIface);

// Put your extension initialization code here
function init(extensionMeta) {
    imports.gettext.bindtextdomain("gnome-shell-extension-presentationmode",
                           extensionMeta.path + "/locale");
}

function enable() {
    let batteryMenu = Main.panel._statusArea.battery;

    batteryMenu._itemSeparator = new PopupMenu.PopupSeparatorMenuItem();
    batteryMenu.menu.addMenuItem(batteryMenu._itemSeparator);
    batteryMenu._presentationswitch = new PopupMenu.PopupSwitchMenuItem(_("Presentation mode"), false);
    batteryMenu.menu.addMenuItem(batteryMenu._presentationswitch);
    batteryMenu._inhibit = undefined;
    batteryMenu._sessionProxy = new SessionProxy(DBus.session, 'org.gnome.SessionManager', '/org/gnome/SessionManager');

    batteryMenu._onInhibit = function(cookie) {
        batteryMenu._inhibit = cookie;
    };

    batteryMenu._presentationswitch.connect('toggled', Lang.bind(batteryMenu, function() {
        if(batteryMenu._inhibit) {
            batteryMenu._sessionProxy.UninhibitRemote(batteryMenu._inhibit);
            batteryMenu._inhibit = undefined;
            } else {
                try {
                    batteryMenu._sessionProxy.InhibitRemote("presentor",
                        0, 
                        "Presentation mode",
                        9,
                        Lang.bind(batteryMenu, batteryMenu._onInhibit));
                } catch(e) {
                    //
                }
            }
    }));
}

function disable() {
    let batteryMenu = Main.panel._statusArea.battery;

    batteryMenu._presentationswitch.destroy();
    batteryMenu._itemSeparator.destroy();
    if(batteryMenu._inhibit) {
        batteryMenu._sessionProxy.UninhibitRemote(batteryMenu._inhibit);
        batteryMenu._inhibit = undefined;
        }
}
