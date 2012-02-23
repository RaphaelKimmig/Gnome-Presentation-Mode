/* -*- mode: js2 - indent-tabs-mode: nil - js2-basic-offset: 4 -*- */
const DBus = imports.dbus;
const Lang = imports.lang;
const St = imports.gi.St;

const Main = imports.ui.main;
const Mainloop = imports.mainloop;
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

function init(extensionMeta) {
    parentMenu = undefined; //Initialize to undefined
    imports.gettext.bindtextdomain("gnome-shell-extension-inhibitapplet",
                           extensionMeta.path + "/locale");
}

function enable() {
    if(parentMenu == undefined){ //Hack to fix issue #1, refresh after 5 seconds
        Mainloop.timeout_add_seconds(5, Lang.bind(this, function() {
                this.disable();
                this.enable();}));
    }
    //Check if battery menu is invisible
    if(!Main.panel._statusArea.battery.actor.get_paint_visibility())
    {   //check for no battery or power device, i.e. no battery menu
        if(Main.panel._statusArea.a11y != null)
        {   //check for no a11y (such as from noa11y extension)
            parentMenu = Main.panel._statusArea.a11y;
        }
        else {   //else wise, resort to using the user menu
            parentMenu = Main.panel._statusArea.userMenu;
        }
    }
    else {   //If all else is good, the battery menu is fine
        parentMenu = Main.panel._statusArea.battery;
    }
    //Add the Inhibit Option
    parentMenu._itemSeparator = new PopupMenu.PopupSeparatorMenuItem();
    parentMenu.menu.addMenuItem(parentMenu._itemSeparator);
    parentMenu._inhibitswitch = new PopupMenu.PopupSwitchMenuItem(_("Inhibit Suspend"), false);
    parentMenu.menu.addMenuItem(parentMenu._inhibitswitch);
    parentMenu._inhibit = undefined;
    parentMenu._sessionProxy = new SessionProxy(DBus.session, 'org.gnome.SessionManager', '/org/gnome/SessionManager');

    parentMenu._onInhibit = function(cookie) {
        parentMenu._inhibit = cookie;
    };

    parentMenu._inhibitswitch.connect('toggled', Lang.bind(parentMenu, function() {
        if(parentMenu._inhibit) {
            parentMenu._sessionProxy.UninhibitRemote(parentMenu._inhibit);
            parentMenu._inhibit = undefined;
            } else {
                try {
                    parentMenu._sessionProxy.InhibitRemote("inhibitor",
                        0, 
                        "inhibit mode",
                        9,
                        Lang.bind(parentMenu, parentMenu._onInhibit));
                } catch(e) {
                    //
                }
            }
    }));
}

function disable() {
    parentMenu._inhibitswitch.destroy();
    parentMenu._itemSeparator.destroy();
    if(parentMenu._inhibit) {
        parentMenu._sessionProxy.UninhibitRemote(parentMenu._inhibit);
        parentMenu._inhibit = undefined;
        }
}
