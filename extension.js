const {Gdk, Clutter, St, Gtk} = imports.gi;
const Gio = imports.gi.Gio;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

class MyExtension {
  constructor() {
    this._init();
    this.clickEventId = 0;
    this._indicator = null;
  }

  _init() {
    global.log("Extension initialized!");
  }

  enable() {
    global.log("Extension enabled!");
    this.settings = ExtensionUtils.getSettings(
      'org.gnome.shell.extensions.fshyperlinks');
    this.connectClickEvent();    
    this._buildUI();

  }

  _buildUI() {
    let indicatorName = `${Me.metadata.name} Indicator`;
    // Create a panel button
    this._indicator = new PanelMenu.Button(0.0, indicatorName, false);
    // Add an icon
    let icon = new St.Icon({
        gicon: new Gio.ThemedIcon({name: 'mail-replied-symbolic'}),
        style_class: 'system-status-icon'
    });
    this._indicator.add_child(icon);

    // Create menu switch
    this._menuSection = new PopupMenu.PopupMenuSection();
    this._enableMapping = new PopupMenu.PopupSwitchMenuItem(
      "Enable Path Map",
      this.settings.get_boolean ('enable-path-map'),
      {}
      // valign: Gtk.Align.CENTER,
      // hexpand: false,
      // halign: Gtk.Align.END
    );
    this._enableJump = new PopupMenu.PopupSwitchMenuItem(
      "Enable Jump",
      this.settings.get_boolean ('enable-jump'),
      {}
      // valign: Gtk.Align.CENTER,
      // hexpand: false,
      // halign: Gtk.Align.END
    );
    this._menuSection.addMenuItem(this._enableMapping);
    this._menuSection.addMenuItem(this._enableJump);
    this._indicator.menu.addMenuItem(this._menuSection);

    // `Main.panel` is the actual panel you see at the top of the screen,
    // not a class constructor.
    Main.panel.addToStatusArea(indicatorName, this._indicator);
  }

  disable() {
    global.log("Extension disabled!");
    this.disconnectClickEvent();
    this.clickEventId = null;
    this._indicator.destroy();
    this._indicator = null;
  }

	getMousePosition() {
		const [x, y, state] = global.get_pointer();
		return { x: x, y: x, state: state};
	}

	connectClickEvent() {
    log("connecting signals")
    this._selection = global.display.get_selection();
    this._clipboard = St.Clipboard.get_default();
    this._ownerChangedId = this._selection.connect('owner-changed', () => {
      log('selection changed');
      this._clipboardChanged();

    });
    // Gio.get_bus(Gio.BusType.SESSION, none, )
	}

	disconnectClickEvent() {
    log("disconnecting signals");
    this._selection.disconnect(this._ownerChangedId);
	}
  _clipboardChanged() {
    this._clipboard.get_text(St.ClipboardType.PRIMARY,
        (clipboard, text) => {
          log(text);
        });
}
}

function init() {
  return new MyExtension();
}