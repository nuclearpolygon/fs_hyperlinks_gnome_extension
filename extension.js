const {
    Gdk,
    Clutter,
    St,
    Gtk
} = imports.gi;
const Gio = imports.gi.Gio;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;


class MyExtension {
    constructor() {
        this._init();
    }

    _init() {
        this.clickEventId = 0;
        this._indicator = null;
    }

    enable() {
        this.settings = ExtensionUtils.getSettings(
            'org.gnome.shell.extensions.fshyperlinks');
        Main.wm.addKeybinding(
            "jump-path-from-cb",
            this.settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            (display, screen, window, binding) => {
                log('hokey pressed');
                this._clipboardChanged(true);
            }
        );
        this._getPathMapDict();
        this.connectClickEvent();
        this._buildUI();
    }

    _buildUI() {
        // Create a panel button
        let indicatorName = `${Me.metadata.name} Indicator`;
        this._indicator = new PanelMenu.Button(0.0, indicatorName, false);
        // Add an icon
        let icon = new St.Icon({
            gicon: new Gio.ThemedIcon({
                name: 'mail-replied-symbolic'
            }),
            style_class: 'system-status-icon'
        });
        this._indicator.add_child(icon);

        // Create menu switch
        this._menuSection = new PopupMenu.PopupMenuSection();
        this._enableMapping = new PopupMenu.PopupSwitchMenuItem(
            "Enable Path Map",
            this.settings.get_boolean('enable-path-map'), {}
        );
        this._enableJump = new PopupMenu.PopupSwitchMenuItem(
            "Enable Jump",
            this.settings.get_boolean('enable-jump'), {}
        );
        this._menuSection.addMenuItem(this._enableMapping);
        this._menuSection.addMenuItem(this._enableJump);
        this._indicator.menu.addMenuItem(this._menuSection);

        // `Main.panel` is the actual panel you see at the top of the screen,
        // not a class constructor.
        Main.panel.addToStatusArea(indicatorName, this._indicator);
    }

    disable() {
        // global.log("Extension disabled!");
        this.disconnectClickEvent();
        this.clickEventId = null;
        this._indicator.destroy();
        this._indicator = null;
        this.settings = null;
        this._clipboard = null;
        this._selection = null;
        Main.wm.removeKeybinding("jump-path-from-cb");
    }


    connectClickEvent() {
        this._selection = global.display.get_selection();
        this._clipboard = St.Clipboard.get_default();
        this._ownerChangedId = this._selection.connect('owner-changed', () => {
            this._clipboardChanged();

        });
    }

    disconnectClickEvent() {
        this._selection.disconnect(this._ownerChangedId);
    }

    _clipboardChanged(force = false) {
        this._clipboard.get_text(St.ClipboardType.PRIMARY,
            (clipboard, text) => {
                const findPathProps = this._detectPath(text);
                if (findPathProps["detect"]) {
                    let path = findPathProps["path"];
                    const [x, y, state] = global.get_pointer();
                    if (findPathProps["platform"] == "unix") {
                        if ((this._enableJump.state & state == 20) | force) {
                            Gio.Subprocess.new(["xdg-open", `${path}`], Gio.SubprocessFlags.NONE);
                        }
                    } else {
                        if (this._enableMapping.state) {
                            path = this._mapPath(path);
                            this._clipboard.set_text(St.ClipboardType.PRIMARY, path);
                        }
                        if ((this._enableJump.state & state == 20) | force) {
                            Gio.Subprocess.new(["xdg-open", `${path}`], Gio.SubprocessFlags.NONE);
                        }
                    }
                }
            });
    }

    _getPathMapDict() {
        const pathMapString = this.settings.get_string('path-map');
        const entries = pathMapString.split(";");
        this._pathMapDict = {};
        for (const i in entries) {
            const [key, val] = entries[i].split("->");
            this._pathMapDict[key] = val;
        }
    }

    _detectPath(text) {
        const regexUnix = new RegExp(/(\/[\w -|+]*)/g);
        const regexWin = new RegExp(/[A-Z]:\\[\w -|+]*/g);
        let reU;
        let reW;
        reU = regexUnix.exec(text);
        reW = regexWin.exec(text);
        let findPathProps = {};
        findPathProps["platform"] = reU != null ? "unix" : "win";
        findPathProps["path"] = reU != null ? reU[0] : reW != null ? reW[0] : "";
        findPathProps["detect"] = reU != null | reW != null;
        return findPathProps;
    }

    _mapPath(path) {
        let mappedPath = "";
        const keys = Object.keys(this._pathMapDict);
        for (const i in keys) {
            const key = keys[i];
            const r = key.replace("\\", "\\\\");
            const regex = new RegExp(`^${r}`);
            if (regex.exec(path)) {
                mappedPath = path.replace(regex, this._pathMapDict[key]);
                const re = RegExp(/\\/g);
                mappedPath = mappedPath.replace(re, "/");
                return mappedPath;
            }
        }
        return path;
    }
}

function init() {
    return new MyExtension();
}