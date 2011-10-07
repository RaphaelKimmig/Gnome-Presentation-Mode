const DBus = imports.dbus;
const Main = imports.ui.main;
const Lang = imports.lang;
const PopupMenu = imports.ui.popupMenu;

const Gettext = imports.gettext;
const _ = Gettext.gettext;

const SessionIface = {
    name: "org.gnome.SessionManager",
    methods: [ 
    { name: "Inhibit", inSignature: "susu", outSignature: "u" },
    { name: "Uninhibit", inSignature: "u", outSignature: "" }
    ]
};
let SessionProxy = DBus.makeProxyClass(SessionIface);

function init(){};

function enable(extensionMeta) {
    Gettext.bindtextdomain("gnome-shell-extension-presentationmode",
                           extensionMeta.path + "/locale");
    Gettext.textdomain("gnome-shell-extension-presentationmode");

    let Power = Main.Panel.STANDARD_TRAY_ICON_SHELL_IMPLEMENTATION['battery'];

    Power.prototype.__init = Power.prototype._init;
    Power.prototype._init = function () {
        this.__init.apply(this, arguments);
        this._inhibit = undefined;
        this._sessionProxy = new SessionProxy(DBus.session, 'org.gnome.SessionManager', '/org/gnome/SessionManager');
        this._presentationswitch = new PopupMenu.PopupSwitchMenuItem(_("Presentation mode"), false);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this.menu.addMenuItem(this._presentationswitch);
        this._presentationswitch.connect('toggled', Lang.bind(this, function() {
            if(this._inhibit) {
                this._sessionProxy.UninhibitRemote(this._inhibit);
                this._inhibit = undefined;
            } else {
                try {
                    this._sessionProxy.InhibitRemote("presentor",
                        0, 
                        "Presentation mode",
                        9,
                        Lang.bind(this, this._onInhibit));
                } catch(e) {
                    //
                }
            }

        }));
    };
    Power.prototype._onInhibit = function(cookie) {
        this._inhibit = cookie;
    };
};

function main(){
    enable();
};