/* -*- mode: js2 - indent-tabs-mode: nil - js2-basic-offset: 4 -*- */
const DBus = imports.dbus;
const Lang = imports.lang;
const St = imports.gi.St;

const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const GnomeSession = imports.misc.gnomeSession;
const UserMenu = imports.ui.userMenu;

const Gettext = imports.gettext.domain('gnome-shell-extension-inhibitapplet');
const _ = Gettext.gettext;

const SessionIface = {
    name: "org.gnome.SessionManager",
    methods: [ 
    { name: "Inhibit", inSignature: "susu", outSignature: "u" },
    { name: "Uninhibit", inSignature: "u", outSignature: "" }
    ]
};
let SessionProxy = DBus.makeProxyClass(SessionIface);

// Initialization code here:
function init(extensionMeta) {
    //Default Value on batteryMenu, it maybe changed on enable()
    batteryMenu = Main.panel._statusArea.battery;
    
    imports.gettext.bindtextdomain("gnome-shell-extension-inhibitapplet",
                           extensionMeta.path + "/locale");
}

function enable() {
    //Temporary variable to check power devices
    let temp = Main.panel._statusArea.battery._deviceItems;
    if(temp == "")
    {   //check for no battery or power device, i.e. no battery menu
        if(Main.panel._statusArea.a11y != null)
        {   //check for no a11y (such as from noa11y extension)
            batteryMenu = Main.panel._statusArea.a11y;
        }
        else
        {   //else wise, resort to using the user menu
            batteryMenu = Main.panel._statusArea.userMenu;
        }
    }
    else
    {   //If all else is good, the battery menu is fine
        batteryMenu = Main.panel._statusArea.battery;
    }
    //Add the Inhibit Option
    batteryMenu._itemSeparator = new PopupMenu.PopupSeparatorMenuItem();
    batteryMenu.menu.addMenuItem(batteryMenu._itemSeparator);
    batteryMenu._inhibitswitch = new PopupMenu.PopupSwitchMenuItem(_("Inhibit Suspend"), false);
    batteryMenu.menu.addMenuItem(batteryMenu._inhibitswitch);
    batteryMenu._inhibit = undefined;
    batteryMenu._sessionProxy = new SessionProxy(DBus.session, 'org.gnome.SessionManager', '/org/gnome/SessionManager');

    batteryMenu._onInhibit = function(cookie) {
        batteryMenu._inhibit = cookie;
    };

    batteryMenu._inhibitswitch.connect('toggled', Lang.bind(batteryMenu, function() {
        if(batteryMenu._inhibit) {
            batteryMenu._sessionProxy.UninhibitRemote(batteryMenu._inhibit);
            batteryMenu._inhibit = undefined;
            } else {
                try {
                    batteryMenu._sessionProxy.InhibitRemote("inhibitor",
                        0, 
                        "inhibit mode",
                        9,
                        Lang.bind(batteryMenu, batteryMenu._onInhibit));
                } catch(e) {
                    //
                }
            }
    }));
}

function disable() {
    batteryMenu._inhibitswitch.destroy();
    batteryMenu._itemSeparator.destroy();
    if(batteryMenu._inhibit) {
        batteryMenu._sessionProxy.UninhibitRemote(batteryMenu._inhibit);
        batteryMenu._inhibit = undefined;
        }
}
