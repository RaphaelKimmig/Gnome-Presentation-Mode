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

let indicationbutton;
//Icon variables for easy editing/customization:
let DisabledIcon = 'preferences-desktop-screensaver-symbolic';
let EnabledIcon = 'system-run-symbolic';
////An alternative icon could be 'action-unavailable-symbolic'

const TOOLTIPON         = _("Suspend Inhibited");
const TOOLTIPOFF        = _("Suspend Enabled");
const ROLE              = 'inhibitbutton';

function InhibitButton() {
    this._init.apply(this, arguments);
}

InhibitButton.prototype = {
    __proto__: PanelMenu.ButtonBox.prototype,

    __proto__: PanelMenu.ButtonBox.prototype,

    _init: function(metadata, params)
    {
        PanelMenu.ButtonBox.prototype._init.call(this, {
            reactive:       true,
            can_focus:      true,
            track_hover:    true
        });

        this.temp = new St.Icon({
            icon_name:      DisabledIcon,
            icon_type:      St.IconType.SYMBOLIC,
            style_class:    'system-status-icon'
        });

        this.actor.add_actor(this.temp);

        this.actor.add_style_class_name('panel-status-button');
        this.actor.has_tooltip = true;
        this.actor.tooltip_text = TOOLTIPOFF;

        ///Power Setting
        this._powerSettings = new Gio.Settings({ schema: POWER_SCHEMA });
        var powerManagementFlag = this._powerSettings.get_boolean(POWER_KEY);
        ///ScreenSaver Setting
        this._screenSettings = new Gio.Settings({ schema: SCREEN_SCHEMA });
        //Make sure the screensaver enable is synchronized
        this._screenSettings.set_boolean(SCREEN_KEY, powerManagementFlag);
        //Change Icon if necessary
        if(!powerManagementFlag) {
                this.actor.tooltip_text = TOOLTIPON;
                this.temp.icon_name = EnabledIcon;
        }

        this.actor.connect('button-press-event', Lang.bind(this, function () {
                var powerManagementFlag = this._powerSettings.get_boolean(POWER_KEY);
                this._powerSettings.set_boolean(POWER_KEY, !powerManagementFlag);
                this._screenSettings.set_boolean(SCREEN_KEY, !powerManagementFlag);
                if(powerManagementFlag) {
                        this.actor.tooltip_text = TOOLTIPON;
                        this.temp.icon_name = EnabledIcon;
                } else {
                        this.actor.tooltip_text = TOOLTIPOFF;
                        this.temp.icon_name = DisabledIcon;
                }
        }));
        Main.panel._insertStatusItem(this.actor, 0);
        Main.panel._statusArea[ROLE] = this;
    },

    destroy: function() {
        if (this._powerSettings) {
                this._powerSettings.set_boolean(POWER_KEY, true);
        }
        if (this._screenSettings) {
                this._screenSettings.set_boolean(SCREEN_KEY, true);
        }

        Main.panel._statusArea[ROLE] = null;

        this.actor._delegate = null;
        this.actor.destroy();
        this.actor.emit('destroy');
    }
};

function init(extensionMeta) {
    imports.gettext.bindtextdomain("gnome-shell-extension-inhibitapplet",
                           extensionMeta.path + "/locale");
}

function enable() {
        indicationbutton = new InhibitButton();
}

function disable() {
	indicationbutton.destroy();
}
