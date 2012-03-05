/* -*- mode: js2 - indent-tabs-mode: nil - js2-basic-offset: 4 -*- */
const DBus = imports.dbus;
const Lang = imports.lang;
const St = imports.gi.St;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
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
let indicationmenu;

//Icon variables for easy editing/customization:
let DisabledIcon = 'preferences-desktop-screensaver-symbolic';
let EnabledIcon = 'system-run-symbolic';
////An alternative icon could be:
//let EnabledIcon = 'action-unavailable-symbolic';

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

        //Add the Inhibit Option
        this._inhibitswitch = new PopupMenu.PopupSwitchMenuItem(_("Inhibit Suspend"), false);
        this.menu.addMenuItem(this._inhibitswitch);
        this._inhibit = undefined;
        this._sessionProxy = new SessionProxy(DBus.session, 'org.gnome.SessionManager', '/org/gnome/SessionManager');

        this._onInhibit = function(cookie) {
                this._inhibit = cookie;
        };

        this._inhibitswitch.connect('toggled', Lang.bind(this, function() {
                if(this._inhibit) {
                        this._sessionProxy.UninhibitRemote(this._inhibit);
                        this._inhibit = undefined;
                        this.setIcon(DisabledIcon);
                } else {
                        try {
                                this._sessionProxy.InhibitRemote("inhibitor",
                                        0, 
                                        "inhibit mode",
                                        9,
                                Lang.bind(this, this._onInhibit));
                                this.setIcon(EnabledIcon);
                        } catch(e) {
                                //
                        }
                }
        }));
    },
};

function disable() {
	indicationmenu.destroy();
}
