
const { Gio, GObject, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;


function init() {
}

const FsHyperlinksPrefsWidget = GObject.registerClass(
    class FsHyperlinksPrefsWidget extends Gtk.Box {
        _init() {
            super._init({
                orientation: Gtk.Orientation.VERTICAL,
                spacing: 6,
                margin_top: 36,
                margin_bottom: 36,
                margin_start: 36,
                margin_end: 36,
                halign: Gtk.Align.FILL,
                hexpand: true,
            });
    // Use the same GSettings schema as in `extension.js`
    this.settings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.fshyperlinks');

    // Create the switch and bind its value to the `enable-path-map` key
    let row0 = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        hexpand: true,
        halign: Gtk.Align.FILL,
        spacing: 25,
    });
    const labelSwitchEnablePathMap = new Gtk.Label({
        label: "Enable Path Mapping",
        valign: Gtk.Align.CENTER,
        halign: Gtk.Align.START,
    });
    this.toggleEnablePathMap = new Gtk.Switch({
        active: this.settings.get_boolean ('enable-path-map'),
        valign: Gtk.Align.CENTER,
        hexpand: false,
        halign: Gtk.Align.END
    });
    this.settings.bind(
        'enable-path-map',
        this.toggleEnablePathMap,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );
    row0.add(labelSwitchEnablePathMap);
    row0.add(this.toggleEnablePathMap);
    // Create the switch and bind its value to the `enable-jump` key
    let row2 = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        hexpand: true,
        halign: Gtk.Align.FILL,
        spacing: 25,
    });
    const labelSwitchEnablePathJump = new Gtk.Label({
        label: "Enable Path Jumping",
        valign: Gtk.Align.CENTER,
        halign: Gtk.Align.START,
    });
    this.toggleEnablePathJump = new Gtk.Switch({
        active: this.settings.get_boolean ('enable-jump'),
        valign: Gtk.Align.CENTER,
        hexpand: false,
        halign: Gtk.Align.END,
        tooltip_text: "Hold Ctrl for insatnt jump. Alt+J to jump into path from selection"
    });
    this.settings.bind(
        'enable-jump',
        this.toggleEnablePathJump,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );
    row2.add(labelSwitchEnablePathJump);
    row2.add(this.toggleEnablePathJump);
    // Create the textfield and bind its value to the `path-map` key
    let row1 = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        hexpand: true,
        halign: Gtk.Align.FILL,
        spacing: 25,
    });
    const labelPathMatp = new Gtk.Label({
        label: "Path Map",
        valign: Gtk.Align.CENTER,
        halign: Gtk.Align.START,
    });
    this.textMap = new Gtk.Entry({
        valign:  Gtk.Align.CENTER,
        hexpand: true,
    });
    this.textMap.buffer.text = this.settings.get_string ('path-map');
    this.settings.bind(
        'path-map',
        this.textMap.buffer,
        'text',
        Gio.SettingsBindFlags.DEFAULT
    );
    row1.add(labelPathMatp);
    row1.add(this.textMap);
    // Add the switch to the row

    this.add(row0);
    this.add(row2);
    this.add(row1);
    this.show_all();

}
});

function buildPrefsWidget() {
    return new FsHyperlinksPrefsWidget();
}
